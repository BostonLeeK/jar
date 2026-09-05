"use client";

import { TTS_LANG_LABELS, TTS_LANGS, TTS_SAMPLE, type TtsLang } from "@/lib/tts";
import { useRef, useState } from "react";

export function TtsBar({
  enabled,
  lang,
  onEnabled,
  onLang,
}: {
  enabled: boolean;
  lang: TtsLang;
  onEnabled: (value: boolean) => void;
  onLang: (value: TtsLang) => void;
}) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  async function listen() {
    if (playing) {
      audio.current?.pause();
      audio.current = null;
      setPlaying(false);
      return;
    }
    const src = `/api/settings/tts?lang=${lang}&text=${encodeURIComponent(TTS_SAMPLE[lang])}`;
    audio.current?.pause();
    audio.current = new Audio(src);
    audio.current.onended = () => setPlaying(false);
    setPlaying(true);
    try {
      await audio.current.play();
    } catch {
      setPlaying(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm text-zinc-600">
        <input type="checkbox" checked={enabled} onChange={(event) => onEnabled(event.target.checked)} />
        Читати текст донату вголос
      </label>
      <select
        value={lang}
        onChange={(event) => onLang(event.target.value as TtsLang)}
        className="h-10 cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 text-sm"
      >
        {TTS_LANGS.map((item) => (
          <option key={item} value={item}>
            {TTS_LANG_LABELS[item]}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => void listen()}
        className="inline-flex h-10 items-center rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 hover:bg-zinc-50"
      >
        {playing ? "Стоп" : "Прослухати"}
      </button>
    </div>
  );
}
