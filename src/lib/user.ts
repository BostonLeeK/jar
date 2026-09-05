import type { User } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";
import { slugify } from "@/lib/slug";

export function pageAvatar(user: { avatarUrl?: string | null; twitchAvatar?: string | null }) {
  return user.avatarUrl || user.twitchAvatar || null;
}

export async function allocateSlug(name: string) {
  let slug = slugify(name);
  if (slug.length < 3) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  const taken = await prisma.user.findUnique({ where: { slug } });
  if (taken) {
    slug = `${slug.slice(0, 24)}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return slug;
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
    alertStyle: user.alertStyle,
    alertShowMessage: user.alertShowMessage,
    goalStyle: user.goalStyle,
    goalShowTitle: user.goalShowTitle,
    recentStyle: user.recentStyle,
    recentLimit: user.recentLimit,
    recentTitle: user.recentTitle,
    pageViews: user.pageViews,
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
