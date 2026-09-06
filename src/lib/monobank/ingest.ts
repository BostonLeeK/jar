import type { Donation } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { emitDonation } from "@/lib/events";
import { uahToKopiyky } from "@/lib/money";
import { isDonationCandidate, mapMonoTransactionToDonation } from "@/lib/monobank/mapper";
import type { MonoStatementItem } from "@/lib/monobank/types";
import { prisma } from "@/lib/prisma";

const PROVIDER = "monobank";
const FALLBACK_NICKNAME = "Донатер";

function isUniqueConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function findProviderDonation(externalId: string) {
  return prisma.donation.findUnique({
    where: { provider_monoTxId: { provider: PROVIDER, monoTxId: externalId } },
  });
}

export async function ingestProviderTransaction(input: {
  userId: string;
  account: string;
  item: MonoStatementItem;
  selectedAccountId: string;
}): Promise<Donation | null> {
  if (!isDonationCandidate(input.item, input.account, input.selectedAccountId)) {
    return null;
  }

  const existing = await findProviderDonation(input.item.id);
  if (existing) {
    return existing;
  }

  const event = mapMonoTransactionToDonation(input.item, input.userId);

  try {
    const donation = await prisma.donation.create({
      data: {
        userId: input.userId,
        provider: event.provider,
        monoTxId: event.externalId,
        amount: uahToKopiyky(event.amount),
        nickname: event.senderName?.trim() || FALLBACK_NICKNAME,
        message: event.message?.trim() || "",
        createdAt: event.createdAt,
      },
    });
    emitDonation(input.userId, {
      id: donation.id,
      amount: donation.amount,
      nickname: donation.nickname,
      message: donation.message,
      createdAt: donation.createdAt.toISOString(),
    });
    return donation;
  } catch (error) {
    if (isUniqueConflict(error)) {
      return findProviderDonation(input.item.id);
    }
    throw error;
  }
}
