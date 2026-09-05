"use client";

import { AlertTiersEditor } from "@/components/alert-tiers-editor";
import { TemplateEditor } from "@/components/template-editor";
import { TwitchAlertsEditor } from "@/components/twitch-alerts-editor";
import { WidgetPreviews } from "@/components/widget-previews";
import { WidgetsPanel } from "@/components/widgets-panel";
import { Button, Card, FieldError, Input, Label } from "@/components/ui";
import type { OverlayDonation, OverlayState } from "@/components/overlay-widgets";
import {
  ALERT_TAGS,
  DEFAULT_ALERT_CSS,
  DEFAULT_ALERT_HTML,
  DEFAULT_GOAL_CSS,
  DEFAULT_GOAL_HTML,
  DEFAULT_RECENT_CSS,
  DEFAULT_RECENT_HTML,
  GOAL_TAGS,
  RECENT_TAGS,
} from "@/lib/custom-defaults";
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
  alertUseCustom,
  alertCustomHtml,
  alertCustomCss,
  goalUseCustom,
  goalCustomHtml,
  goalCustomCss,
  recentUseCustom,
  recentCustomHtml,
  recentCustomCss,
  twitchLogin,
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
  alertUseCustom: boolean;
  alertCustomHtml: string;
  alertCustomCss: string;
  goalUseCustom: boolean;
  goalCustomHtml: string;
  goalCustomCss: string;
  recentUseCustom: boolean;
  recentCustomHtml: string;
  recentCustomCss: string;
  twitchLogin: string | null;
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
  const [customTab, setCustomTab] = useState<"alert" | "goal" | "recent">("alert");
  const [alertCustom, setAlertCustom] = useState(alertUseCustom);
  const [alertHtml, setAlertHtml] = useState(alertCustomHtml || DEFAULT_ALERT_HTML);
  const [alertCss, setAlertCss] = useState(alertCustomCss || DEFAULT_ALERT_CSS);
  const [goalCustom, setGoalCustom] = useState(goalUseCustom);
  const [goalHtml, setGoalHtml] = useState(goalCustomHtml || DEFAULT_GOAL_HTML);
  const [goalCss, setGoalCss] = useState(goalCustomCss || DEFAULT_GOAL_CSS);
  const [recentCustom, setRecentCustom] = useState(recentUseCustom);
  const [recentHtml, setRecentHtml] = useState(recentCustomHtml || DEFAULT_RECENT_HTML);
  const [recentCss, setRecentCss] = useState(recentCustomCss || DEFAULT_RECENT_CSS);
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
      alertUseCustom: alertCustom,
      alertCustomHtml: alertHtml,
      alertCustomCss: alertCss,
      goalUseCustom: goalCustom,
      goalCustomHtml: goalHtml,
      goalCustomCss: goalCss,
      recentUseCustom: recentCustom,
      recentCustomHtml: recentHtml,
      recentCustomCss: recentCss,
      twitchLogin,
    }),
    [accent, alert, alertCss, alertCustom, alertHtml, alertTts, donations, duration, goal, goalCss, goalCustom, goalHtml, goalLook, limit, name, raised, recentCss, recentCustom, recentHtml, recentLook, showMessage, showTitle, tiers, title, tone, twitch, twitchLogin],
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
        alertUseCustom: alertCustom,
        alertCustomHtml: alertHtml,
        alertCustomCss: alertCss,
        goalUseCustom: goalCustom,
        goalCustomHtml: goalHtml,
        goalCustomCss: goalCss,
        recentUseCustom: recentCustom,
        recentCustomHtml: recentHtml,
        recentCustomCss: recentCss,
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
        <Card className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-medium">Просунутий HTML / CSS</h2>
            <p className="mt-1 text-sm text-zinc-500">Свій макет алерту, прогресу і списку для OBS.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["alert", "Алерт", alertCustom],
                ["goal", "Прогрес", goalCustom],
                ["recent", "Останні", recentCustom],
              ] as const
            ).map(([id, label, on]) => (
              <button
                key={id}
                type="button"
                onClick={() => setCustomTab(id)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-sm",
                  customTab === id ? "border-zinc-900 text-zinc-900" : "border-zinc-200 text-zinc-500",
                )}
              >
                {label}
                {on ? " · on" : ""}
              </button>
            ))}
          </div>
          {customTab === "alert" ? (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input type="checkbox" checked={alertCustom} onChange={(event) => setAlertCustom(event.target.checked)} />
                Свій HTML для алерту
              </label>
              {alertCustom ? <TemplateEditor html={alertHtml} css={alertCss} tags={ALERT_TAGS} onHtml={setAlertHtml} onCss={setAlertCss} /> : null}
            </div>
          ) : null}
          {customTab === "goal" ? (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input type="checkbox" checked={goalCustom} onChange={(event) => setGoalCustom(event.target.checked)} />
                Свій HTML для прогресу
              </label>
              {goalCustom ? <TemplateEditor html={goalHtml} css={goalCss} tags={GOAL_TAGS} onHtml={setGoalHtml} onCss={setGoalCss} /> : null}
            </div>
          ) : null}
          {customTab === "recent" ? (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input type="checkbox" checked={recentCustom} onChange={(event) => setRecentCustom(event.target.checked)} />
                Свій HTML для списку
              </label>
              {recentCustom ? (
                <TemplateEditor html={recentHtml} css={recentCss} tags={RECENT_TAGS} onHtml={setRecentHtml} onCss={setRecentCss} />
              ) : null}
            </div>
          ) : null}
        </Card>

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

      <WidgetsPanel token={token} appUrl={appUrl} twitchLogin={twitchLogin} />
    </div>
  );
}
