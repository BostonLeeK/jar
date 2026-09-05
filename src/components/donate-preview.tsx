import { DonatePageView } from "@/components/donate-page";
import { getPageTheme } from "@/lib/themes";

export function DonatePreview({
  name,
  bio,
  themeId,
  showGoal,
  raised,
  goal,
  twitchLogin,
  twitchAvatar,
  slug,
  minAmount,
  ready,
}: {
  name: string;
  bio: string;
  themeId?: string | null;
  showGoal: boolean;
  raised: number;
  goal: number;
  twitchLogin: string | null;
  twitchAvatar: string | null;
  slug: string;
  minAmount: number;
  ready: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-500">Превʼю</div>
      <div className="max-h-[720px] overflow-auto">
        <DonatePageView
          theme={getPageTheme(themeId)}
          title={name}
          bio={bio}
          twitchLogin={twitchLogin}
          twitchAvatar={twitchAvatar}
          showGoal={showGoal}
          raised={raised}
          goal={goal}
          slug={slug}
          minAmount={minAmount}
          ready={ready}
          recent={[]}
          preview
        />
      </div>
    </div>
  );
}
