import { CustomLayout } from "@/components/custom-markup";
import { DonateForm } from "@/components/donate-form";
import { DonateChrome } from "@/components/donate-share";
import { LogoMark } from "@/components/icons";
import Link from "next/link";
import { formatUah } from "@/lib/money";
import { DEFAULT_PAGE_CSS, DEFAULT_PAGE_HTML } from "@/lib/custom-defaults";
import { escapeAttr, escapeHtml } from "@/lib/template";
import { hasSocial, type SocialLinks } from "@/lib/social";
import { headingClass, type PageTheme } from "@/lib/themes";
import { cn } from "@/lib/cn";
import { SiDiscord, SiInstagram, SiTiktok, SiTwitch, SiX, SiYoutube } from "react-icons/si";
import type { IconType } from "react-icons";

export type DonateRecent = {
  id: string;
  nickname: string;
  amount: number;
};

function nickHue(name: string) {
  const palette = ["#7c3aed", "#db2777", "#0891b2", "#16a34a", "#ea580c", "#2563eb"];
  let hash = 0;
  for (const char of name) {
    hash = (hash + char.charCodeAt(0)) % palette.length;
  }
  return palette[hash];
}

function ThemeArt({ theme }: { theme: PageTheme }) {
  if (theme.id === "paper") {
    return (
      <div className="flex h-full items-end justify-center pb-16">
        <div className="h-40 w-28 rotate-6 rounded-sm bg-white shadow-md" />
      </div>
    );
  }
  if (theme.id === "aurora") {
    return <div className="h-full w-full jar-hearts" />;
  }
  if (theme.id === "mono") {
    return (
      <div
        className="h-full w-full"
        style={{ background: "linear-gradient(180deg, #9ec5e8 0%, #d7e6f3 40%, #8fb4a0 100%)" }}
      />
    );
  }
  if (theme.id === "violet") {
    return (
      <div
        className="h-full w-full"
        style={{ background: "radial-gradient(circle at 70% 30%, #6d28d9 0%, #1e1033 48%, #12081c 100%)" }}
      />
    );
  }
  return (
    <div
      className="h-full w-full"
      style={{ background: "radial-gradient(ellipse at 62% 38%, #5a5a5a 0%, #1a1a1a 42%, #0a0a0a 100%)" }}
    />
  );
}

function SiteLogo({
  tone,
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <Link href="/" aria-label="Повернутися на Jar" className={cn("inline-flex shrink-0", className)}>
      <LogoMark tone={tone} className="h-7" />
    </Link>
  );
}

