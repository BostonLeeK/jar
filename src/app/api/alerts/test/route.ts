import { isAlertKind, type OverlayAlert } from "@/lib/alerts";
import { emitAlert } from "@/lib/events";
import { jsonError, readJson } from "@/lib/http";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

const SAMPLES: Record<Exclude<OverlayAlert["kind"], "donation">, Pick<OverlayAlert, "nickname" | "message" | "amount">> = {
  follow: { nickname: "new_follower", message: "", amount: 0 },
  sub: { nickname: "subscriber", message: "", amount: 0 },
  resub: { nickname: "old_friend", message: "ще на міс", amount: 6 },
  gift: { nickname: "gifter", message: "", amount: 5 },
  cheer: { nickname: "cheerer", message: "pog", amount: 100 },
  raid: { nickname: "raider", message: "", amount: 42 },
};

export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  const body = await readJson<{ kind?: string; nickname?: string; message?: string }>(req);
  if (!body.kind || !isAlertKind(body.kind) || body.kind === "donation") {
    return jsonError("Невідомий тип алерту");
  }
  const sample = SAMPLES[body.kind];
  const alert: OverlayAlert = {
    id: `twitch_test_${crypto.randomUUID()}`,
    kind: body.kind,
    nickname: body.nickname?.trim() || sample.nickname,
    message: body.message?.trim() || sample.message,
    amount: sample.amount,
    createdAt: new Date().toISOString(),
  };
  emitAlert(user.id, alert);
  return NextResponse.json({ id: alert.id });
}
