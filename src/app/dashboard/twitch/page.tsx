import { TwitchPanel } from "@/components/twitch-panel";
import { twitchConfigured } from "@/lib/twitch";
import { requireUser, toSafeUser } from "@/lib/user";

export default async function TwitchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Twitch</h1>
        <p className="mt-1 text-sm text-zinc-500">Підключи канал, щоб він зʼявився на сторінці донатів.</p>
      </div>
      <TwitchPanel user={toSafeUser(user)} configured={twitchConfigured()} error={params.error} />
    </div>
  );
}
