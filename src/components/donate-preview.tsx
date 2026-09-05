"use client";

import { DonatePageView, type DonateRecent } from "@/components/donate-page";
import { ScaledFrame } from "@/components/scaled-frame";
import type { SocialLinks } from "@/lib/social";
import { getPageTheme } from "@/lib/themes";

export function DonatePreview({
  name,
  bio,
  themeId,
  showGoal,
  raised,
  goal,
  twitchLogin,
  avatar,
  cover,
  slug,
  minAmount,
  ready,
  recent = [],
  custom,
  social,
}: {
  name: string;
  bio: string;
  themeId?: string | null;
  showGoal: boolean;
  raised: number;
  goal: number;
  twitchLogin: string | null;
  avatar: string | null;
  cover?: string | null;
  slug: string;
  minAmount: number;
  ready: boolean;
  recent?: DonateRecent[];
  custom?: { enabled: boolean; html: string; css: string };
  social?: SocialLinks;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-500">Превʼю</div>
      <ScaledFrame width={390} height={860}>
        <DonatePageView
          theme={getPageTheme(themeId)}
          title={name}
          bio={bio}
          twitchLogin={twitchLogin}
          avatar={avatar}
          cover={cover}
          showGoal={showGoal}
          raised={raised}
          goal={goal}
          slug={slug}
          minAmount={minAmount}
          ready={ready}
          recent={recent}
          custom={custom}
          social={social}
          preview
        />
      </ScaledFrame>
    </div>
  );
}
