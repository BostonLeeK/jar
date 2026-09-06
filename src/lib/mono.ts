import { getAppUrl } from "@/lib/urls";

const BASE = "https://api.monobank.ua";

export type MonoJar = {
  id: string;
  sendId: string;
  title: string;
  description?: string;
  currencyCode: number;
  balance: number;
  goal?: number;
};

export type MonoClientInfo = {
  clientId: string;
  name: string;
  webHookUrl?: string;
  jars?: MonoJar[];
};

export type MonoStatementItem = {
  id: string;
  time: number;
  description?: string;
  comment?: string;
  mcc?: number;
  amount: number;
  operationAmount?: number;
  currencyCode?: number;
  balance?: number;
};

export type MonoWebhookPayload = {
  type: string;
  data?: {
    account?: string;
    statementItem?: MonoStatementItem;
  };
};

async function readError(res: Response) {
  const body = (await res.json().catch(() => null)) as { errorDescription?: string } | null;
  return body?.errorDescription || `Monobank відповіла ${res.status}`;
}

export async function fetchClientInfo(token: string) {
  const res = await fetch(`${BASE}/personal/client-info`, {
    headers: { "X-Token": token },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readError(res));
  }
  return (await res.json()) as MonoClientInfo;
}

async function postMonoWebhook(token: string, webHookUrl: string) {
  const res = await fetch(`${BASE}/personal/webhook`, {
    method: "POST",
    headers: {
      "X-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ webHookUrl }),
  });
  if (!res.ok) {
    throw new Error(await readError(res));
  }
}

export async function setMonoWebhook(token: string, webhookToken: string) {
  const webHookUrl = `${getAppUrl()}/api/mono/webhook/${webhookToken}`;
  await postMonoWebhook(token, webHookUrl);
  return webHookUrl;
}

export async function clearMonoWebhook(token: string) {
  await postMonoWebhook(token, "");
}
