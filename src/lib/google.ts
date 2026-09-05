export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function callbackUri(origin: string) {
  return `${origin.replace(/\/$/, "")}/api/auth/google/callback`;
}

export function googleAuthorizeUrl(state: string, origin: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: callbackUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, origin: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      code,
      grant_type: "authorization_code",
      redirect_uri: callbackUri(origin),
    }),
  });
  if (!res.ok) {
    throw new Error("Не вдалося обміняти код Google");
  }
  return (await res.json()) as { access_token: string };
}

export async function fetchGoogleProfile(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Не вдалося отримати профіль Google");
  }
  const profile = (await res.json()) as {
    sub?: string;
    email?: string;
    name?: string;
    given_name?: string;
    picture?: string;
  };
  if (!profile.sub || !profile.email) {
    throw new Error("У профілі Google немає email");
  }
  return {
    id: profile.sub,
    email: profile.email.toLowerCase(),
    name: (profile.name || profile.given_name || profile.email.split("@")[0]).trim(),
    picture: profile.picture ?? null,
  };
}