function SocialIcon({
  href,
  label,
  icon: Icon,
  color,
}: {
  href: string;
  label: string;
  icon: IconType;
  color: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex h-8 w-8 items-center justify-center opacity-80"
      style={{ color }}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

export function DonatePageView({
  theme,
  title,
  bio,
  twitchLogin,
  avatar,
  cover,
  showGoal,
  raised,
  goal,
  slug,
  minAmount,
  ready,
  recent,
  recentCount,
  preview,
  custom,
  social,
}: {
  theme: PageTheme;
  title: string;
  bio: string;
  twitchLogin: string | null;
  avatar: string | null;
  cover?: string | null;
  showGoal: boolean;
  raised: number;
  goal: number;
  slug: string;
  minAmount: number;
  ready: boolean;
  recent: DonateRecent[];
  recentCount?: number;
  preview?: boolean;
  custom?: { enabled: boolean; html: string; css: string };
  social?: SocialLinks;
}) {
  const progress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const faces = recent.slice(0, 3);
  const extra = Math.max(0, (recentCount ?? recent.length) - faces.length);
  const form = ready ? (
    <DonateForm slug={slug} minAmount={minAmount} theme={theme} preview={preview} />
  ) : (
    <p className="text-sm" style={{ color: theme.muted }}>
      Стрімер ще не підключив Банку.
    </p>
  );

  if (custom?.enabled) {
    return (
      <div className={cn("relative", preview ? "h-full min-h-0" : "min-h-dvh")}>
        {preview ? null : <style>{`html,body{min-height:100dvh;}`}</style>}
        <SiteLogo tone={theme.tone} className="absolute left-5 top-4 z-20" />
        <CustomLayout
          html={custom.html || DEFAULT_PAGE_HTML}
          css={custom.css || DEFAULT_PAGE_CSS}
          vars={{
            title: escapeHtml(title),
            bio: escapeHtml(bio),
            avatar: avatar ? `<img class="jar-avatar" src="${escapeAttr(avatar)}" alt="">` : "",
            cover: cover ? `<img class="jar-cover" src="${escapeAttr(cover)}" alt="">` : "",
            twitch: twitchLogin
              ? `<a href="https://twitch.tv/${escapeAttr(twitchLogin)}" target="_blank" rel="noreferrer">twitch.tv/${escapeHtml(twitchLogin)}</a>`
              : "",
            raised: escapeHtml(formatUah(raised)),
            goal: escapeHtml(formatUah(goal)),
            percent: String(progress),
          }}
          lists={{
            recent: recent.map((item) => ({
              nickname: escapeHtml(item.nickname),
              amount: escapeHtml(formatUah(item.amount)),
            })),
          }}
          slots={{ donate: form }}
        />
      </div>
    );
  }

  const card = (
    <div
      className={cn("relative isolate w-full overflow-hidden", preview ? "h-full" : "min-h-dvh")}
      style={{ background: theme.background, color: theme.text }}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2">
        {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <ThemeArt theme={theme} />}
      </div>
      <div className="pointer-events-none absolute inset-0" style={{ background: theme.veil }} />
      {theme.id === "paper" ? <div className="pointer-events-none absolute inset-0 jar-paper" /> : null}
      {theme.note ? (
        <p
          className="pointer-events-none absolute right-6 bottom-10 z-10 max-w-[12rem] text-right text-[22px] leading-none opacity-70 sm:right-10"
          style={{ fontFamily: "var(--font-caveat)", color: theme.muted }}
        >
          {theme.note}
        </p>
      ) : null}

      <div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-5xl flex-col px-6 py-5 sm:px-8 lg:px-10",
          preview ? "h-full" : "min-h-dvh",
        )}
      >
        <header className="flex items-center justify-between gap-3">
          <SiteLogo tone={theme.tone} />
          <DonateChrome slug={slug} color={theme.text} border={theme.border} preview={preview} />
        </header>

        <div className="flex w-full max-w-[18rem] flex-1 flex-col justify-center space-y-5 sm:max-w-xs">
          <div>
            <h1 className={cn("text-[2.15rem] leading-[1.08] sm:text-[2.4rem]", headingClass(theme))}>{title}</h1>
            <p className="mt-2 text-sm leading-6" style={{ color: theme.muted }}>
              {bio || "Дякую за підтримку стріму"}
            </p>
          </div>

          {showGoal && goal > 0 ? (
            <div>
              <div className="mb-2 flex items-end justify-between gap-3 text-[13px]">
                <span>
                  {formatUah(raised)} / {formatUah(goal)}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: theme.track }}>
                <div className="h-full rounded-full" style={{ width: `${progress}%`, background: theme.accent }} />
              </div>
            </div>
          ) : null}

          {form}

          <div className="flex items-center gap-3 pt-1">
            <div className="flex -space-x-2">
              {faces.length > 0 ? (
                faces.map((item) => (
                  <span
                    key={item.id}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                    style={{ background: nickHue(item.nickname), boxShadow: `0 0 0 2px ${theme.background}` }}
                    title={item.nickname}
                  >
                    {item.nickname.slice(0, 1).toUpperCase()}
                  </span>
                ))
              ) : (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{ background: theme.surface, boxShadow: `0 0 0 2px ${theme.background}` }}
                >
                  +
                </span>
              )}
              {extra > 0 ? (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold"
                  style={{ background: theme.surface, color: theme.text, boxShadow: `0 0 0 2px ${theme.background}` }}
                >
                  +{extra}
                </span>
              ) : null}
            </div>
            <span className="text-sm" style={{ color: theme.muted }}>
              Останні донати →
            </span>
          </div>
        </div>

        {social && hasSocial(social) ? (
          <div className="flex items-center gap-1 pt-4" style={{ color: theme.text }}>
            {social.twitch ? (
              <SocialIcon href={social.twitch} label="Twitch" icon={SiTwitch} color={theme.text} />
            ) : null}
            {social.youtube ? (
              <SocialIcon href={social.youtube} label="YouTube" icon={SiYoutube} color={theme.text} />
            ) : null}
            {social.discord ? (
              <SocialIcon href={social.discord} label="Discord" icon={SiDiscord} color={theme.text} />
            ) : null}
            {social.instagram ? (
              <SocialIcon href={social.instagram} label="Instagram" icon={SiInstagram} color={theme.text} />
            ) : null}
            {social.tiktok ? (
              <SocialIcon href={social.tiktok} label="TikTok" icon={SiTiktok} color={theme.text} />
            ) : null}
            {social.x ? <SocialIcon href={social.x} label="X" icon={SiX} color={theme.text} /> : null}
          </div>
        ) : (
          <div className="pt-4" />
        )}
      </div>
    </div>
  );

  if (preview) {
    return card;
  }

  return (
    <>
      <style>{`html,body{background:${theme.background}!important;min-height:100dvh;}`}</style>
      {card}
    </>
  );
}
