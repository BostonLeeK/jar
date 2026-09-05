import { formatUah } from "@/lib/money";

export const ALERT_KINDS = ["donation", "follow", "sub", "resub", "gift", "cheer", "raid"] as const;

export type AlertKind = (typeof ALERT_KINDS)[number];

export type OverlayAlert = {
  id: string;
  kind: AlertKind;
  nickname: string;
  message: string;
  amount: number;
  createdAt: string;
};

export function isAlertKind(value: string): value is AlertKind {
  return ALERT_KINDS.includes(value as AlertKind);
}

export function formatAlertDetail(alert: { kind?: string; amount: number }) {
  switch (alert.kind) {
    case "follow":
      return "фоловер";
    case "sub":
      return "підписка";
    case "resub":
      return alert.amount > 0 ? `${alert.amount} міс. підписки` : "підписка";
    case "gift":
      return alert.amount > 1 ? `${alert.amount} гіфт-підписки` : "гіфт-підписка";
    case "cheer":
      return `${alert.amount} bits`;
    case "raid":
      return alert.amount > 0 ? `рейд · ${alert.amount}` : "рейд";
    default:
      return formatUah(alert.amount);
  }
}
