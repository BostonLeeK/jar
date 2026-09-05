import { DonatePreview } from "@/components/donate-preview";
import { Badge, Button, Card } from "@/components/ui";
import { TestDonateForm } from "@/components/widgets-panel";
import { formatUah } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { donatePath, getAppUrl } from "@/lib/urls";
import { requireUser, toSafeUser } from "@/lib/user";
import Link from "next/link";

export default async function DashboardPage() {
  const raw = await requireUser();
  const user = toSafeUser(raw);
  const [donations, donationCount, raised] = await Promise.all([
    prisma.donation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.donation.count({ where: { userId: user.id } }),
    prisma.donation.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    }),
  ]);
  const donateUrl = `${getAppUrl()}${donatePath(user.slug)}`;
  const raisedAmount = raised._sum.amount ?? user.monoJarBalance;
  const goal = user.goalAmount || user.monoJarGoal;
  const progress = goal > 0 ? Math.min(100, Math.round((user.monoJarBalance / goal) * 100)) : 0;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Привіт, {user.name}!</h1>
          <p className="mt-1 text-sm text-zinc-500">Панель керування сторінкою, Банкою і віджетами.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-sm text-zinc-500">Донати</p>
            <p className="mt-2 text-2xl font-semibold">{donationCount}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-zinc-500">Зібрано</p>
            <p className="mt-2 text-2xl font-semibold">{formatUah(raisedAmount)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-zinc-500">Перегляди</p>
            <p className="mt-2 text-2xl font-semibold">{user.pageViews}</p>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Підключення банки</p>
                <Badge on={Boolean(user.monoJarId)}>{user.monoJarId ? "Підключено" : "Немає банки"}</Badge>
              </div>
              <p className="mt-2 text-sm text-zinc-500">{user.monoJarTitle || "Обери Банку в підключеннях"}</p>
            </div>
            <Link href="/dashboard/connections">
              <Button variant="secondary">Керувати</Button>
            </Link>
          </div>
          {goal > 0 ? (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs text-zinc-500">
                <span>{formatUah(user.monoJarBalance)}</span>
                <span>{formatUah(goal)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-zinc-900" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Віджети</h2>
            <Link href="/dashboard/widgets" className="text-sm text-zinc-500 hover:text-zinc-900">
              Налаштувати
            </Link>
          </div>
          <p className="mt-1 text-sm text-zinc-500">Тестовий алерт без справжнього переказу.</p>
          <TestDonateForm />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-medium">Останні донати</h2>
          {donations.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">Ще порожньо. Надішли тест або дочекайся webhook.</p>
          ) : (
            <div className="mt-3 divide-y divide-zinc-100">
              {donations.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.nickname}</p>
                    <p className="truncate text-zinc-500">{item.message || "—"}</p>
                  </div>
                  <p className="shrink-0 font-medium">{formatUah(item.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-4">
        <DonatePreview
          name={user.pageTitle || user.name}
          bio={user.pageBio}
          themeId={user.pageTheme}
          showGoal={user.showGoal}
          raised={user.monoJarBalance}
          goal={goal}
          twitchLogin={user.twitchLogin}
          twitchAvatar={user.twitchAvatar}
          slug={user.slug}
          minAmount={user.minAmount}
          ready={Boolean(user.monoSendId)}
        />
        <Card className="p-4">
          <p className="text-sm font-medium">Поділитись сторінкою</p>
          <p className="mt-2 break-all font-mono text-xs text-zinc-500">{donateUrl}</p>
          <Link href="/dashboard/customize" className="mt-3 inline-block text-sm text-zinc-500 hover:text-zinc-900">
            Редагувати сторінку
          </Link>
        </Card>
      </div>
    </div>
  );
}
