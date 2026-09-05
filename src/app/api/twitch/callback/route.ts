import { prisma } from "@/lib/prisma";
import { verifyState } from "@/lib/session";
import { exchangeTwitchCode, fetchTwitchUser } from "@/lib/twitch";
import { getAppUrl } from "@/lib/urls";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const appUrl = getAppUrl();
  const fail = `${appUrl}/dashboard/twitch?error=1`;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(fail);
  }

  try {
    const userId = await verifyState(state);
    const tokens = await exchangeTwitchCode(code);
    const profile = await fetchTwitchUser(tokens.access_token);
    await prisma.user.update({
      where: { id: userId },
      data: {
        twitchId: profile.id,
        twitchLogin: profile.login,
        twitchDisplayName: profile.display_name,
        twitchAvatar: profile.profile_image_url,
      },
    });
    return NextResponse.redirect(`${appUrl}/dashboard/twitch`);
  } catch {
    return NextResponse.redirect(fail);
  }
}
