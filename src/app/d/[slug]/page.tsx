import { DonateForm } from "@/components/donate-form";
import { formatUah } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function DonatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await prisma.user.findUnique({ where: { slug } });
  if (!user) {
    notFound();
  }

  const title = user.pageTitle || user.name;
  const goal = user.goalAmount || user.monoJarGoal;
  const progress = goal > 0 ? Math.min(100, Math.round((user.monoJarBalance / goal) * 100)) : 0;

  return (
    <main className="flex min-h-full items-center justify-center px-6 py-16" style={{ background: user.background, color: user.accentColor }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3">
          {user.twitchAvatar ? <img src={user.twitchAvatar} alt="" className="h-12 w-12 rounded-full" /> : null}
          <div>
            <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
            {user.twitchLogin ? (
              <a
                href={`https://twitch.tv/${user.twitchLogin}`}
                className="text-sm opacity-60 hover:opacity-100"
                target="_blank"
                rel="noreferrer"
              >
                twitch.tv/{user.twitchLogin}
              </a>
            ) : null}
          </div>
        </div>
        {user.pageBio ? <p className="mt-4 text-sm opacity-70">{user.pageBio}</p> : null}
        {user.showGoal && goal > 0 ? (
          <div className="mt-8">
            <div className="mb-2 flex justify-between text-xs opacity-70">
              <span>{formatUah(user.monoJarBalance)}</span>
              <span>{formatUah(goal)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: user.accentColor }} />
            </div>
          </div>
        ) : null}
        <div className="mt-8">
          {user.monoSendId ? (
            <DonateForm
              slug={user.slug}
              minAmount={user.minAmount}
              accent={user.accentColor}
              background={user.background}
            />
          ) : (
            <p className="text-sm opacity-60">Стрімер ще не підключив Банку.</p>
          )}
        </div>
      </div>
    </main>
  );
}
