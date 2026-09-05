import { Badge, Card } from "@/components/ui";
import { requireUser, toSafeUser } from "@/lib/user";
import Link from "next/link";

export default async function ConnectionsPage() {
  const user = toSafeUser(await requireUser());

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Підключення</h1>
        <p className="mt-1 text-sm text-zinc-500">Банка Monobank і канал Twitch.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Monobank</h2>
            <Badge on={Boolean(user.monoJarId)}>{user.monoJarId ? "Підключено" : "Немає банки"}</Badge>
          </div>
          <p className="mt-2 text-sm text-zinc-500">{user.monoJarTitle || "Токен і вибір Банки"}</p>
          <Link href="/dashboard/mono" className="mt-4 inline-flex text-sm font-medium text-zinc-900 hover:underline">
            Керувати
          </Link>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Twitch</h2>
            <Badge on={Boolean(user.twitchLogin)}>{user.twitchLogin ? "Підключено" : "Немає каналу"}</Badge>
          </div>
          <p className="mt-2 text-sm text-zinc-500">{user.twitchDisplayName || "Нік і аватар на сторінці"}</p>
          <Link href="/dashboard/twitch" className="mt-4 inline-flex text-sm font-medium text-zinc-900 hover:underline">
            Керувати
          </Link>
        </Card>
      </div>
    </div>
  );
}
