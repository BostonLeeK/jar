import { formatUah } from "@/lib/money";

export function DonatePreview({
  name,
  bio,
  accent,
  background,
  showGoal,
  raised,
  goal,
  twitchLogin,
  twitchAvatar,
}: {
  name: string;
  bio: string;
  accent: string;
  background: string;
  showGoal: boolean;
  raised: number;
  goal: number;
  twitchLogin: string | null;
  twitchAvatar: string | null;
}) {
  const progress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return (
    <div className="overflow-hidden rounded-xl border border-white/8">
      <div className="border-b border-white/8 px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
        Превʼю
      </div>
      <div className="p-5" style={{ background, color: accent }}>
        <div className="flex items-center gap-3">
          {twitchAvatar ? <img src={twitchAvatar} alt="" className="h-10 w-10 rounded-full" /> : null}
          <div>
            <p className="text-lg font-medium tracking-tight">{name || "Твій нік"}</p>
            {twitchLogin ? <p className="text-xs opacity-60">twitch.tv/{twitchLogin}</p> : null}
          </div>
        </div>
        {bio ? <p className="mt-4 text-sm opacity-70">{bio}</p> : null}
        {showGoal && goal > 0 ? (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs opacity-70">
              <span>{formatUah(raised)}</span>
              <span>{formatUah(goal)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: accent }} />
            </div>
          </div>
        ) : null}
        <div className="mt-6 space-y-2 opacity-80">
          <div className="h-9 rounded-md border border-white/20" />
          <div className="h-9 rounded-md border border-white/20" />
          <div className="h-16 rounded-md border border-white/20" />
          <div className="h-9 rounded-md" style={{ background: accent, color: background }} />
        </div>
      </div>
    </div>
  );
}
