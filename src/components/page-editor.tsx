"use client";

import { AvatarField } from "@/components/avatar-field";
import { DonatePageView } from "@/components/donate-page";
import { Button, Card, FieldError, Input, Label, Textarea } from "@/components/ui";
import { kopiykyToUah, uahToKopiyky } from "@/lib/money";
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
  const [form, setForm] = useState({
    pageTitle: user.pageTitle || user.name,
    pageBio: user.pageBio,
    pageTheme: user.pageTheme,
    showGoal: user.showGoal,
    goalAmount: String(kopiykyToUah(user.goalAmount || user.monoJarGoal)),
    minAmount: String(kopiykyToUah(user.minAmount)),
  });

  const theme = getPageTheme(form.pageTheme);
  const preview = useMemo(
    () => ({
      theme,
      title: form.pageTitle || user.name,
      bio: form.pageBio,
      twitchLogin: user.twitchLogin,
      avatar,
      showGoal: form.showGoal,
      raised: user.monoJarBalance,
      goal: uahToKopiyky(Number(form.goalAmount) || 0),
      slug: user.slug,
      minAmount: uahToKopiyky(Number(form.minAmount) || 10),
      ready: Boolean(user.monoSendId),
      recent: [] as { id: string; nickname: string; amount: number }[],
      preview: true,
    }),
    [avatar, form, theme, user],
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
                <div className="h-16" style={{ background: item.background }}>
                  <div className="flex h-full items-end p-2">
                    <span
                      className="h-6 flex-1"
                      style={{ background: item.accent, borderRadius: item.radius }}
                    />
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
        <DonatePageView {...preview} />
      </div>
    </div>
  );
}
