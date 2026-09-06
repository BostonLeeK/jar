import { jsonError, readJson } from "@/lib/http";
import { monobankConfigured } from "@/lib/monobank/config";
import { monobankHttpStatus, monobankUserMessage } from "@/lib/monobank/errors";
import { selectAccount } from "@/lib/monobank/service";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  if (!monobankConfigured()) {
    return jsonError("Monobank Provider API не налаштовано", 503);
  }

  const body = await readJson<{ accountId?: string }>(req);
  const accountId = body.accountId?.trim();
  if (!accountId) {
    return jsonError("Обери рахунок");
  }

  try {
    const result = await selectAccount(user.id, accountId);
    return NextResponse.json({
      ok: true,
      webhookSet: !result.webhookError,
      webhookError: result.webhookError,
    });
  } catch (error) {
    return jsonError(monobankUserMessage(error), monobankHttpStatus(error));
  }
}
