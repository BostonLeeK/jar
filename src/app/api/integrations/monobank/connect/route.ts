import { jsonError } from "@/lib/http";
import { monobankConfigured } from "@/lib/monobank/config";
import { monobankHttpStatus, monobankUserMessage } from "@/lib/monobank/errors";
import { createAuthorization } from "@/lib/monobank/service";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  if (!monobankConfigured()) {
    return jsonError("Monobank Provider API не налаштовано", 503);
  }

  try {
    const result = await createAuthorization(user.id);
    return NextResponse.json({ acceptUrl: result.acceptUrl });
  } catch (error) {
    return jsonError(monobankUserMessage(error), monobankHttpStatus(error));
  }
}
