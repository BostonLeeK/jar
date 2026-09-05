import { getAppUrl } from "@/lib/urls";

export function twitchConfigured() {
  return Boolean(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);
}

export function twitchAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID ?? "",
    redirect_uri: `${getAppUrl()}/api/twitch/callback`,
    response_type: "code",
    scope: "user:read:email",
    state,
  });
  return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
}

export async function exchangeTwitchCode(code: string) {
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID ?? "",
      client_secret: process.env.TWITCH_CLIENT_SECRET ?? "",
      code,
      grant_type: "authorization_code",
      redirect_uri: `${getAppUrl()}/api/twitch/callback`,
    }),
  });
  if (!res.ok) {
    throw new Error("Не вдалося обміняти код Twitch");
  }
  return (await res.json()) as { access_token: string };
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
