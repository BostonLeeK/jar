import type { Donation } from "@prisma/client";
import { emitDonation } from "@/lib/events";
import type { MonoStatementItem } from "@/lib/mono";
import { prisma } from "@/lib/prisma";

function extractCode(value: string) {
  const match = value.toUpperCase().match(/\b[A-Z0-9]{4}\b/);
  return match?.[0] ?? "";
}

function toEvent(donation: Donation) {
  return {
    id: donation.id,
    amount: donation.amount,
    nickname: donation.nickname,
    message: donation.message,
    createdAt: donation.createdAt.toISOString(),
  };
}

export async function ingestStatement(
  userId: string,
  account: string,
  item: MonoStatementItem,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || item.amount <= 0 || !user.monoJarId || account !== user.monoJarId) {
    return null;
  }

  const existing = await prisma.donation.findUnique({
    where: { userId_monoTxId: { userId, monoTxId: item.id } },
  });
  if (existing) {
    return existing;
  }

  const now = new Date();
  const comment = item.comment?.trim() ?? "";
  const description = item.description?.trim() ?? "";
  const code = extractCode(`${comment} ${description}`);

  const pending = code
    ? await prisma.pendingDonation.findFirst({
        where: {
          userId,
          matched: false,
          code,
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: "asc" },
      })
    : await prisma.pendingDonation.findFirst({
        where: {
          userId,
          matched: false,
          amount: item.amount,
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: "asc" },
      });

  const donation = await prisma.$transaction(async (tx) => {
    if (pending) {
      await tx.pendingDonation.update({
        where: { id: pending.id },
        data: { matched: true },
      });
    }
    if (typeof item.balance === "number" && user.monoJarId === account) {
      await tx.user.update({
        where: { id: userId },
        data: { monoJarBalance: item.balance },
      });
    }
    return tx.donation.create({
      data: {
        userId,
        monoTxId: item.id,
        amount: item.amount,
        nickname: pending?.nickname || "Анонім",
        message: pending?.message || comment || "",
      },
    });
  });

  emitDonation(userId, toEvent(donation));
  return donation;
}

export async function createTestDonation(
  userId: string,
  input: { amount: number; nickname: string; message: string },
) {
  const donation = await prisma.donation.create({
    data: {
      userId,
      monoTxId: `test_${crypto.randomUUID()}`,
      amount: input.amount,
      nickname: input.nickname,
      message: input.message,
    },
  });
  emitDonation(userId, toEvent(donation));
  return donation;
}
