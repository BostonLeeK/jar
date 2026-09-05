import { emitAlert } from "@/lib/events";
import { prisma } from "@/lib/prisma";
import {
  alertFromTwitch,
  isFreshEventSub,
  rememberEventSubMessage,
  twitchBroadcasterId,
  verifyEventSubSignature,
  type TwitchNotification,
} from "@/lib/twitch-eventsub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const raw = await req.text();
  const messageId = req.headers.get("twitch-eventsub-message-id") ?? "";
  const timestamp = req.headers.get("twitch-eventsub-message-timestamp") ?? "";
  const signature = req.headers.get("twitch-eventsub-message-signature") ?? "";
  const messageType = req.headers.get("twitch-eventsub-message-type") ?? "";

  if (!messageId || !timestamp || !signature || !verifyEventSubSignature(raw, messageId, timestamp, signature)) {
    return new Response("invalid signature", { status: 403 });
  }
  if (!isFreshEventSub(timestamp)) {
    return new Response("stale", { status: 400 });
  }

  const payload = JSON.parse(raw) as TwitchNotification & { challenge?: string };

  if (messageType === "webhook_callback_verification") {
    return new Response(payload.challenge ?? "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  if (messageType === "revocation") {
    return new Response("ok", { status: 204 });
  }

  if (messageType !== "notification" || !rememberEventSubMessage(messageId)) {
    return new Response("ok", { status: 204 });
  }

  const alert = alertFromTwitch(payload.subscription?.type ?? "", payload.event ?? {});
  const twitchId = twitchBroadcasterId(payload.event ?? {});
  if (!alert || !twitchId) {
    return new Response("ok", { status: 204 });
  }

  const user = await prisma.user.findFirst({ where: { twitchId } });
  if (user) {
    emitAlert(user.id, alert);
  }

  return new Response("ok", { status: 204 });
}
