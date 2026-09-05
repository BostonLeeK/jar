import { AssetStudio } from "@/components/asset-studio";
import { donatePath, getAppUrl } from "@/lib/urls";
import { requireUser } from "@/lib/user";

export default async function AssetsPage() {
  const user = await requireUser();
  const donateUrl = `${getAppUrl()}${donatePath(user.slug)}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Асети</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Кнопки й банери під Twitch і соцмережі з лінком на твою сторінку донатів.
        </p>
      </div>
      <AssetStudio
        name={user.pageTitle || user.name}
        slug={user.slug}
        themeId={user.pageTheme}
        donateUrl={donateUrl}
        cover={user.pageCoverUrl}
      />
    </div>
  );
}
