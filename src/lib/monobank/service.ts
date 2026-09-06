import { getMonobankConfig } from "@/lib/monobank/config";
import { createMonobankClient } from "@/lib/monobank/client";
import { MonobankApiError, monobankUserMessage } from "@/lib/monobank/errors";
import { ingestProviderTransaction } from "@/lib/monobank/ingest";
import type {
  MonoAuthRequestResponse,
  MonoClientInfo,
  MonoStatementItem,
  MonoWebhookPayload,
} from "@/lib/monobank/types";
import { prisma } from "@/lib/prisma";

const CATCH_UP_SECONDS = 60 * 60;
const STATEMENT_MAX_SECONDS = 2_682_000;

export interface MonobankService {
  createAuthorization(userId: string): Promise<{ acceptUrl: string }>;
  verifyAuthorization(requestId: string): Promise<boolean>;
  getClientInfo(requestId: string): Promise<MonoClientInfo>;
  getStatement(requestId: string, accountId: string, from: number, to?: number): Promise<MonoStatementItem[]>;
  setWebhook(requestId: string, url: string): Promise<void>;
  disconnect(userId: string): Promise<void>;
}

export async function createAuthorization(userId: string) {
  const config = getMonobankConfig();
  const client = createMonobankClient();
  const result = await client.request<MonoAuthRequestResponse>({
    method: "POST",
    resource: "/personal/auth/request",
    callback: config.callbackUrl,
  });

  await prisma.monobankConnection.upsert({
    where: { userId },
    create: {
      userId,
      requestId: result.tokenRequestId,
      status: "pending",
    },
    update: {
      requestId: result.tokenRequestId,
      status: "pending",
      connectedAt: null,
      clientName: null,
      selectedAccountId: null,
      lastStatementTime: null,
    },
  });

  return { acceptUrl: result.acceptUrl };
}

export async function verifyAuthorization(requestId: string) {
  const connection = await prisma.monobankConnection.findUnique({ where: { requestId } });
  if (!connection) {
    return false;
  }

  const client = createMonobankClient();
  try {
    await client.request({
      method: "GET",
      resource: "/personal/auth/request",
      requestId,
    });
  } catch (error) {
    if (error instanceof MonobankApiError && error.status === 401) {
      return false;
    }
    if (error instanceof MonobankApiError && error.status === 404) {
      await prisma.monobankConnection.update({
        where: { requestId },
        data: { status: "failed" },
      });
      return false;
    }
    throw error;
  }

  await prisma.monobankConnection.update({
    where: { requestId },
    data: {
      status: "connected",
      connectedAt: new Date(),
    },
  });

  try {
    const info = await getClientInfo(requestId);
    await prisma.monobankConnection.update({
      where: { requestId },
      data: { clientName: info.name },
    });
  } catch {
    return true;
  }

  return true;
}

export async function getClientInfo(requestId: string) {
  const client = createMonobankClient();
  return client.request<MonoClientInfo>({
    method: "GET",
    resource: "/personal/client-info",
    requestId,
  });
}

export async function getStatement(requestId: string, accountId: string, from: number, to?: number) {
  const until = to ?? Math.floor(Date.now() / 1000);
  if (until - from > STATEMENT_MAX_SECONDS) {
    throw new MonobankApiError(400, "Statement period exceeds 31 days");
  }
  const client = createMonobankClient();
  return client.request<MonoStatementItem[]>({
    method: "GET",
    resource: `/personal/statement/${accountId}/${from}/${until}`,
    requestId,
  });
}

export async function setWebhook(requestId: string, url: string) {
  const client = createMonobankClient();
  await client.request({
    method: "POST",
    resource: "/personal/corp/webhook",
    requestId,
    signRequestId: false,
    body: { webHookUrl: url },
  });
}

export async function disconnect(userId: string) {
  await prisma.monobankConnection.updateMany({
    where: { userId },
    data: {
      status: "revoked",
      selectedAccountId: null,
    },
  });
}

export async function getConnectionByUserId(userId: string) {
  return prisma.monobankConnection.findUnique({ where: { userId } });
}

export async function listAccounts(userId: string) {
  const connection = await prisma.monobankConnection.findUnique({ where: { userId } });
  if (!connection || connection.status !== "connected") {
    return [];
  }
  const info = await getClientInfo(connection.requestId);
  return info.accounts ?? [];
}

export async function selectAccount(userId: string, accountId: string) {
  const connection = await prisma.monobankConnection.findUnique({ where: { userId } });
  if (!connection || connection.status !== "connected") {
    throw new MonobankApiError(401, "Monobank ще не підключено");
  }

  const accounts = await listAccounts(userId);
  if (!accounts.some((account) => account.id === accountId)) {
    throw new MonobankApiError(400, "Рахунок не знайдено");
  }

  await prisma.monobankConnection.update({
    where: { userId },
    data: { selectedAccountId: accountId },
  });

  try {
    const config = getMonobankConfig();
    await setWebhook(connection.requestId, config.webhookUrl);
    await catchUpStatement(userId);
    return { webhookError: null };
  } catch (error) {
    return { webhookError: monobankUserMessage(error) };
  }
}

export async function catchUpStatement(userId: string) {
  const connection = await prisma.monobankConnection.findUnique({ where: { userId } });
  if (!connection || connection.status !== "connected" || !connection.selectedAccountId) {
    return;
  }

  const to = Math.floor(Date.now() / 1000);
  const from = connection.lastStatementTime ?? to - CATCH_UP_SECONDS;
  const items = await getStatement(connection.requestId, connection.selectedAccountId, from, to);

  for (const item of items) {
    await ingestProviderTransaction({
      userId,
      account: connection.selectedAccountId,
      item,
      selectedAccountId: connection.selectedAccountId,
    });
  }

  await prisma.monobankConnection.update({
    where: { userId },
    data: { lastStatementTime: to },
  });
}

export async function handleMonobankWebhook(payload: MonoWebhookPayload, requestId: string | null) {
  if (payload.type !== "StatementItem" || !payload.data?.account || !payload.data.statementItem) {
    return;
  }

  const account = payload.data.account;
  const item = payload.data.statementItem;

  const connection = requestId
    ? await prisma.monobankConnection.findUnique({ where: { requestId } })
    : await prisma.monobankConnection.findFirst({
        where: { selectedAccountId: account, status: "connected" },
      });

  if (!connection || connection.status !== "connected" || !connection.selectedAccountId) {
    return;
  }

  await ingestProviderTransaction({
    userId: connection.userId,
    account,
    item,
    selectedAccountId: connection.selectedAccountId,
  });

  if (!connection.lastStatementTime || item.time > connection.lastStatementTime) {
    await prisma.monobankConnection.update({
      where: { id: connection.id },
      data: { lastStatementTime: item.time },
    });
  }
}

export const monobankService: MonobankService = {
  createAuthorization,
  verifyAuthorization,
  getClientInfo,
  getStatement,
  setWebhook,
  disconnect,
};
