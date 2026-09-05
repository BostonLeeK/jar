import type { OverlayAlert } from "@/lib/alerts";
import {
  eventsubCallbackUrl,
  eventsubReachable,
  eventsubSecret,
  twitchConfigured,
} from "@/lib/twitch";
import { createHmac, timingSafeEqual } from "crypto";

const HELIX = "https://api.twitch.tv/helix";

type AppToken = { token: string; exp: number };

const globalForTwitch = globalThis as unknown as {
  twitchAppToken?: AppToken;
  twitchSeen?: Map<string, number>;
};

type SubSpec = {
  type: string;
  version: string;
  condition: (id: string) => Record<string, string>;
};

const SUBS: SubSpec[] = [
  {
    type: "channel.follow",
    version: "2",
    condition: (id) => ({ broadcaster_user_id: id, moderator_user_id: id }),
  },
  {
    type: "channel.subscribe",
    version: "1",
    condition: (id) => ({ broadcaster_user_id: id }),
  },
  {
    type: "channel.subscription.gift",
    version: "1",
    condition: (id) => ({ broadcaster_user_id: id }),
  },
  {
    type: "channel.subscription.message",
    version: "1",
    condition: (id) => ({ broadcaster_user_id: id }),
  },
  {
    type: "channel.cheer",
    version: "1",
    condition: (id) => ({ broadcaster_user_id: id }),
  },
  {
    type: "channel.raid",
    version: "1",
    condition: (id) => ({ to_broadcaster_user_id: id }),
  },
];

type TwitchEvent = {
  user_name?: string | null;
  user_login?: string | null;
  from_broadcaster_user_name?: string | null;
  broadcaster_user_id?: string;
  to_broadcaster_user_id?: string;
  is_gift?: boolean;
  is_anonymous?: boolean;
  tier?: string;
  total?: number;
  bits?: number;
  viewers?: number;
  cumulative_months?: number;
  message?: string | { text?: string };
};

export type TwitchNotification = {
  subscription: { type: string };
  event: TwitchEvent;
};

function helixHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Client-Id": process.env.TWITCH_CLIENT_ID ?? "",
    "Content-Type": "application/json",
  };
}

async function appAccessToken() {
  const cached = globalForTwitch.twitchAppToken;
  if (cached && cached.exp > Date.now() + 60_000) {
    return cached.token;
  }
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID ?? "",
      client_secret: process.env.TWITCH_CLIENT_SECRET ?? "",
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Не вдалося отримати app token Twitch");
  }
  const body = (await res.json()) as { access_token: string; expires_in: number };
  globalForTwitch.twitchAppToken = {
    token: body.access_token,
    exp: Date.now() + body.expires_in * 1000,
  };
  return body.access_token;
}

async function createSubscription(spec: SubSpec, twitchId: string, token: string) {
  const res = await fetch(`${HELIX}/eventsub/subscriptions`, {
    method: "POST",
    headers: helixHeaders(token),
    body: JSON.stringify({
      type: spec.type,
      version: spec.version,
      condition: spec.condition(twitchId),
      transport: {
        method: "webhook",
        callback: eventsubCallbackUrl(),
        secret: eventsubSecret(),
      },
    }),
  });
  if (res.ok || res.status === 409) {
    return true;
  }
  return false;
}

export async function ensureEventSub(twitchId: string) {
  if (!twitchConfigured() || !eventsubReachable()) {
    return false;
  }
  const token = await appAccessToken();
  const results = await Promise.all(SUBS.map((spec) => createSubscription(spec, twitchId, token)));
  return results.some(Boolean);
}

async function listSubscriptions(twitchId: string, token: string) {
  const ids: string[] = [];
  let cursor = "";
  for (let i = 0; i < 10; i += 1) {
    const url = new URL(`${HELIX}/eventsub/subscriptions`);
    url.searchParams.set("user_id", twitchId);
    if (cursor) {
      url.searchParams.set("after", cursor);
    }
    const res = await fetch(url, { headers: helixHeaders(token), cache: "no-store" });
    if (!res.ok) {
      break;
    }
    const body = (await res.json()) as {
      data: Array<{ id: string }>;
      pagination?: { cursor?: string };
    };
    ids.push(...body.data.map((item) => item.id));
    cursor = body.pagination?.cursor ?? "";
    if (!cursor) {
      break;
    }
  }
  return ids;
}

export async function deleteEventSub(twitchId: string) {
  if (!twitchConfigured()) {
    return;
  }
  const token = await appAccessToken();
  const ids = await listSubscriptions(twitchId, token);
  await Promise.all(
    ids.map((id) =>
      fetch(`${HELIX}/eventsub/subscriptions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: helixHeaders(token),
      }),
    ),
  );
}

export function verifyEventSubSignature(raw: string, messageId: string, timestamp: string, signature: string) {
  const expected = `sha256=${createHmac("sha256", eventsubSecret()).update(messageId + timestamp + raw).digest("hex")}`;
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function isFreshEventSub(timestamp: string) {
  const at = Date.parse(timestamp);
  return Number.isFinite(at) && Math.abs(Date.now() - at) < 10 * 60 * 1000;
}

export function rememberEventSubMessage(id: string) {
  const seen = globalForTwitch.twitchSeen ?? new Map<string, number>();
  globalForTwitch.twitchSeen = seen;
  const now = Date.now();
  for (const [key, at] of seen) {
    if (now - at > 10 * 60 * 1000) {
      seen.delete(key);
    }
  }
  if (seen.has(id)) {
    return false;
  }
  seen.set(id, now);
  return true;
}

function eventNick(event: TwitchEvent) {
  if (event.is_anonymous) {
    return "Анонім";
  }
  return event.user_name || event.from_broadcaster_user_name || event.user_login || "Twitch";
}

function eventMessage(event: TwitchEvent) {
  if (typeof event.message === "string") {
    return event.message;
  }
  return event.message?.text?.trim() ?? "";
}

export function twitchBroadcasterId(event: TwitchEvent) {
  return event.broadcaster_user_id || event.to_broadcaster_user_id || "";
}

export function alertFromTwitch(type: string, event: TwitchEvent): OverlayAlert | null {
  const nickname = eventNick(event);
  const createdAt = new Date().toISOString();
  const id = `twitch_${type}_${nickname}_${createdAt}`;

  if (type === "channel.follow") {
    return { id, kind: "follow", nickname, message: "", amount: 0, createdAt };
  }
  if (type === "channel.subscribe") {
    if (event.is_gift) {
      return null;
    }
    return { id, kind: "sub", nickname, message: "", amount: 0, createdAt };
  }
  if (type === "channel.subscription.message") {
    return {
      id,
      kind: "resub",
      nickname,
      message: eventMessage(event),
      amount: event.cumulative_months ?? 0,
      createdAt,
    };
  }
  if (type === "channel.subscription.gift") {
    return { id, kind: "gift", nickname, message: "", amount: event.total ?? 1, createdAt };
  }
  if (type === "channel.cheer") {
    return {
      id,
      kind: "cheer",
      nickname,
      message: eventMessage(event),
      amount: event.bits ?? 0,
      createdAt,
    };
  }
  if (type === "channel.raid") {
    return {
      id,
      kind: "raid",
      nickname,
      message: "",
      amount: event.viewers ?? 0,
      createdAt,
    };
  }
  return null;
}
