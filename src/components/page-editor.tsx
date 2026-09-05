"use client";

import { AvatarField } from "@/components/avatar-field";
import { CoverField } from "@/components/cover-field";
import { DonatePageView } from "@/components/donate-page";
import { ScaledFrame } from "@/components/scaled-frame";
import { TemplateEditor } from "@/components/template-editor";
import { Button, Card, FieldError, Input, Label, Textarea } from "@/components/ui";
import { DEFAULT_PAGE_CSS, DEFAULT_PAGE_HTML, PAGE_TAGS } from "@/lib/custom-defaults";
import { kopiykyToUah, uahToKopiyky } from "@/lib/money";
import { resolveSocial, SOCIAL_FIELDS } from "@/lib/social";
import { getPageTheme, PAGE_THEMES } from "@/lib/themes";
import type { SafeUser } from "@/lib/user";
import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function PageEditor({ user }: { user: SafeUser }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [avatar, setAvatar] = useState(user.avatarUrl || user.twitchAvatar);
  const [cover, setCover] = useState(user.pageCoverUrl);
  const [form, setForm] = useState({
    pageTitle: user.pageTitle || user.name,
    pageBio: user.pageBio,
    pageTheme: user.pageTheme,
    showGoal: user.showGoal,
    goalAmount: String(kopiykyToUah(user.goalAmount || user.monoJarGoal)),
    minAmount: String(kopiykyToUah(user.minAmount)),
    pageUseCustom: user.pageUseCustom,
    pageCustomHtml: user.pageCustomHtml || DEFAULT_PAGE_HTML,
    pageCustomCss: user.pageCustomCss || DEFAULT_PAGE_CSS,
    socialTwitch: user.socialTwitch,
    socialYoutube: user.socialYoutube,
    socialDiscord: user.socialDiscord,
    socialInstagram: user.socialInstagram,
    socialTiktok: user.socialTiktok,
    socialX: user.socialX,
  });

  const theme = getPageTheme(form.pageTheme);
  const preview = useMemo(
    () => ({
      theme,
      title: form.pageTitle || user.name,
      bio: form.pageBio,
      twitchLogin: user.twitchLogin,
      avatar,
      cover,
      showGoal: form.showGoal,
      raised: user.monoJarBalance,
      goal: uahToKopiyky(Number(form.goalAmount) || 0),
      slug: user.slug,
      minAmount: uahToKopiyky(Number(form.minAmount) || 10),
      ready: Boolean(user.monoSendId),
      recent: [] as { id: string; nickname: string; amount: number }[],
      preview: true,
      custom: {
        enabled: form.pageUseCustom,
        html: form.pageCustomHtml,
        css: form.pageCustomCss,
      },
      social: resolveSocial({
        twitchLogin: user.twitchLogin,
        socialTwitch: form.socialTwitch,
        socialYoutube: form.socialYoutube,
        socialDiscord: form.socialDiscord,
        socialInstagram: form.socialInstagram,
        socialTiktok: form.socialTiktok,
        socialX: form.socialX,
      }),
    }),
    [avatar, cover, form, theme, user],
  );

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const selected = getPageTheme(form.pageTheme);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageTitle: form.pageTitle,
        pageBio: form.pageBio,
        pageTheme: selected.id,
        accentColor: selected.accent,
        background: selected.background,
        showGoal: form.showGoal,
        goalAmount: uahToKopiyky(Number(form.goalAmount) || 0),
        minAmount: uahToKopiyky(Number(form.minAmount) || 10),
        pageUseCustom: form.pageUseCustom,
        pageCustomHtml: form.pageCustomHtml,
        pageCustomCss: form.pageCustomCss,
        socialTwitch: form.socialTwitch,
        socialYoutube: form.socialYoutube,
        socialDiscord: form.socialDiscord,
        socialInstagram: form.socialInstagram,
        socialTiktok: form.socialTiktok,
        socialX: form.socialX,
      }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Не вдалося зберегти");
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <form onSubmit={save} className="space-y-4">
        <Card className="space-y-3 p-5">
          <div>
            <h2 className="text-sm font-medium">Шаблон</h2>
            <p className="mt-1 text-sm text-zinc-500">Обери готовий вигляд — сторінка зміниться одразу.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PAGE_THEMES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, pageTheme: item.id }))}
                className={cn(
                  "cursor-pointer overflow-hidden rounded-2xl border text-left transition-all duration-150 hover:-translate-y-px",
                  form.pageTheme === item.id ? "border-zinc-900" : "border-zinc-200 hover:border-zinc-400",
                )}
              >
                <div className="relative h-20 overflow-hidden" style={{ background: item.background }}>
                  <div className="absolute inset-y-0 right-0 w-1/2 opacity-50" style={{ background: item.button }} />
                  <div className="absolute inset-0" style={{ background: item.veil }} />
                  <div className="absolute inset-x-2 bottom-2">
                    <span className="block h-2 rounded-full" style={{ background: item.accent, width: "42%" }} />
                  </div>
                </div>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-zinc-500">{item.tag}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-medium">Аватар</h2>
            <p className="mt-1 text-sm text-zinc-500">Своє фото, якщо Twitch не підключений.</p>
          </div>
          <AvatarField
            avatar={user.avatarUrl}
            fallback={user.twitchAvatar}
            name={form.pageTitle || user.name}
            onChange={setAvatar}
          />
        </Card>

        <Card className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-medium">Фон</h2>
            <p className="mt-1 text-sm text-zinc-500">Фото праворуч. Без нього шаблон лишає свою атмосферу.</p>
          </div>
          <CoverField cover={user.pageCoverUrl} onChange={setCover} />
        </Card>

        <Card className="space-y-4 p-5">
          <div>
            <Label htmlFor="pageTitle">Заголовок</Label>
            <Input
              id="pageTitle"
              value={form.pageTitle}
              onChange={(event) => setForm((prev) => ({ ...prev, pageTitle: event.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="pageBio">Опис</Label>
            <Textarea
              id="pageBio"
              value={form.pageBio}
              onChange={(event) => setForm((prev) => ({ ...prev, pageBio: event.target.value }))}
              placeholder="Донати на стрім, каву і Condemned"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="goal">Ціль, ₴</Label>
              <Input
                id="goal"
                type="number"
                min={0}
                value={form.goalAmount}
                onChange={(event) => setForm((prev) => ({ ...prev, goalAmount: event.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="min">Мінімум, ₴</Label>
              <Input
                id="min"
                type="number"
                min={1}
                value={form.minAmount}
                onChange={(event) => setForm((prev) => ({ ...prev, minAmount: event.target.value }))}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={form.showGoal}
              onChange={(event) => setForm((prev) => ({ ...prev, showGoal: event.target.checked }))}
            />
            Показувати прогрес збору
          </label>
        </Card>

        <Card className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-medium">Соцмережі</h2>
            <p className="mt-1 text-sm text-zinc-500">Нік або повне посилання. Порожнє поле на картці не показується.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SOCIAL_FIELDS.map((item) => (
              <div key={item.key}>
                <Label htmlFor={item.key}>{item.label}</Label>
                <Input
                  id={item.key}
                  value={form[item.key]}
                  placeholder={item.key === "socialTwitch" && user.twitchLogin ? user.twitchLogin : item.placeholder}
                  onChange={(event) => setForm((prev) => ({ ...prev, [item.key]: event.target.value }))}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-800">
            <input
              type="checkbox"
              checked={form.pageUseCustom}
              onChange={(event) => setForm((prev) => ({ ...prev, pageUseCustom: event.target.checked }))}
            />
            Просунутий HTML / CSS
          </label>
          {form.pageUseCustom ? (
            <TemplateEditor
              html={form.pageCustomHtml}
              css={form.pageCustomCss}
              tags={PAGE_TAGS}
              onHtml={(pageCustomHtml) => setForm((prev) => ({ ...prev, pageCustomHtml }))}
              onCss={(pageCustomCss) => setForm((prev) => ({ ...prev, pageCustomCss }))}
            />
          ) : (
            <p className="text-sm text-zinc-500">Свій макет замість готового шаблону. Форма донату — тег {"{{donate}}"}.</p>
          )}
        </Card>

        <FieldError>{error}</FieldError>
        <Button type="submit" disabled={pending}>
          {pending ? "Зберігаю…" : "Зберегти сторінку"}
        </Button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2">
          <p className="text-xs font-medium text-zinc-500">Живе превʼю · {theme.name}</p>
          <a href={`/d/${user.slug}`} target="_blank" rel="noreferrer" className="text-xs text-zinc-500 hover:text-zinc-900">
            Відкрити
          </a>
        </div>
        <ScaledFrame width={420} height={860}>
          <DonatePageView {...preview} />
        </ScaledFrame>
      </div>
    </div>
  );
}
