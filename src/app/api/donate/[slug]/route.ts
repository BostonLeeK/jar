import { jsonError, readJson } from "@/lib/http";
import { uahToKopiyky } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { makeCode } from "@/lib/slug";
import { jarPayUrl } from "@/lib/urls";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const user = await prisma.user.findUnique({ where: { slug } });
  if (!user?.monoSendId) {
    return jsonError("Сторінка ще не приймає донати", 404);
  }

  const body = await readJson<{ nickname?: string; amount?: number; message?: string }>(req);
  const nickname = body.nickname?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  const amountUah = Number(body.amount);

  if (nickname.length < 2 || nickname.length > 24) {
    return jsonError("Нік має бути від 2 до 24 символів");
  }
  if (!Number.isFinite(amountUah) || amountUah <= 0) {
    return jsonError("Вкажи суму");
  }
  if (message.length > 180) {
    return jsonError("Повідомлення занадто довге");
  }

  const amount = uahToKopiyky(amountUah);
  if (amount < user.minAmount) {
    return jsonError(`Мінімальна сума — ${(user.minAmount / 100).toFixed(0)} ₴`);
  }

  const pending = await prisma.pendingDonation.create({
    data: {
      userId: user.id,
      amount,
      nickname,
      message,
      code: makeCode(),
      expiresAt: new Date(Date.now() + 45 * 60 * 1000),
    },
  });

  return NextResponse.json({
    code: pending.code,
    amount,
    payUrl: jarPayUrl(user.monoSendId, { amount, comment: pending.code }),
    jarTitle: user.monoJarTitle,
  });
}
