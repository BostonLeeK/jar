import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { isEmail } from "@/lib/validate";

export async function POST(req: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await readJson(req);
  } catch {
    return jsonError("Некоректний запит");
  }
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (name.length < 2 || name.length > 40) {
    return jsonError("Імʼя має бути від 2 до 40 символів");
  }
  if (!isEmail(email)) {
    return jsonError("Некоректний email");
  }
  if (password.length < 8) {
    return jsonError("Пароль має містити щонайменше 8 символів");
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return jsonError("Цей email уже зареєстрований", 409);
  }

  let slug = slugify(name);
  if (slug.length < 3) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  const taken = await prisma.user.findUnique({ where: { slug } });
  if (taken) {
    slug = `${slug.slice(0, 24)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hash(password, 12),
      slug,
      pageTitle: name,
    },
  });

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
