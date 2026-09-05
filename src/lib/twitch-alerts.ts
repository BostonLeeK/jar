import { prisma } from "@/lib/prisma";

export const TWITCH_ALERT_KINDS = ["follow", "sub", "resub", "gift", "cheer", "raid"] as const;

export type TwitchAlertKind = (typeof TWITCH_ALERT_KINDS)[number];

export const TWITCH_ALERT_LABELS: Record<TwitchAlertKind, string> = {
  follow: "Фоловер",
  sub: "Підписка",
  resub: "Ресаб",
  gift: "Гіфт-підписка",
  cheer: "Bits",
  raid: "Рейд",
};

export function isTwitchAlertKind(value: string): value is TwitchAlertKind {
  return TWITCH_ALERT_KINDS.includes(value as TwitchAlertKind);
}

export function sortTwitchAlerts<T extends { kind: string }>(items: T[]) {
  return [...items].sort(
    (a, b) => TWITCH_ALERT_KINDS.indexOf(a.kind as TwitchAlertKind) - TWITCH_ALERT_KINDS.indexOf(b.kind as TwitchAlertKind),
  );
}

export async function ensureTwitchAlerts(userId: string) {
  const existing = await prisma.twitchAlert.findMany({ where: { userId } });
  const have = new Set(existing.map((item) => item.kind));
  const missing = TWITCH_ALERT_KINDS.filter((kind) => !have.has(kind));
  if (missing.length) {
    await prisma.twitchAlert.createMany({
      data: missing.map((kind) => ({ userId, kind })),
    });
  }
  return sortTwitchAlerts(await prisma.twitchAlert.findMany({ where: { userId } }));
}

export function toTwitchAlertConfig(item: {
  id: string;
  kind: string;
  gifUrl: string | null;
  audioUrl: string | null;
  audioStart?: number;
  audioEnd?: number;
  tts: boolean;
}) {
  return {
    id: item.id,
    kind: item.kind,
    gifUrl: item.gifUrl,
    audioUrl: item.audioUrl,
    audioStart: item.audioStart ?? 0,
    audioEnd: item.audioEnd ?? 0,
    tts: item.tts,
  };
}
