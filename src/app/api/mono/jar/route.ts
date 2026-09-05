import { decrypt } from "@/lib/crypto";
import { jsonError, readJson } from "@/lib/http";
import { fetchClientInfo } from "@/lib/mono";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  if (!user.monoTokenEnc) {
    return jsonError("Спочатку підключи токен Monobank");
  }

  const body = await readJson<{ jarId?: string }>(req);
  const info = await fetchClientInfo(decrypt(user.monoTokenEnc));
  const jar = (info.jars ?? []).find((item) => item.id === body.jarId);
  if (!jar) {
    return jsonError("Банку не знайдено");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      monoJarId: jar.id,
      monoSendId: jar.sendId,
      monoJarTitle: jar.title,
      monoJarBalance: jar.balance,
      monoJarGoal: jar.goal ?? 0,
    },
  });

  return NextResponse.json({ ok: true });
}
