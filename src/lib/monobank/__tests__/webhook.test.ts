import { describe, expect, it } from "vitest";
import { isDonationCandidate, mapMonoTransactionToDonation } from "../mapper";
import type { DonationEvent, MonoStatementItem } from "../types";

function item(overrides: Partial<MonoStatementItem> = {}): MonoStatementItem {
  return {
    id: "ZuHWzqkKGVo=",
    time: 1_700_000_000,
    description: "Переказ",
    mcc: 4829,
    originalMcc: 4829,
    hold: false,
    amount: 10000,
    operationAmount: 10000,
    currencyCode: 980,
    commissionRate: 0,
    cashbackAmount: 0,
    balance: 20000,
    comment: "Дякую за стрім",
    counterName: "Олена",
    ...overrides,
  };
}

function applyWebhook(
  store: Map<string, DonationEvent>,
  tx: MonoStatementItem,
  account: string,
  selectedAccountId: string,
  userId: string,
) {
  if (!isDonationCandidate(tx, account, selectedAccountId)) {
    return null;
  }
  const key = `monobank:${tx.id}`;
  if (store.has(key)) {
    return null;
  }
  const event = mapMonoTransactionToDonation(tx, userId);
  store.set(key, event);
  return event;
}

describe("webhook donation detection", () => {
  const account = "acc-selected";
  const userId = "user-1";

  it("creates a donation from a positive settled amount", () => {
    const store = new Map<string, DonationEvent>();
    const event = applyWebhook(store, item(), account, account, userId);
    expect(event).not.toBeNull();
    expect(event?.amount).toBe(100);
    expect(event?.currency).toBe("UAH");
    expect(store.size).toBe(1);
  });

  it("does not create a donation from a negative amount", () => {
    const store = new Map<string, DonationEvent>();
    expect(applyWebhook(store, item({ amount: -5000 }), account, account, userId)).toBeNull();
    expect(store.size).toBe(0);
  });

  it("does not create a donation while hold is true", () => {
    const store = new Map<string, DonationEvent>();
    expect(applyWebhook(store, item({ hold: true }), account, account, userId)).toBeNull();
    expect(store.size).toBe(0);
  });

  it("does not create a second donation for the same externalId", () => {
    const store = new Map<string, DonationEvent>();
    const first = applyWebhook(store, item(), account, account, userId);
    const second = applyWebhook(store, item({ comment: "повтор" }), account, account, userId);
    expect(first?.externalId).toBe("ZuHWzqkKGVo=");
    expect(second).toBeNull();
    expect(store.size).toBe(1);
    expect(store.get("monobank:ZuHWzqkKGVo=")?.message).toBe("Дякую за стрім");
  });

  it("copies comment into message", () => {
    const event = applyWebhook(new Map(), item(), account, account, userId);
    expect(event?.message).toBe("Дякую за стрім");
  });

  it("divides amount by 100", () => {
    const event = applyWebhook(new Map(), item({ amount: 10000 }), account, account, userId);
    expect(event?.amount).toBe(100);
  });
});
