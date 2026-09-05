import { isAllowedAlertFile, removeAlertFile, saveAlertFile } from "@/lib/alert-media";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
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
  const tierId = String(form.get("tierId") ?? "");
  const kind = kindOf(form.get("kind"));
  const file = form.get("file");
  if (!tierId || !kind || !(file instanceof File) || !isAllowedAlertFile(kind, file)) {
    return jsonError(kind === "audio" ? "Завантаж MP3, WAV або OGG до 4 МБ" : "Завантаж GIF, WEBP або PNG до 8 МБ");
  }
  const tier = await prisma.alertTier.findFirst({ where: { id: tierId, userId: user.id } });
  if (!tier) {
    return jsonError("Рівень не знайдено", 404);
  }
  const url = await saveAlertFile(user.id, tierId, kind, file);
  const updated = await prisma.alertTier.update({
    where: { id: tierId },
    data: kind === "gif" ? { gifUrl: url } : { audioUrl: url },
  });
  return NextResponse.json(updated);
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
  const tier = await prisma.alertTier.findFirst({ where: { id, userId: user.id } });
  if (!tier) {
    return jsonError("Рівень не знайдено", 404);
  }
  await removeAlertFile(user.id, id, kind);
  const updated = await prisma.alertTier.update({
    where: { id },
    data: kind === "gif" ? { gifUrl: null } : { audioUrl: null },
  });
  return NextResponse.json(updated);
}
