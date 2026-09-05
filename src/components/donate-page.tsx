import { DonateForm } from "@/components/donate-form";
import { formatUah } from "@/lib/money";
import type { PageTheme } from "@/lib/themes";
import { cn } from "@/lib/cn";

export type DonateRecent = {
  id: string;
  nickname: string;
  amount: number;
};

export function DonatePageView({
  theme,
  title,
  bio,
  twitchLogin,
  twitchAvatar,
  showGoal,
  raised,
  goal,
  slug,
  minAmount,
  ready,
  recent,
  preview,
}: {
  theme: PageTheme;
  title: string;
  bio: string;
  twitchLogin: string | null;
  twitchAvatar: string | null;
  showGoal: boolean;
  raised: number;
  goal: number;
  slug: string;
  minAmount: number;
  ready: boolean;
  recent: DonateRecent[];
  preview?: boolean;
}) {
  const progress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const cover = theme.layout === "cover";
  const split = theme.layout === "split";

  return (
    <div
      className={cn("relative min-h-full overflow-hidden", preview ? "min-h-[640px]" : "min-h-dvh")}
      style={{ background: theme.background, color: theme.text }}
    >
      {theme.glow !== "none" ? (
        <div className="pointer-events-none absolute inset-0" style={{ background: theme.glow }} />
      ) : null}
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-5xl flex-col px-5 py-10",
          cover && "pt-0",
          split && "md:grid md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-16 md:py-20",
        )}
      >
        {cover ? <div className="h-40 w-full" style={{ background: theme.glow }} /> : null}
        <header className={cn(cover && "-mt-10", split && "md:sticky md:top-20")}>
          <div className="flex items-center gap-4">
            {twitchAvatar ? (
              <img
                src={twitchAvatar}
                alt=""
                className="h-16 w-16 object-cover"
                style={{ borderRadius: theme.id === "mono" ? "0" : "999px", border: `1px solid ${theme.border}` }}
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center text-xl font-semibold"
                style={{
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: theme.id === "mono" ? "0" : "999px",
                }}
              >
                {title.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.18em]" style={{ color: theme.muted }}>
                {theme.tag}
              </p>
              <h1 className="mt-1 text-4xl font-semibold tracking-tight">{title}</h1>
              {twitchLogin ? (
                <a
                  href={`https://twitch.tv/${twitchLogin}`}
                  className="mt-1 inline-block text-sm"
                  style={{ color: theme.muted }}
                  target="_blank"
                  rel="noreferrer"
                >
                  twitch.tv/{twitchLogin}
                </a>
              ) : null}
            </div>
          </div>
          {bio ? (
            <p className="mt-5 max-w-md text-base leading-7" style={{ color: theme.muted }}>
              {bio}
            </p>
          ) : null}
          {showGoal && goal > 0 ? (
            <div className="mt-8 max-w-md">
              <div className="mb-2 flex justify-between text-sm" style={{ color: theme.muted }}>
                <span>{formatUah(raised)}</span>
                <span>{formatUah(goal)}</span>
              </div>
              <div className="h-2 overflow-hidden" style={{ background: theme.field, borderRadius: theme.radius }}>
                <div className="h-full" style={{ width: `${progress}%`, background: theme.accent }} />
              </div>
            </div>
          ) : null}
          {recent.length > 0 ? (
            <ul className="mt-8 max-w-md space-y-2">
              {recent.slice(0, 3).map((item) => (
                <li key={item.id} className="flex justify-between text-sm" style={{ color: theme.muted }}>
                  <span>{item.nickname}</span>
                  <span style={{ color: theme.text }}>{formatUah(item.amount)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        <section
          className={cn("mt-10", cover && "mt-8", split && "md:mt-0")}
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: theme.radius,
            padding: theme.id === "mono" ? "28px" : "24px",
          }}
        >
          {ready ? (
            <DonateForm slug={slug} minAmount={minAmount} theme={theme} preview={preview} />
          ) : (
            <p className="text-sm" style={{ color: theme.muted }}>
              Стрімер ще не підключив Банку.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
