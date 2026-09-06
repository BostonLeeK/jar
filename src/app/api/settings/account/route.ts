import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { deleteUserAccount } from "@/lib/account";
import { jsonError, readJson } from "@/lib/http";
import { clearSession } from "@/lib/session";
import { requireApiUser } from "@/lib/user";

export async function DELETE(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }

  let body: { slug?: string; password?: string };
  try {
    body = await readJson(req);
  } catch {
    return jsonError("Некоректний запит");
  }

  if (body.slug?.trim() !== user.slug) {
    return jsonError("Введи свій slug, щоб підтвердити");
  }
  if (user.passwordHash && !(await compare(body.password ?? "", user.passwordHash))) {
    return jsonError("Невірний пароль", 401);
  }

  await deleteUserAccount(user);
  await clearSession();
  return NextResponse.json({ ok: true });
}