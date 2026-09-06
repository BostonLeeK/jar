import type { OverlayAlert } from "@/lib/alerts";
import type { ChatMessage } from "@/lib/twitch-irc";
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

export function emitChat(userId: string, message: ChatMessage) {
  donationBus.emit(`chat:${userId}`, message);
}

export function onChat(userId: string, listener: (message: ChatMessage) => void) {
  const event = `chat:${userId}`;
  donationBus.on(event, listener);
  return () => {
    donationBus.off(event, listener);
  };
}
