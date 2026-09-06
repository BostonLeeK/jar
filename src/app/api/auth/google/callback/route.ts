import { exchangeGoogleCode, fetchGoogleProfile } from "@/lib/google";
import { createSession, verifyState } from "@/lib/session";
import { getPublicOrigin } from "@/lib/urls";
import { upsertGoogleUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const origin = getPublicOrigin(req);
  const to = (path: string, error?: string) => {
    const target = error ? `${path}?error=${encodeURIComponent(error)}` : path;
    try {
      return NextResponse.redirect(new URL(target, `${origin}/`));
    } catch {
      return NextResponse.redirect(new URL(target, req.url));
    }
  };

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (url.searchParams.get("error") || !code || !state) {
    return to("/login", "немає відповіді від Google");
  }

  try {
    if ((await verifyState(state)) !== "google") {
      return to("/login", "невалідний state");
    }
    const tokens = await exchangeGoogleCode(code, origin);
    if (!tokens.access_token) {
      return to("/login", "не вдалося увійти через Google");
    }
    const profile = await fetchGoogleProfile(tokens.access_token);
    const user = await upsertGoogleUser(profile);
    const res = to("/dashboard");
    await createSession(user.id, res);
    return res;
  } catch (error) {
    const message =
      error instanceof Error && error.message.startsWith("Цей email")
        ? error.message
        : "не вдалося увійти через Google";
    return to("/login", message);
  }
}
