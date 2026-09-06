import { describe, expect, it } from "vitest";
import { isDonationCandidate, mapMonoTransactionToDonation } from "../mapper";
import type { MonoStatementItem } from "../types";

function item(overrides: Partial<MonoStatementItem> = {}): MonoStatementItem {
  return {
    id: "tx-1",
    time: 1_700_000_000,
    description: "Поповнення",
    mcc: 4829,
    originalMcc: 4829,
    hold: false,
    amount: 10000,
    operationAmount: 10000,
    currencyCode: 980,
    commissionRate: 0,
    cashbackAmount: 0,
    balance: 50000,
    comment: "На каву",
    counterName: "Іван",
    ...overrides,
  };
}

describe("isDonationCandidate", () => {
  it("accepts a settled inbound credit on the selected account", () => {
    expect(isDonationCandidate(item(), "acc-1", "acc-1")).toBe(true);
  });

  it("rejects a negative amount", () => {
    expect(isDonationCandidate(item({ amount: -10000 }), "acc-1", "acc-1")).toBe(false);
  });

  it("rejects a hold", () => {
    expect(isDonationCandidate(item({ hold: true }), "acc-1", "acc-1")).toBe(false);
  });

  it("rejects a different account", () => {
    expect(isDonationCandidate(item(), "other", "acc-1")).toBe(false);
  });
});

describe("mapMonoTransactionToDonation", () => {
  it("divides amount by 100 and maps comment and sender", () => {
    const event = mapMonoTransactionToDonation(item(), "user-1");
    expect(event.provider).toBe("monobank");
    expect(event.externalId).toBe("tx-1");
    expect(event.userId).toBe("user-1");
    expect(event.amount).toBe(100);
    expect(event.currency).toBe("UAH");
    expect(event.message).toBe("На каву");
    expect(event.senderName).toBe("Іван");
  });

  it("uses null when comment and counterName are missing", () => {
    const event = mapMonoTransactionToDonation(item({ comment: undefined, counterName: undefined }), "user-1");
    expect(event.message).toBeNull();
    expect(event.senderName).toBeNull();
  });
});
