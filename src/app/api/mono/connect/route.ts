import { decrypt, encrypt } from "@/lib/crypto";
import { jsonError, readJson } from "@/lib/http";
import { fetchClientInfo, setMonoWebhook } from "@/lib/mono";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  const body = await readJson<{ token?: string }>(req);
  const token = body.token?.trim();
  if (!token || token.length < 10) {
    return jsonError("Встав токен з api.monobank.ua");
  }

  try {
    const info = await fetchClientInfo(token);
    let webhookSet = false;
    let webhookError: string | null = null;
    try {
      await setMonoWebhook(token, user.webhookToken);
      webhookSet = true;
    } catch (error) {
      webhookError = error instanceof Error ? error.message : "Не вдалося встановити webhook";
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        monoTokenEnc: encrypt(token),
        monoWebhookSet: webhookSet,
      },
    });

    return NextResponse.json({
      jars: info.jars ?? [],
      webhookSet,
      webhookError,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Не вдалося підключити Monobank");
  }
}

export async function GET() {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  if (!user.monoTokenEnc) {
    return NextResponse.json({ jars: [], webhookSet: false });
  }
  try {
    const info = await fetchClientInfo(decrypt(user.monoTokenEnc));
    return NextResponse.json({
      jars: info.jars ?? [],
      webhookSet: user.monoWebhookSet,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Не вдалося отримати банки", 502);
  }
}
