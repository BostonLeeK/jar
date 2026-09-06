import type { User } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";
import { slugify } from "@/lib/slug";

export function pageAvatar(user: { avatarUrl?: string | null; twitchAvatar?: string | null }) {
  return user.avatarUrl || user.twitchAvatar || null;
}

function isUniqueConflict(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function allocateSlug(name: string) {
  const base = slugify(name);
  for (let attempt = 0; attempt < 8; attempt++) {
    const slug =
      attempt === 0 && base.length >= 3 ? base : `${base.slice(0, 24)}-${Math.random().toString(36).slice(2, 6)}`;
    const taken = await prisma.user.findUnique({ where: { slug } });
    if (!taken) {
      return slug;
    }
  }
  return `streamer-${Math.random().toString(36).slice(2, 10)}`;
}

export async function upsertGoogleUser(profile: { id: string; email: string; name: string }) {
  const byGoogle = await prisma.user.findUnique({ where: { googleId: profile.id } });
  if (byGoogle) {
    return byGoogle;
  }

  const byEmail = await prisma.user.findUnique({ where: { email: profile.email } });
  if (byEmail) {
    if (byEmail.googleId && byEmail.googleId !== profile.id) {
      throw new Error("Цей email уже привʼязаний до іншого входу");
    }
    if (!byEmail.googleId) {
      try {
        return await prisma.user.update({
          where: { id: byEmail.id },
          data: { googleId: profile.id },
        });
      } catch (error) {
        if (isUniqueConflict(error)) {
          const existing = await prisma.user.findUnique({ where: { googleId: profile.id } });
          if (existing) {
            return existing;
          }
        }
        throw error;
      }
    }
    return byEmail;
  }

  try {
    return await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name.slice(0, 40) || "Streamer",
        slug: await allocateSlug(profile.name),
        googleId: profile.id,
        pageTitle: profile.name.slice(0, 60),
      },
    });
  } catch (error) {
    if (isUniqueConflict(error)) {
      const existing = await prisma.user.findFirst({
        where: { OR: [{ googleId: profile.id }, { email: profile.email }] },
      });
      if (existing) {
        return existing;
      }
    }
    throw error;
  }
}

export async function getCurrentUser() {
  const session = await readSession();
  if (!session) {
    return null;
  }
  return prisma.user.findUnique({ where: { id: session.userId } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  return user;
}

export function toSafeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    slug: user.slug,
    createdAt: user.createdAt,
    hasMono: Boolean(user.monoTokenEnc),
    monoJarId: user.monoJarId,
    monoSendId: user.monoSendId,
    monoJarTitle: user.monoJarTitle,
    monoJarBalance: user.monoJarBalance,
    monoJarGoal: user.monoJarGoal,
    monoWebhookSet: user.monoWebhookSet,
    twitchId: user.twitchId,
    twitchLogin: user.twitchLogin,
    twitchDisplayName: user.twitchDisplayName,
    twitchAvatar: user.twitchAvatar,
    twitchEventSub: user.twitchEventSub,
    avatarUrl: user.avatarUrl,
    pageCoverUrl: user.pageCoverUrl,
    socialTwitch: user.socialTwitch,
    socialYoutube: user.socialYoutube,
    socialDiscord: user.socialDiscord,
    socialInstagram: user.socialInstagram,
    socialTiktok: user.socialTiktok,
    socialX: user.socialX,
    hasPassword: Boolean(user.passwordHash),
    googleId: user.googleId,
    pageTitle: user.pageTitle,
    pageBio: user.pageBio,
    pageTheme: user.pageTheme,
    accentColor: user.accentColor,
    background: user.background,
    showGoal: user.showGoal,
    goalAmount: user.goalAmount,
    minAmount: user.minAmount,
    overlayToken: user.overlayToken,
    overlayTone: user.overlayTone,
    overlayAccent: user.overlayAccent,
    overlayDuration: user.overlayDuration,
    overlayChatDuration: user.overlayChatDuration,
    alertStyle: user.alertStyle,
    alertShowMessage: user.alertShowMessage,
    goalStyle: user.goalStyle,
    goalShowTitle: user.goalShowTitle,
    recentStyle: user.recentStyle,
    recentLimit: user.recentLimit,
    recentTitle: user.recentTitle,
    pageViews: user.pageViews,
    pageListed: user.pageListed,
    pageUseCustom: user.pageUseCustom,
    pageCustomHtml: user.pageCustomHtml,
    pageCustomCss: user.pageCustomCss,
    alertUseCustom: user.alertUseCustom,
    alertCustomHtml: user.alertCustomHtml,
    alertCustomCss: user.alertCustomCss,
    goalUseCustom: user.goalUseCustom,
    goalCustomHtml: user.goalCustomHtml,
    goalCustomCss: user.goalCustomCss,
    recentUseCustom: user.recentUseCustom,
    recentCustomHtml: user.recentCustomHtml,
    recentCustomCss: user.recentCustomCss,
  };
}

export type SafeUser = ReturnType<typeof toSafeUser>;
