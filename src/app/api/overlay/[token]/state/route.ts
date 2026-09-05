import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { ensureTwitchAlerts, toTwitchAlertConfig } from "@/lib/twitch-alerts";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const user = await prisma.user.findUnique({
    where: { overlayToken: token },
    include: {
      donations: {
        orderBy: { createdAt: "desc" },
        take: 12,
      },
      alertTiers: {
        orderBy: { minAmount: "asc" },
      },
    },
  });
  if (!user) {
    return jsonError("Not found", 404);
  }

  const twitchAlerts = await ensureTwitchAlerts(user.id);
  const raised = user.goalAmount > 0 ? user.monoJarBalance : user.donations.reduce((sum, item) => sum + item.amount, 0);
  const goal = user.goalAmount || user.monoJarGoal;

  return NextResponse.json({
    name: user.pageTitle || user.name,
    twitchLogin: user.twitchLogin,
    accentColor: user.overlayAccent || user.accentColor,
    showGoal: user.showGoal,
    raised,
    goal,
    overlayTone: user.overlayTone,
    overlayAccent: user.overlayAccent || user.accentColor,
    overlayDuration: user.overlayDuration,
    alertStyle: user.alertStyle,
    alertShowMessage: user.alertShowMessage,
    goalStyle: user.goalStyle,
    goalShowTitle: user.goalShowTitle,
    recentStyle: user.recentStyle,
    recentLimit: user.recentLimit,
    recentTitle: user.recentTitle,
    alertTts: user.alertTts,
    alertTiers: user.alertTiers.map((tier) => ({
      id: tier.id,
      minAmount: tier.minAmount,
      gifUrl: tier.gifUrl,
      audioUrl: tier.audioUrl,
      tts: tier.tts,
    })),
    twitchAlerts: twitchAlerts.map(toTwitchAlertConfig),
    alertUseCustom: user.alertUseCustom,
    alertCustomHtml: user.alertCustomHtml,
    alertCustomCss: user.alertCustomCss,
    goalUseCustom: user.goalUseCustom,
    goalCustomHtml: user.goalCustomHtml,
    goalCustomCss: user.goalCustomCss,
    recentUseCustom: user.recentUseCustom,
    recentCustomHtml: user.recentCustomHtml,
    recentCustomCss: user.recentCustomCss,
    donations: user.donations.map((item) => ({
      id: item.id,
      amount: item.amount,
      nickname: item.nickname,
      message: item.message,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}
