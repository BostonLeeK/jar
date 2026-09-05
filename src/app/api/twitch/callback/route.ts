import { prisma } from "@/lib/prisma";
import { verifyState } from "@/lib/session";
import { exchangeTwitchCode, fetchTwitchUser } from "@/lib/twitch";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const fail = new URL("/dashboard/twitch?error=1", url.origin);

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
    return NextResponse.redirect(new URL("/dashboard/twitch", url.origin));
  } catch {
    return NextResponse.redirect(fail);
  }
}
