import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { isEmail } from "@/lib/validate";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await readJson(req);
  } catch {
    return jsonError("Некоректний запит");
  }
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!isEmail(email) || !password) {
    return jsonError("Невірний email або пароль", 401);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await compare(password, user.passwordHash))) {
    return jsonError("Невірний email або пароль", 401);
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
