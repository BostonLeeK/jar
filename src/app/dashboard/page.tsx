import { StatusDot } from "@/components/status-dot";
import { Card } from "@/components/ui";
import { TestDonateForm } from "@/components/widgets-panel";
import { formatUah } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { donatePath, getAppUrl } from "@/lib/urls";
import { requireUser, toSafeUser } from "@/lib/user";
import Link from "next/link";

export default async function DashboardPage() {
  const raw = await requireUser();
  const user = toSafeUser(raw);
  const donations = await prisma.donation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  const donateUrl = `${getAppUrl()}${donatePath(user.slug)}`;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Огляд</h1>
        <p className="mt-1 text-sm text-zinc-500">Підключення, сторінка і останні донати.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <StatusDot on={user.hasMono} label={user.hasMono ? "Monobank" : "Немає токена"} />
          <p className="mt-2 text-sm text-zinc-400">{user.monoJarTitle || "Обери банку"}</p>
        </Card>
        <Card className="p-4">
          <StatusDot on={Boolean(user.twitchLogin)} label={user.twitchLogin ? "Twitch" : "Twitch не підключено"} />
          <p className="mt-2 text-sm text-zinc-400">{user.twitchDisplayName || "Канал"}</p>
        </Card>
        <Card className="p-4">
          <StatusDot on={user.monoWebhookSet} label={user.monoWebhookSet ? "Webhook активний" : "Webhook вимкнено"} />
          <p className="mt-2 text-sm text-zinc-400">{user.monoWebhookSet ? "Події йдуть" : "Потрібен публічний URL"}</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Сторінка донатів</p>
            <p className="mt-1 font-mono text-sm">{donateUrl}</p>
          </div>
          <Link href="/dashboard/customize" className="text-sm text-zinc-400 hover:text-white">
            Налаштувати
          </Link>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-medium">Тестовий донат</h2>
        <p className="mt-1 text-sm text-zinc-500">Перевіряє overlay без справжнього переказу.</p>
        <TestDonateForm />
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-medium">Останні донати</h2>
        {donations.length === 0 ? (
          <p className="text-sm text-zinc-500">Ще порожньо. Надішли тест або дочекайся webhook.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/8">
            {donations.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${index ? "border-t border-white/8" : ""}`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.nickname}</p>
                  <p className="truncate text-zinc-500">{item.message || "—"}</p>
                </div>
                <p className="shrink-0 font-mono">{formatUah(item.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
