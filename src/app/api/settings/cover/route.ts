import { isAllowedCover, removeCoverFiles, saveCoverFile } from "@/lib/cover";
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
  const file = form.get("cover");
  if (!(file instanceof File) || !isAllowedCover(file)) {
    return jsonError("Завантаж JPG, PNG або WEBP до 15 МБ");
  }
  const pageCoverUrl = await saveCoverFile(user.id, file);
  await prisma.user.update({
    where: { id: user.id },
    data: { pageCoverUrl },
  });
  return NextResponse.json({ pageCoverUrl });
}

export async function DELETE() {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  await removeCoverFiles(user.id);
  await prisma.user.update({
    where: { id: user.id },
    data: { pageCoverUrl: null },
  });
  return NextResponse.json({ ok: true });
}
