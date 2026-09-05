import { getAppUrl } from "@/lib/urls";

const SCOPES = [
  "user:read:email",
  "moderator:read:followers",
  "channel:read:subscriptions",
  "bits:read",
] as const;

export function twitchConfigured() {
  return Boolean(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);
}

function callbackUri(origin: string) {
  return `${origin.replace(/\/$/, "")}/api/twitch/callback`;
}

export function twitchAuthorizeUrl(state: string, origin: string) {
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID ?? "",
    redirect_uri: callbackUri(origin),
    response_type: "code",
    scope: SCOPES.join(" "),
    state,
  });
  return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
}

export async function exchangeTwitchCode(code: string, origin: string) {
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID ?? "",
      client_secret: process.env.TWITCH_CLIENT_SECRET ?? "",
      code,
      grant_type: "authorization_code",
      redirect_uri: callbackUri(origin),
    }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string; error?: string } | null;
    throw new Error(body?.message || body?.error || "Не вдалося обміняти код Twitch");
  }
  return (await res.json()) as { access_token: string; refresh_token?: string };
}

export async function fetchTwitchUser(accessToken: string) {
  const res = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID ?? "",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Не вдалося отримати профіль Twitch");
  }
  const body = (await res.json()) as {
    data: Array<{
      id: string;
      login: string;
      display_name: string;
      profile_image_url: string;
    }>;
  };
  const user = body.data[0];
  if (!user) {
    throw new Error("Профіль Twitch порожній");
  }
  return user;
}

export function eventsubCallbackUrl() {
  return `${getAppUrl()}/api/twitch/eventsub`;
}

export function eventsubReachable() {
  try {
    const url = new URL(eventsubCallbackUrl());
    return url.protocol === "https:" && url.hostname !== "localhost" && !url.hostname.endsWith(".local");
  } catch {
    return false;
  }
}

export function eventsubSecret() {
  const secret = process.env.TWITCH_EVENTSUB_SECRET || process.env.AUTH_SECRET || "";
  if (secret.length < 10 || secret.length > 100) {
    throw new Error("TWITCH_EVENTSUB_SECRET або AUTH_SECRET має бути 10–100 символів");
  }
  return secret;
}
