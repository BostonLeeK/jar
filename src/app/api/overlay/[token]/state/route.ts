import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
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
    },
  });
  if (!user) {
    return jsonError("Not found", 404);
  }

  const raised = user.goalAmount > 0 ? user.monoJarBalance : user.donations.reduce((sum, item) => sum + item.amount, 0);
  const goal = user.goalAmount || user.monoJarGoal;

  return NextResponse.json({
    name: user.pageTitle || user.name,
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
    donations: user.donations.map((item) => ({
      id: item.id,
      amount: item.amount,
      nickname: item.nickname,
      message: item.message,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}
