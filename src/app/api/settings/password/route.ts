import { compare, hash } from "bcryptjs";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }

  const body = await readJson<{ current?: string; next?: string }>(req);
  const current = body.current ?? "";
  const next = body.next ?? "";

  if (next.length < 8) {
    return jsonError("Новий пароль має містити щонайменше 8 символів");
  }
  if (!(await compare(current, user.passwordHash))) {
    return jsonError("Поточний пароль невірний", 401);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hash(next, 12) },
  });

  return NextResponse.json({ ok: true });
}
