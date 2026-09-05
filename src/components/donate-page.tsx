import { CustomLayout } from "@/components/custom-markup";
import { DonateForm } from "@/components/donate-form";
import { DonateChrome } from "@/components/donate-share";
import { LogoMark } from "@/components/icons";
import { formatUah } from "@/lib/money";
import { DEFAULT_PAGE_CSS, DEFAULT_PAGE_HTML } from "@/lib/custom-defaults";
import { escapeAttr, escapeHtml } from "@/lib/template";
import { hasSocial, type SocialLinks } from "@/lib/social";
import { headingClass, type PageTheme } from "@/lib/themes";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

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

function SocialIcon({
  href,
  label,
  children,
  color,
}: {
  href: string;
  label: string;
  children: ReactNode;
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
      {children}
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
      <div className={preview ? "h-full min-h-0" : "min-h-dvh"}>
        {preview ? null : <style>{`html,body{min-height:100dvh;}`}</style>}
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
      className={cn("relative isolate h-full w-full overflow-hidden", !preview && "max-h-[860px]")}
      style={{ background: theme.background, color: theme.text }}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[46%]">
        {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <ThemeArt theme={theme} />}
      </div>
      <div className="pointer-events-none absolute inset-0" style={{ background: theme.veil }} />
      {theme.id === "paper" ? <div className="pointer-events-none absolute inset-0 jar-paper" /> : null}
      {theme.note ? (
        <p
          className="pointer-events-none absolute right-5 bottom-24 max-w-[38%] text-right text-[22px] leading-none opacity-70"
          style={{ fontFamily: "var(--font-caveat)", color: theme.muted }}
        >
          {theme.note}
        </p>
      ) : null}

      <div className="relative z-10 flex h-full flex-col px-6 py-6">
        <header className="flex items-center justify-between gap-3">
          <LogoMark tone={theme.tone} className="h-7" />
          <DonateChrome slug={slug} color={theme.text} border={theme.border} preview={preview} />
        </header>

        <div className="mt-16 max-w-[17.5rem] space-y-5">
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
          <div className="mt-auto flex items-center gap-1 pt-8" style={{ color: theme.text }}>
            {social.twitch ? (
              <SocialIcon href={social.twitch} label="Twitch" color={theme.text}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M4 3h16v11.2L16.4 21H11l-2.4-2.4H4zm1.6 1.6v12h3.2l2.4 2.4h4l2.8-2.8V4.6zm7.2 2.4h1.6v4.8h-1.6zm-4 0h1.6v4.8H8.8z" />
                </svg>
              </SocialIcon>
            ) : null}
            {social.youtube ? (
              <SocialIcon href={social.youtube} label="YouTube" color={theme.text}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M22 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C18.2 5.4 12 5.4 12 5.4s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 9 2 12.2 2 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6ZM10 15.2V9.2l5.2 3-5.2 3Z" />
                </svg>
              </SocialIcon>
            ) : null}
            {social.discord ? (
              <SocialIcon href={social.discord} label="Discord" color={theme.text}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M8.3 7.8c2.4-1.1 4.7-1.1 7.4 0M7.2 16.2c.9 1.3 2.3 2.2 4.8 2.2s3.9-.9 4.8-2.2M8.6 15.3c-.8 0-1.5-.7-1.5-1.5S7.8 12.3 8.6 12.3s1.4.7 1.4 1.5-.6 1.5-1.4 1.5Zm6.8 0c-.8 0-1.4-.7-1.4-1.5s.6-1.5 1.4-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5ZM4.8 6.4C6.7 4.7 9.2 4 12 4s5.3.7 7.2 2.4c1.4 1.3 2.2 3.8 2.3 6.6 0 2.2-.4 4.2-1.7 5.4-1.4 1.3-3.3 1.6-5 1.6l-1.1 2h-.1l-1.6-2H12c-1.7 0-3.6-.3-5-1.6C5.7 17.2 5.3 15.2 5.3 13c.1-2.8.9-5.3 2.3-6.6Z" />
                </svg>
              </SocialIcon>
            ) : null}
            {social.instagram ? (
              <SocialIcon href={social.instagram} label="Instagram" color={theme.text}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="4" width="16" height="16" rx="5" />
                  <circle cx="12" cy="12" r="3.4" />
                  <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" />
                </svg>
              </SocialIcon>
            ) : null}
            {social.tiktok ? (
              <SocialIcon href={social.tiktok} label="TikTok" color={theme.text}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M14.2 3h2.3c.2 1.6 1.1 3 2.5 3.8 1 .6 2.1.8 3.2.8v2.4c-1.6 0-3.1-.5-4.4-1.3v6.6A6.3 6.3 0 1 1 9.2 9.1v2.5a3.8 3.8 0 1 0 2.7 3.6V3Z" />
                </svg>
              </SocialIcon>
            ) : null}
            {social.x ? (
              <SocialIcon href={social.x} label="X" color={theme.text}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M4 4h4.3l4 5.6L16.8 4H20l-6.4 8.2L20.4 20h-4.3l-4.3-6-4.7 6H3.6l6.8-8.6L4 4Z" />
                </svg>
              </SocialIcon>
            ) : null}
          </div>
        ) : (
          <div className="mt-auto pt-8" />
        )}
      </div>
    </div>
  );

  if (preview) {
    return card;
  }

  return (
    <div
      className="flex min-h-dvh items-center justify-center p-4"
      style={{ background: theme.tone === "dark" ? "#111111" : "#ded8d0" }}
    >
      <style>{`html,body{background:${theme.tone === "dark" ? "#111111" : "#ded8d0"}!important;min-height:100dvh;}`}</style>
      <div className="h-[min(860px,100dvh)] w-full max-w-[420px] overflow-hidden rounded-[28px] shadow-2xl">
        {card}
      </div>
    </div>
  );
}
