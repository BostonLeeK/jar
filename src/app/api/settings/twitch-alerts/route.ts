import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toTwitchAlertConfig } from "@/lib/twitch-alerts";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  const body = await readJson<{ id?: string; tts?: boolean }>(req);
  if (!body.id || typeof body.tts !== "boolean") {
    return jsonError("Немає id");
  }
  const existing = await prisma.twitchAlert.findFirst({ where: { id: body.id, userId: user.id } });
  if (!existing) {
    return jsonError("Алерт не знайдено", 404);
  }
  const updated = await prisma.twitchAlert.update({
    where: { id: body.id },
    data: { tts: body.tts },
  });
  return NextResponse.json(toTwitchAlertConfig(updated));
}
