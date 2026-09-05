import { isAllowedAvatar, removeAvatarFiles, saveAvatarFile } from "@/lib/avatar";
import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  const form = await req.formData();
  const file = form.get("avatar");
  if (!(file instanceof File) || !isAllowedAvatar(file)) {
    return jsonError("Завантаж JPG, PNG або WEBP до 2 МБ");
  }
  const avatarUrl = await saveAvatarFile(user.id, file);
  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl },
  });
  return NextResponse.json({ avatarUrl });
}

export async function DELETE() {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  await removeAvatarFiles(user.id);
  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl: null },
  });
  return NextResponse.json({ ok: true });
}
