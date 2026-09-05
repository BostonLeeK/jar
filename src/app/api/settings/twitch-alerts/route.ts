import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toTwitchAlertConfig } from "@/lib/twitch-alerts";
import { requireApiUser } from "@/lib/user";
import { clamp } from "@/lib/validate";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  const body = await readJson<{ id?: string; tts?: boolean; audioStart?: number; audioEnd?: number }>(req);
  if (!body.id) {
    return jsonError("Немає id");
  }
  const existing = await prisma.twitchAlert.findFirst({ where: { id: body.id, userId: user.id } });
  if (!existing) {
    return jsonError("Алерт не знайдено", 404);
  }
  const updated = await prisma.twitchAlert.update({
    where: { id: body.id },
    data: {
      ...(typeof body.tts === "boolean" ? { tts: body.tts } : {}),
      ...(typeof body.audioStart === "number" ? { audioStart: clamp(body.audioStart, 0, 3600) } : {}),
      ...(typeof body.audioEnd === "number" ? { audioEnd: clamp(body.audioEnd, 0, 3600) } : {}),
    },
  });
  return NextResponse.json(toTwitchAlertConfig(updated));
}
