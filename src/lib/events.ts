import type { OverlayAlert } from "@/lib/alerts";
import { EventEmitter } from "events";

const globalForBus = globalThis as unknown as { donationBus?: EventEmitter };

export const donationBus = globalForBus.donationBus ?? new EventEmitter();
donationBus.setMaxListeners(200);

if (process.env.NODE_ENV !== "production") {
  globalForBus.donationBus = donationBus;
}

export function emitAlert(userId: string, alert: OverlayAlert) {
  donationBus.emit(`donation:${userId}`, alert);
}

export function emitDonation(userId: string, donation: Omit<OverlayAlert, "kind">) {
  emitAlert(userId, { ...donation, kind: "donation" });
}

export function onDonation(userId: string, listener: (alert: OverlayAlert) => void) {
  const event = `donation:${userId}`;
  donationBus.on(event, listener);
  return () => {
    donationBus.off(event, listener);
  };
}
