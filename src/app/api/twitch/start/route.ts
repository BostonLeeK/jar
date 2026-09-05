import { jsonError } from "@/lib/http";
import { signState } from "@/lib/session";
import { twitchAuthorizeUrl, twitchConfigured } from "@/lib/twitch";
import { getPublicOrigin } from "@/lib/urls";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  if (!twitchConfigured()) {
    return jsonError("Додай TWITCH_CLIENT_ID і TWITCH_CLIENT_SECRET у .env");
  }
  const state = await signState(user.id);
  return NextResponse.redirect(twitchAuthorizeUrl(state, getPublicOrigin(req)));
}
