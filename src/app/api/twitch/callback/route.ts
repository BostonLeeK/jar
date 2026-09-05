import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { verifyState } from "@/lib/session";
import { exchangeTwitchCode, fetchTwitchUser } from "@/lib/twitch";
import { ensureEventSub } from "@/lib/twitch-eventsub";
import { getPublicOrigin } from "@/lib/urls";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = getPublicOrigin(req);
  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/dashboard/twitch?error=${encodeURIComponent(reason)}`);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return fail("немає code або state від Twitch");
  }

  try {
    const userId = await verifyState(state);
    const tokens = await exchangeTwitchCode(code, origin);
    const profile = await fetchTwitchUser(tokens.access_token);
    const twitchEventSub = await ensureEventSub(profile.id).catch(() => false);
    await prisma.user.update({
      where: { id: userId },
      data: {
        twitchId: profile.id,
        twitchLogin: profile.login,
        twitchDisplayName: profile.display_name,
        twitchAvatar: profile.profile_image_url,
        twitchAccessEnc: encrypt(tokens.access_token),
        twitchRefreshEnc: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
        twitchEventSub,
      },
    });
    return NextResponse.redirect(`${origin}/dashboard/twitch`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "невідома помилка";
    return fail(message);
  }
}
