import type { User } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

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
    pageTitle: user.pageTitle,
    pageBio: user.pageBio,
    pageTheme: user.pageTheme,
    accentColor: user.accentColor,
    background: user.background,
    showGoal: user.showGoal,
    goalAmount: user.goalAmount,
    minAmount: user.minAmount,
    overlayToken: user.overlayToken,
    overlayDuration: user.overlayDuration,
    alertStyle: user.alertStyle,
    pageViews: user.pageViews,
  };
}

export type SafeUser = ReturnType<typeof toSafeUser>;
