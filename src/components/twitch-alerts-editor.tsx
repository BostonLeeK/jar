"use client";

import { AlertFileSlot } from "@/components/alert-file-slot";
import { Card } from "@/components/ui";
import type { TwitchAlertConfig } from "@/lib/overlay";
import { TWITCH_ALERT_LABELS, isTwitchAlertKind } from "@/lib/twitch-alerts";
import { uploadForm } from "@/lib/upload";
import { useState } from "react";

export function TwitchAlertsEditor({
  initialAlerts,
  onChange,
}: {
  initialAlerts: TwitchAlertConfig[];
  onChange: (alerts: TwitchAlertConfig[]) => void;
}) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState<{ key: string; value: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function commit(next: TwitchAlertConfig[]) {
    setAlerts(next);
    onChange(next);
  }

  async function patchTts(id: string, tts: boolean) {
    commit(alerts.map((item) => (item.id === id ? { ...item, tts } : item)));
    await fetch("/api/settings/twitch-alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, tts }),
    });
  }

  async function upload(id: string, kind: "gif" | "audio", file: File) {
    const key = `${id}:${kind}`;
    setPending(true);
    setProgress({ key, value: 1 });
    setError(null);
    const body = new FormData();
    body.set("id", id);
    body.set("kind", kind);
    body.set("file", file);
    try {
      const res = await uploadForm("/api/settings/twitch-alerts/file", body, (value) => setProgress({ key, value }));
      const data = (await res.json()) as TwitchAlertConfig & { error?: string };
      if (!res.ok) {
        setError(data.error || "Не вдалося завантажити");
        return;
      }
      commit(alerts.map((item) => (item.id === id ? data : item)));
    } catch {
      setError("Не вдалося завантажити");
    } finally {
      setPending(false);
      setProgress(null);
    }
  }

  async function clearFile(id: string, kind: "gif" | "audio") {
    const res = await fetch(
      `/api/settings/twitch-alerts/file?id=${encodeURIComponent(id)}&kind=${kind}`,
      { method: "DELETE" },
    );
    const data = (await res.json()) as TwitchAlertConfig;
    if (res.ok) {
      commit(alerts.map((item) => (item.id === id ? data : item)));
    }
  }

  return (
    <Card className="space-y-4 p-5">
      <div>
        <h2 className="text-sm font-medium">Алерти Twitch</h2>
        <p className="mt-1 text-sm text-zinc-500">Окрема гіфка і звук для фоловера, підписки, гіфта, bits і рейду.</p>
      </div>
      <div className="space-y-3">
        {alerts.map((item) => (
          <div key={item.id} className="grid gap-3 rounded-2xl border border-zinc-200 p-4 md:grid-cols-[140px_1fr_1fr_auto] md:items-end">
            <p className="text-sm font-medium text-zinc-800">
              {isTwitchAlertKind(item.kind) ? TWITCH_ALERT_LABELS[item.kind] : item.kind}
            </p>
            <AlertFileSlot
              label="Гіфка"
              accept="image/gif,image/webp,image/png"
              preview={item.gifUrl}
              hint={item.gifUrl ? "Замінити" : "GIF / WEBP"}
              disabled={pending}
              progress={progress?.key === `${item.id}:gif` ? progress.value : null}
              onFile={(file) => void upload(item.id, "gif", file)}
              onClear={item.gifUrl ? () => void clearFile(item.id, "gif") : undefined}
            />
            <AlertFileSlot
              label="Аудіо"
              accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
              audio={item.audioUrl}
              hint={item.audioUrl ? "Замінити" : "MP3 / WAV / OGG"}
              disabled={pending}
              progress={progress?.key === `${item.id}:audio` ? progress.value : null}
              onFile={(file) => void upload(item.id, "audio", file)}
              onClear={item.audioUrl ? () => void clearFile(item.id, "audio") : undefined}
            />
            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={item.tts}
                onChange={(event) => void patchTts(item.id, event.target.checked)}
              />
              TTS
            </label>
          </div>
        ))}
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </Card>
  );
}
