import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const id = new URL(req.url).searchParams.get("id")?.trim() ?? "";
  if (!id) {
    return jsonError("Немає донату");
  }

  const user = await prisma.user.findUnique({ where: { slug } });
  if (!user) {
    return jsonError("Сторінку не знайдено", 404);
  }

  const pending = await prisma.pendingDonation.findFirst({
    where: { id, userId: user.id },
  });
  if (!pending) {
    return NextResponse.json({ status: "missing" });
  }
  if (pending.matched) {
    return NextResponse.json({
      status: "paid",
      amount: pending.amount,
      nickname: pending.nickname,
    });
  }
  if (pending.expiresAt <= new Date()) {
    return NextResponse.json({ status: "expired" });
  }
  return NextResponse.json({ status: "waiting" });
}
