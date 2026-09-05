"use client";

import { DonatePreview } from "@/components/donate-preview";
import { Button, Card, FieldError, Input, Label, Textarea } from "@/components/ui";
import { kopiykyToUah, uahToKopiyky } from "@/lib/money";
import type { SafeUser } from "@/lib/user";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function PageEditor({ user }: { user: SafeUser }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    slug: user.slug,
    pageTitle: user.pageTitle,
    pageBio: user.pageBio,
    accentColor: user.accentColor,
    background: user.background,
    showGoal: user.showGoal,
    goalAmount: String(kopiykyToUah(user.goalAmount || user.monoJarGoal)),
    minAmount: String(kopiykyToUah(user.minAmount)),
    overlayDuration: String(user.overlayDuration),
    alertStyle: user.alertStyle,
  });

  const preview = useMemo(
    () => ({
      name: form.pageTitle || form.name,
      bio: form.pageBio,
      accent: form.accentColor,
      background: form.background,
      showGoal: form.showGoal,
      raised: user.monoJarBalance,
      goal: uahToKopiyky(Number(form.goalAmount) || 0),
      twitchLogin: user.twitchLogin,
      twitchAvatar: user.twitchAvatar,
    }),
    [form, user.monoJarBalance, user.twitchAvatar, user.twitchLogin],
  );

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug,
        pageTitle: form.pageTitle,
        pageBio: form.pageBio,
        accentColor: form.accentColor,
        background: form.background,
        showGoal: form.showGoal,
        goalAmount: uahToKopiyky(Number(form.goalAmount) || 0),
        minAmount: uahToKopiyky(Number(form.minAmount) || 10),
        overlayDuration: Number(form.overlayDuration),
        alertStyle: form.alertStyle,
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
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form onSubmit={save} className="space-y-4">
        <Card className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Імʼя</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="slug">URL сторінки</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              />
            </div>
          </div>
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
              <Label htmlFor="accent">Акцент</Label>
              <div className="flex gap-2">
                <Input
                  id="accent"
                  type="color"
                  value={form.accentColor}
                  onChange={(event) => setForm((prev) => ({ ...prev, accentColor: event.target.value }))}
                  className="w-12 cursor-pointer px-1"
                />
                <Input
                  value={form.accentColor}
                  onChange={(event) => setForm((prev) => ({ ...prev, accentColor: event.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="background">Фон</Label>
              <div className="flex gap-2">
                <Input
                  id="background"
                  type="color"
                  value={form.background}
                  onChange={(event) => setForm((prev) => ({ ...prev, background: event.target.value }))}
                  className="w-12 cursor-pointer px-1"
                />
                <Input
                  value={form.background}
                  onChange={(event) => setForm((prev) => ({ ...prev, background: event.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
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
            <div>
              <Label htmlFor="duration">Алерт, сек</Label>
              <Input
                id="duration"
                type="number"
                min={3}
                max={20}
                value={form.overlayDuration}
                onChange={(event) => setForm((prev) => ({ ...prev, overlayDuration: event.target.value }))}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={form.showGoal}
              onChange={(event) => setForm((prev) => ({ ...prev, showGoal: event.target.checked }))}
            />
            Показувати прогрес збору
          </label>
          <div>
            <Label htmlFor="style">Стиль алерту</Label>
            <select
              id="style"
              value={form.alertStyle}
              onChange={(event) => setForm((prev) => ({ ...prev, alertStyle: event.target.value }))}
              className="h-9 w-full rounded-md border border-white/10 bg-black px-3 text-sm"
            >
              <option value="minimal">Minimal</option>
              <option value="card">Card</option>
              <option value="banner">Banner</option>
            </select>
          </div>
        </Card>
        <FieldError>{error}</FieldError>
        <Button type="submit" disabled={pending}>
          {pending ? "Зберігаю…" : "Зберегти"}
        </Button>
      </form>
      <DonatePreview {...preview} />
    </div>
  );
}
