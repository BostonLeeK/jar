"use client";

import { AlertTiersEditor } from "@/components/alert-tiers-editor";
import { TwitchAlertsEditor } from "@/components/twitch-alerts-editor";
import { WidgetPreviews } from "@/components/widget-previews";
import { WidgetsPanel } from "@/components/widgets-panel";
import { Button, Card, FieldError, Input, Label } from "@/components/ui";
import type { OverlayDonation, OverlayState } from "@/components/overlay-widgets";
import type { AlertTierConfig, TwitchAlertConfig } from "@/lib/overlay";
import { cn } from "@/lib/cn";
import { useMemo, useState, type FormEvent } from "react";

const SELECT =
  "h-10 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 text-sm";

export function WidgetsStudio({
  token,
  appUrl,
  name,
  raised,
  goal,
  overlayTone,
  overlayAccent,
  overlayDuration,
  alertStyle,
  alertShowMessage,
  goalStyle,
  goalShowTitle,
  recentStyle,
  recentLimit,
  recentTitle,
  alertTts,
  alertTiers,
  twitchAlerts,
  donations,
}: {
  token: string;
  appUrl: string;
  name: string;
  raised: number;
  goal: number;
  overlayTone: string;
  overlayAccent: string;
  overlayDuration: number;
  alertStyle: string;
  alertShowMessage: boolean;
  goalStyle: string;
  goalShowTitle: boolean;
  recentStyle: string;
  recentLimit: number;
  recentTitle: string;
  alertTts: boolean;
  alertTiers: AlertTierConfig[];
  twitchAlerts: TwitchAlertConfig[];
  donations: OverlayDonation[];
}) {
  const [tone, setTone] = useState(overlayTone);
  const [accent, setAccent] = useState(overlayAccent);
  const [duration, setDuration] = useState(String(overlayDuration));
  const [alert, setAlert] = useState(alertStyle);
  const [showMessage, setShowMessage] = useState(alertShowMessage);
  const [goalLook, setGoalLook] = useState(goalStyle);
  const [showTitle, setShowTitle] = useState(goalShowTitle);
  const [recentLook, setRecentLook] = useState(recentStyle);
  const [limit, setLimit] = useState(String(recentLimit));
  const [title, setTitle] = useState(recentTitle);
  const [tiers, setTiers] = useState(alertTiers);
  const [twitch, setTwitch] = useState(twitchAlerts);
  const [backdrop, setBackdrop] = useState<"dark" | "light">("dark");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const preview: OverlayState = useMemo(
    () => ({
      name,
      accentColor: accent,
      showGoal: true,
      raised,
      goal,
      overlayTone: tone,
      overlayAccent: accent,
      overlayDuration: Number(duration) || 8,
      alertStyle: alert,
      alertShowMessage: showMessage,
      goalStyle: goalLook,
      goalShowTitle: showTitle,
      recentStyle: recentLook,
      recentLimit: Number(limit) || 5,
      recentTitle: title,
      alertTts,
      alertTiers: tiers,
      twitchAlerts: twitch,
      donations,
    }),
    [accent, alert, alertTts, donations, duration, goal, goalLook, limit, name, raised, recentLook, showMessage, showTitle, tiers, title, tone, twitch],
  );

  async function save(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setOk(false);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        overlayTone: tone,
        overlayAccent: accent,
        overlayDuration: Number(duration),
        alertStyle: alert,
        alertShowMessage: showMessage,
        goalStyle: goalLook,
        goalShowTitle: showTitle,
        recentStyle: recentLook,
        recentLimit: Number(limit),
        recentTitle: title,
      }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Не вдалося зберегти");
      return;
    }
    setOk(true);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-4">
        <Card className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-medium">Загальні</h2>
            <p className="mt-1 text-sm text-zinc-500">Тема тексту і акцент для всіх трьох віджетів.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="tone">Тема</Label>
              <select id="tone" value={tone} onChange={(event) => setTone(event.target.value)} className={SELECT}>
                <option value="dark">Темна — світлий текст</option>
                <option value="light">Світла — темний текст</option>
              </select>
            </div>
            <div>
              <Label htmlFor="accent">Акцент</Label>
              <div className="flex gap-2">
                <input
                  id="accent"
                  type="color"
                  value={/^#([0-9a-fA-F]{6})$/.test(accent) ? accent : "#ffffff"}
                  onChange={(event) => setAccent(event.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-xl border border-zinc-200 bg-white p-1"
                />
                <Input value={accent} onChange={(event) => setAccent(event.target.value)} />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="space-y-4 p-5">
            <div>
              <h2 className="text-sm font-medium">Алерт</h2>
              <p className="mt-1 text-sm text-zinc-500">Сповіщення про новий донат.</p>
            </div>
            <div>
              <Label htmlFor="duration">Тривалість, сек</Label>
              <Input
                id="duration"
                type="number"
                min={3}
                max={40}
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="alertStyle">Стиль</Label>
              <select id="alertStyle" value={alert} onChange={(event) => setAlert(event.target.value)} className={SELECT}>
                <option value="minimal">Minimal</option>
                <option value="card">Card</option>
                <option value="banner">Banner</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input type="checkbox" checked={showMessage} onChange={(event) => setShowMessage(event.target.checked)} />
              Показувати повідомлення
            </label>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <h2 className="text-sm font-medium">Прогрес</h2>
              <p className="mt-1 text-sm text-zinc-500">Ціль збору на стрімі.</p>
            </div>
            <div>
              <Label htmlFor="goalStyle">Стиль</Label>
              <select id="goalStyle" value={goalLook} onChange={(event) => setGoalLook(event.target.value)} className={SELECT}>
                <option value="minimal">Minimal</option>
                <option value="card">Card</option>
                <option value="banner">Banner</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input type="checkbox" checked={showTitle} onChange={(event) => setShowTitle(event.target.checked)} />
              Показувати назву
            </label>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <h2 className="text-sm font-medium">Останні донати</h2>
              <p className="mt-1 text-sm text-zinc-500">Список у куті екрана.</p>
            </div>
            <div>
              <Label htmlFor="recentStyle">Стиль</Label>
              <select id="recentStyle" value={recentLook} onChange={(event) => setRecentLook(event.target.value)} className={SELECT}>
                <option value="minimal">Minimal</option>
                <option value="card">Card</option>
                <option value="banner">Banner</option>
              </select>
            </div>
            <div>
              <Label htmlFor="recentLimit">Скільки показувати</Label>
              <Input
                id="recentLimit"
                type="number"
                min={1}
                max={12}
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="recentTitle">Заголовок</Label>
              <Input id="recentTitle" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={40} />
            </div>
          </Card>
        </div>

        <FieldError>{error}</FieldError>
        {ok ? <p className="text-sm text-emerald-600">Збережено</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Зберігаю…" : "Зберегти віджети"}
        </Button>
      </form>

      <AlertTiersEditor initialTiers={alertTiers} initialTts={alertTts} onTiersChange={setTiers} />
      <TwitchAlertsEditor initialAlerts={twitchAlerts} onChange={setTwitch} />

      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Превʼю</h2>
            <p className="mt-1 text-sm text-zinc-500">Перевір вигляд на чорному і білому фоні, як різні сцени в OBS.</p>
          </div>
          <div className="flex rounded-xl border border-zinc-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setBackdrop("dark")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                backdrop === "dark" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900",
              )}
            >
              Чорний
            </button>
            <button
              type="button"
              onClick={() => setBackdrop("light")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                backdrop === "light" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900",
              )}
            >
              Білий
            </button>
          </div>
        </div>
        <WidgetPreviews state={preview} backdrop={backdrop} />
      </div>

      <WidgetsPanel token={token} appUrl={appUrl} />
    </div>
  );
}
