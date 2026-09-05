"use client";

import { AlertFileSlot } from "@/components/alert-file-slot";
import { TtsBar } from "@/components/tts-bar";
import { Button, Card, Input, Label } from "@/components/ui";
import { kopiykyToUah, uahToKopiyky } from "@/lib/money";
import type { AlertTierConfig } from "@/lib/overlay";
import { normalizeTtsLang, type TtsLang } from "@/lib/tts";
import { uploadForm } from "@/lib/upload";
import { useState } from "react";

type Tier = AlertTierConfig;

export function AlertTiersEditor({
  initialTiers,
  initialTts,
  initialTtsLang,
  onTiersChange,
  onTtsLangChange,
}: {
  initialTiers: Tier[];
  initialTts: boolean;
  initialTtsLang?: string;
  onTiersChange: (tiers: Tier[]) => void;
  onTtsLangChange?: (lang: TtsLang) => void;
}) {
  const [tiers, setTiers] = useState(initialTiers);
  const [tts, setTts] = useState(initialTts);
  const [ttsLang, setTtsLang] = useState<TtsLang>(normalizeTtsLang(initialTtsLang));
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState<{ key: string; value: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function commit(next: Tier[]) {
    setTiers(next);
    onTiersChange(next);
  }

  async function addTier() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/settings/alerts", { method: "POST" });
    const data = (await res.json()) as Tier & { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Не вдалося додати рівень");
      return;
    }
    commit([...tiers, data].sort((a, b) => a.minAmount - b.minAmount));
  }

  async function removeTier(id: string) {
    setPending(true);
    await fetch(`/api/settings/alerts?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setPending(false);
    commit(tiers.filter((tier) => tier.id !== id));
  }

  async function patchTier(id: string, patch: Partial<Pick<Tier, "minAmount" | "tts">>) {
    const next = tiers.map((tier) => (tier.id === id ? { ...tier, ...patch } : tier));
    commit(next);
    await fetch("/api/settings/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tiers: [{ id, ...patch }],
      }),
    });
  }

  async function toggleTts(value: boolean) {
    setTts(value);
    await fetch("/api/settings/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertTts: value }),
    });
  }

  async function changeLang(value: TtsLang) {
    setTtsLang(value);
    onTtsLangChange?.(value);
    await fetch("/api/settings/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ttsLang: value }),
    });
  }

  async function upload(id: string, kind: "gif" | "audio", file: File) {
    const key = `${id}:${kind}`;
    setPending(true);
    setProgress({ key, value: 1 });
    setError(null);
    const body = new FormData();
    body.set("tierId", id);
    body.set("kind", kind);
    body.set("file", file);
    try {
      const res = await uploadForm("/api/settings/alerts/file", body, (value) => setProgress({ key, value }));
      const data = (await res.json()) as Tier & { error?: string };
      if (!res.ok) {
        setError(data.error || "Не вдалося завантажити");
        return;
      }
      commit(tiers.map((tier) => (tier.id === id ? data : tier)));
    } catch {
      setError("Не вдалося завантажити");
    } finally {
      setPending(false);
      setProgress(null);
    }
  }

  async function clearFile(id: string, kind: "gif" | "audio") {
    const res = await fetch(
      `/api/settings/alerts/file?id=${encodeURIComponent(id)}&kind=${kind}`,
      { method: "DELETE" },
    );
    const data = (await res.json()) as Tier;
    if (res.ok) {
      commit(tiers.map((tier) => (tier.id === id ? data : tier)));
    }
  }

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Рівні алерту</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Різна гіфка і звук від суми. Озвучка читає меседж донатера в OBS.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={addTier} disabled={pending}>
          Додати рівень
        </Button>
      </div>
      <TtsBar enabled={tts} lang={ttsLang} onEnabled={(value) => void toggleTts(value)} onLang={(value) => void changeLang(value)} />
      {tiers.length === 0 ? (
        <p className="text-sm text-zinc-500">Поки немає рівнів. Додай хоча б один — від мінімальної суми.</p>
      ) : (
        <div className="space-y-3">
          {tiers.map((tier) => (
            <div key={tier.id} className="grid gap-3 rounded-2xl border border-zinc-200 p-4 md:grid-cols-[140px_1fr_1fr_auto] md:items-end">
              <div>
                <Label htmlFor={`min-${tier.id}`}>Від, ₴</Label>
                <Input
                  id={`min-${tier.id}`}
                  type="number"
                  min={1}
                  defaultValue={kopiykyToUah(tier.minAmount)}
                  onBlur={(event) => {
                    const value = uahToKopiyky(Number(event.target.value) || 1);
                    if (value !== tier.minAmount) {
                      void patchTier(tier.id, { minAmount: value });
                    }
                  }}
                />
              </div>
              <AlertFileSlot
                label="Гіфка"
                accept="image/gif,image/webp,image/png"
                preview={tier.gifUrl}
                hint={tier.gifUrl ? "Замінити" : "GIF / WEBP"}
                disabled={pending}
                progress={progress?.key === `${tier.id}:gif` ? progress.value : null}
                onFile={(file) => void upload(tier.id, "gif", file)}
                onClear={tier.gifUrl ? () => void clearFile(tier.id, "gif") : undefined}
              />
              <AlertFileSlot
                label="Аудіо"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                audio={tier.audioUrl}
                hint={tier.audioUrl ? "Замінити" : "MP3 / WAV / OGG"}
                disabled={pending}
                progress={progress?.key === `${tier.id}:audio` ? progress.value : null}
                onFile={(file) => void upload(tier.id, "audio", file)}
                onClear={tier.audioUrl ? () => void clearFile(tier.id, "audio") : undefined}
              />
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-zinc-600">
                  <input
                    type="checkbox"
                    checked={tier.tts}
                    onChange={(event) => void patchTier(tier.id, { tts: event.target.checked })}
                  />
                  TTS
                </label>
                <Button type="button" variant="ghost" onClick={() => void removeTier(tier.id)} disabled={pending}>
                  Прибрати
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </Card>
  );
}
