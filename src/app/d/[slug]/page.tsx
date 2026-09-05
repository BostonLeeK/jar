import { DonatePageView } from "@/components/donate-page";
import { getPageTheme } from "@/lib/themes";
import { prisma } from "@/lib/prisma";
import { pageAvatar } from "@/lib/user";
import { notFound } from "next/navigation";

export default async function DonatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await prisma.user.findUnique({
    where: { slug },
    include: {
      donations: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });
  if (!user) {
    notFound();
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { pageViews: { increment: 1 } },
  });

  return (
    <DonatePageView
      theme={getPageTheme(user.pageTheme)}
      title={user.pageTitle || user.name}
      bio={user.pageBio}
      twitchLogin={user.twitchLogin}
      avatar={pageAvatar(user)}
      showGoal={user.showGoal}
      raised={user.monoJarBalance}
      goal={user.goalAmount || user.monoJarGoal}
      slug={user.slug}
      minAmount={user.minAmount}
      ready={Boolean(user.monoSendId)}
      recent={user.donations.map((item) => ({
        id: item.id,
        nickname: item.nickname,
        amount: item.amount,
      }))}
    />
  );
}
