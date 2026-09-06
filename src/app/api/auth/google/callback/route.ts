import { exchangeGoogleCode, fetchGoogleProfile } from "@/lib/google";
import { prisma } from "@/lib/prisma";
import { createSession, verifyState } from "@/lib/session";
import { getPublicOrigin } from "@/lib/urls";
import { allocateSlug } from "@/lib/user";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = getPublicOrigin(req);
  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return fail("немає відповіді від Google");
  }

  try {
    if ((await verifyState(state)) !== "google") {
      return fail("невалідний state");
    }
    const tokens = await exchangeGoogleCode(code, origin);
    const profile = await fetchGoogleProfile(tokens.access_token);
    const existing = await prisma.user.findFirst({
      where: { OR: [{ googleId: profile.id }, { email: profile.email }] },
    });

    const user =
      existing ??
      (await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name.slice(0, 40) || "Streamer",
          slug: await allocateSlug(profile.name),
          googleId: profile.id,
          pageTitle: profile.name.slice(0, 60),
        },
      }));

    if (!existing) {
      await createSession(user.id);
      return NextResponse.redirect(`${origin}/dashboard`);
    }

    if (!existing.googleId) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { googleId: profile.id },
      });
    }
    await createSession(existing.id);
    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "невідома помилка";
    return fail(message);
  }
}
