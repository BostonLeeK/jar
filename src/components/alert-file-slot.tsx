"use client";

import { Label } from "@/components/ui";
import { UploadBar } from "@/components/upload-bar";
import { useEffect, useRef, useState } from "react";

function AudioListen({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      audio.current?.pause();
      audio.current = null;
    };
  }, [src]);

  async function toggle() {
    if (!audio.current || audio.current.src !== new URL(src, window.location.origin).href) {
      audio.current?.pause();
      audio.current = new Audio(src);
      audio.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audio.current.pause();
      audio.current.currentTime = 0;
      setPlaying(false);
      return;
    }
    await audio.current.play();
    setPlaying(true);
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
      aria-label={playing ? "Зупинити" : "Прослухати"}
    >
      {playing ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="1.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      )}
    </button>
  );
}

export function AlertFileSlot({
  label,
  accept,
  preview,
  audio,
  hint,
  disabled,
  progress,
  onFile,
  onClear,
}: {
  label: string;
  accept: string;
  preview?: string | null;
  audio?: string | null;
  hint: string;
  disabled?: boolean;
  progress?: number | null;
  onFile: (file: File) => void;
  onClear?: () => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        {preview ? <img src={preview} alt="" className="h-10 w-10 rounded-lg object-cover" /> : null}
        {audio ? <AudioListen src={audio} /> : null}
        <label className="inline-flex h-10 min-w-0 cursor-pointer items-center rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-600 hover:bg-zinc-50">
          {progress != null ? `${progress}%` : hint}
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) {
                onFile(file);
              }
            }}
          />
        </label>
        {onClear ? (
          <button type="button" onClick={onClear} className="text-xs text-zinc-400 hover:text-red-600">
            ×
          </button>
        ) : null}
      </div>
      {progress != null ? (
        <div className="mt-2">
          <UploadBar value={progress} />
        </div>
      ) : null}
    </div>
  );
}
