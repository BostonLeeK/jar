import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { deleteEventSub } from "@/lib/twitch-eventsub";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  if (user.twitchId) {
    await deleteEventSub(user.twitchId).catch(() => undefined);
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      twitchId: null,
      twitchLogin: null,
      twitchDisplayName: null,
      twitchAvatar: null,
      twitchAccessEnc: null,
      twitchRefreshEnc: null,
      twitchEventSub: false,
    },
  });
  return NextResponse.json({ ok: true });
}
