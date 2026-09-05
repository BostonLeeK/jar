import { TwitchPanel } from "@/components/twitch-panel";
import { eventsubReachable, twitchConfigured } from "@/lib/twitch";
import { requireUser, toSafeUser } from "@/lib/user";

export default async function TwitchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Twitch</h1>
        <p className="mt-1 text-sm text-zinc-500">Канал на сторінці донатів і алерти підписок, фоловерів, bits і рейдів.</p>
      </div>
      <TwitchPanel
        user={toSafeUser(user)}
        configured={twitchConfigured()}
        reachable={eventsubReachable()}
        error={params.error}
      />
    </div>
  );
}
