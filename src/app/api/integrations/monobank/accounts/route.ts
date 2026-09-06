import { jsonError } from "@/lib/http";
import { monobankConfigured } from "@/lib/monobank/config";
import { monobankHttpStatus, monobankUserMessage } from "@/lib/monobank/errors";
import { getConnectionByUserId, listAccounts } from "@/lib/monobank/service";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  if (!monobankConfigured()) {
    return jsonError("Monobank Provider API не налаштовано", 503);
  }

  const connection = await getConnectionByUserId(user.id);
  if (!connection || connection.status !== "connected") {
    return jsonError("Спочатку підтверди доступ у monobank", 409);
  }

  try {
    const accounts = await listAccounts(user.id);
    return NextResponse.json({ accounts });
  } catch (error) {
    return jsonError(monobankUserMessage(error), monobankHttpStatus(error));
  }
}
