import { ClearTestDonations, DeleteTestDonation } from "@/components/test-donations";
import { Card } from "@/components/ui";
import { buildDailySeries, parsePeriod, periodSince } from "@/lib/analytics";
import { isTestDonation } from "@/lib/donations";
import { formatUah } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/cn";
import { requireUser } from "@/lib/user";
import Link from "next/link";

const RANGES = [
  { id: "7", label: "7 днів" },
  { id: "30", label: "30 днів" },
  { id: "all", label: "Увесь час" },
] as const;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const range = parsePeriod(params.range);
  const since = periodSince(range);

  const donations = await prisma.donation.findMany({
    where: {
      userId: user.id,
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const total = donations.reduce((sum, item) => sum + item.amount, 0);
  const average = donations.length ? Math.round(total / donations.length) : 0;
  const conversion = user.pageViews > 0 ? ((donations.length / user.pageViews) * 100).toFixed(1) : "0.0";
  const series = buildDailySeries(range, donations.map((item) => item.createdAt));
  const max = Math.max(...series.map((item) => item.value), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Аналітика</h1>
          <p className="mt-1 text-sm text-zinc-500">Донати, перегляди сторінки і конверсія.</p>
        </div>
        <div className="flex rounded-xl border border-zinc-200 bg-white p-1">
          {RANGES.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/analytics?range=${item.id}`}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm",
                range === item.id ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-zinc-500">Перегляди</p>
          <p className="mt-2 text-2xl font-semibold">{user.pageViews}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-zinc-500">Донати</p>
          <p className="mt-2 text-2xl font-semibold">{donations.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-zinc-500">Сума</p>
          <p className="mt-2 text-2xl font-semibold">{formatUah(total)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-zinc-500">Конверсія</p>
          <p className="mt-2 text-2xl font-semibold">{conversion}%</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium">Донати по днях</h2>
          <p className="text-sm text-zinc-500">Середній чек {formatUah(average)}</p>
        </div>
        <div className="flex h-40 items-end gap-1">
          {series.map((item) => (
            <div key={item.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-zinc-900"
                style={{ height: `${Math.max(6, (item.value / max) * 100)}%` }}
                title={`${item.label}: ${item.value}`}
              />
              <span className="text-[10px] text-zinc-400">{item.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium">Список за період</h2>
          {donations.some((item) => isTestDonation(item.monoTxId)) ? <ClearTestDonations /> : null}
        </div>
        {donations.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">За цей період донатів не було.</p>
        ) : (
          <div className="mt-3 divide-y divide-zinc-100">
            {donations.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {item.nickname}
                    {isTestDonation(item.monoTxId) ? (
                      <span className="ml-2 text-xs font-normal text-zinc-400">тест</span>
                    ) : null}
                  </p>
                  <p className="truncate text-zinc-500">{item.message || "—"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-right">
                  <div>
                    <p className="font-medium">{formatUah(item.amount)}</p>
                    <p className="text-xs text-zinc-400">{item.createdAt.toLocaleDateString("uk-UA")}</p>
                  </div>
                  {isTestDonation(item.monoTxId) ? <DeleteTestDonation id={item.id} /> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
