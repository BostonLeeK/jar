import { WidgetsStudio } from "@/components/widgets-studio";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/urls";
import { requireUser } from "@/lib/user";

export default async function WidgetsPage() {
  const user = await requireUser();
  const donations = await prisma.donation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Віджети</h1>
        <p className="mt-1 text-sm text-zinc-500">Налаштування алерту, прогресу і списку. Превʼю на чорному або білому фоні.</p>
      </div>
      <WidgetsStudio
        token={user.overlayToken}
        appUrl={getAppUrl()}
        name={user.pageTitle || user.name}
        raised={user.monoJarBalance}
        goal={user.goalAmount || user.monoJarGoal}
        overlayTone={user.overlayTone}
        overlayAccent={user.overlayAccent}
        overlayDuration={user.overlayDuration}
        alertStyle={user.alertStyle}
        alertShowMessage={user.alertShowMessage}
        goalStyle={user.goalStyle}
        goalShowTitle={user.goalShowTitle}
        recentStyle={user.recentStyle}
        recentLimit={user.recentLimit}
        recentTitle={user.recentTitle}
        donations={donations.map((item) => ({
          id: item.id,
          amount: item.amount,
          nickname: item.nickname,
          message: item.message,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
