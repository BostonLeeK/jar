import { jsonError } from "@/lib/http";
import { disconnect } from "@/lib/monobank/service";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function DELETE() {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }

  await disconnect(user.id);
  return NextResponse.json({ ok: true });
}
