import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { allocateSlug } from "@/lib/user";
import { isEmail } from "@/lib/validate";

export async function POST(req: Request) {
  let body: { name?: string; email?: string; password?: string; confirm?: string };
  try {
    body = await readJson(req);
  } catch {
    return jsonError("Некоректний запит");
  }
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const confirm = body.confirm ?? "";

  if (name.length < 2 || name.length > 40) {
    return jsonError("Імʼя має бути від 2 до 40 символів");
  }
  if (!isEmail(email)) {
    return jsonError("Некоректний email");
  }
  if (password.length < 8) {
    return jsonError("Пароль має містити щонайменше 8 символів");
  }
  if (password !== confirm) {
    return jsonError("Паролі не збігаються");
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return jsonError("Цей email уже зареєстрований", 409);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hash(password, 12),
      slug: await allocateSlug(name),
      pageTitle: name,
    },
  });

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
