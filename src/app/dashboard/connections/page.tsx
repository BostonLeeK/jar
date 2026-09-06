import { Badge, Card } from "@/components/ui";
import { getConnectionByUserId } from "@/lib/monobank/service";
import { requireUser, toSafeUser } from "@/lib/user";
import Link from "next/link";

export default async function ConnectionsPage() {
  const raw = await requireUser();
  const user = toSafeUser(raw);
  const connection = await getConnectionByUserId(raw.id);
  const providerOn = connection?.status === "connected";
  const jarOn = Boolean(user.monoJarId);
  const monoOn = providerOn || jarOn;
  const monoLabel = providerOn
    ? connection?.clientName || "Акаунт підключено"
    : user.monoJarTitle || "Токен, банка або Provider API";
  const monoBadge = providerOn ? "Підключено" : jarOn ? "Банка" : "Немає";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Підключення</h1>
        <p className="mt-1 text-sm text-zinc-500">Банка Monobank і канал Twitch.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Monobank</h2>
            <Badge on={monoOn}>{monoBadge}</Badge>
          </div>
          <p className="mt-2 text-sm text-zinc-500">{monoLabel}</p>
          <Link href="/dashboard/mono" className="mt-4 inline-flex text-sm font-medium text-zinc-900 hover:underline">
            Керувати
          </Link>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Twitch</h2>
            <Badge on={Boolean(user.twitchLogin)}>{user.twitchLogin ? "Підключено" : "Немає каналу"}</Badge>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            {user.twitchDisplayName
              ? user.twitchEventSub
                ? `${user.twitchDisplayName} · алерти увімкнено`
                : user.twitchDisplayName
              : "Нік каналу, фоловери, підписки, bits і рейди."}
          </p>
          <Link href="/dashboard/twitch" className="mt-4 inline-flex text-sm font-medium text-zinc-900 hover:underline">
            Керувати
          </Link>
        </Card>
      </div>
    </div>
  );
}
