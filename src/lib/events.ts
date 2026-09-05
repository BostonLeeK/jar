import { EventEmitter } from "events";

type DonationEvent = {
  id: string;
  amount: number;
  nickname: string;
  message: string;
  createdAt: string;
};

const globalForBus = globalThis as unknown as { donationBus?: EventEmitter };

export const donationBus = globalForBus.donationBus ?? new EventEmitter();
donationBus.setMaxListeners(200);

if (process.env.NODE_ENV !== "production") {
  globalForBus.donationBus = donationBus;
}

export function emitDonation(userId: string, donation: DonationEvent) {
  donationBus.emit(`donation:${userId}`, donation);
}

export function onDonation(userId: string, listener: (donation: DonationEvent) => void) {
  const event = `donation:${userId}`;
  donationBus.on(event, listener);
  return () => {
    donationBus.off(event, listener);
  };
}
