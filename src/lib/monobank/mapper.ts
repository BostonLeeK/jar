import type { DonationEvent, MonoStatementItem } from "@/lib/monobank/types";

const CURRENCY: Record<number, string> = {
  980: "UAH",
  840: "USD",
  978: "EUR",
};

export function isDonationCandidate(item: MonoStatementItem, account: string, selectedAccountId: string) {
  return item.amount > 0 && item.hold === false && account === selectedAccountId;
}

export function mapMonoTransactionToDonation(item: MonoStatementItem, userId: string): DonationEvent {
  return {
    provider: "monobank",
    externalId: item.id,
    userId,
    amount: item.amount / 100,
    currency: CURRENCY[item.currencyCode ?? 980] ?? String(item.currencyCode),
    senderName: item.counterName ?? null,
    message: item.comment ?? null,
    createdAt: new Date(item.time * 1000),
    raw: item,
  };
}
