import { isAllowedAlertFile, removeAlertFile, saveAlertFile } from "@/lib/alert-media";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { toTwitchAlertConfig } from "@/lib/twitch-alerts";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

function kindOf(value: FormDataEntryValue | string | null): "gif" | "audio" | null {
  return value === "gif" || value === "audio" ? value : null;
}

export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  const form = await req.formData();
  const id = String(form.get("id") ?? "");
  const kind = kindOf(form.get("kind"));
  const file = form.get("file");
  if (!id || !kind || !(file instanceof File) || !isAllowedAlertFile(kind, file)) {
    return jsonError(kind === "audio" ? "Завантаж MP3, WAV або OGG до 4 МБ" : "Завантаж GIF, WEBP або PNG до 10 МБ");
  }
  const alert = await prisma.twitchAlert.findFirst({ where: { id, userId: user.id } });
  if (!alert) {
    return jsonError("Алерт не знайдено", 404);
  }
  const url = await saveAlertFile(user.id, id, kind, file);
  const updated = await prisma.twitchAlert.update({
    where: { id },
    data: kind === "gif" ? { gifUrl: url } : { audioUrl: url },
  });
  return NextResponse.json(toTwitchAlertConfig(updated));
}

export async function DELETE(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const kind = kindOf(url.searchParams.get("kind"));
  if (!id || !kind) {
    return jsonError("Немає id");
  }
  const alert = await prisma.twitchAlert.findFirst({ where: { id, userId: user.id } });
  if (!alert) {
    return jsonError("Алерт не знайдено", 404);
  }
  await removeAlertFile(user.id, id, kind);
  const updated = await prisma.twitchAlert.update({
    where: { id },
    data: kind === "gif" ? { gifUrl: null } : { audioUrl: null },
  });
  return NextResponse.json(toTwitchAlertConfig(updated));
}
