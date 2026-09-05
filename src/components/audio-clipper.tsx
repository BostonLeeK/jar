"use client";

import { clipRange, formatClipTime, roundClip } from "@/lib/audio-clip";
import { useEffect, useRef, useState } from "react";

const RANGE =
  "pointer-events-none absolute inset-0 m-0 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-zinc-900 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-900";

export function AudioClipper({
  src,
  start,
  end,
  disabled,
  onChange,
}: {
  src: string;
  start: number;
  end: number;
  disabled?: boolean;
  onChange: (start: number, end: number) => void;
}) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(end);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const node = new Audio(src);
    audio.current = node;
    const onMeta = () => {
      setDuration(Number.isFinite(node.duration) ? node.duration : 0);
    };
    node.addEventListener("loadedmetadata", onMeta);
    node.preload = "metadata";
    node.load();
    return () => {
      node.pause();
      node.removeEventListener("loadedmetadata", onMeta);
      audio.current = null;
      setPlaying(false);
    };
  }, [src]);

  useEffect(() => {
    if (!duration) {
      return;
    }
    const range = clipRange({ start, end }, duration);
    setFrom(range.start);
    setTo(range.end);
  }, [duration, end, start]);

  useEffect(() => {
    const node = audio.current;
    if (!node) {
      return;
    }
    const onTime = () => {
      if (node.currentTime >= to - 0.02) {
        node.pause();
        setPlaying(false);
      }
    };
    const onEnd = () => setPlaying(false);
    node.addEventListener("timeupdate", onTime);
    node.addEventListener("ended", onEnd);
    return () => {
      node.removeEventListener("timeupdate", onTime);
      node.removeEventListener("ended", onEnd);
    };
  }, [to]);

  function commit(nextFrom: number, nextTo: number) {
    if (!duration) {
      return;
    }
    const startAt = roundClip(Math.min(nextFrom, nextTo - 0.2));
    const endAt = roundClip(Math.max(nextTo, startAt + 0.2));
    const safeStart = Math.max(0, startAt);
    const safeEnd = Math.min(duration, endAt);
    setFrom(safeStart);
    setTo(safeEnd);
    onChange(safeStart, safeEnd);
  }

  async function listen() {
    const node = audio.current;
    if (!node) {
      return;
    }
    if (playing) {
      node.pause();
      setPlaying(false);
      return;
    }
    node.currentTime = from;
    await node.play();
    setPlaying(true);
  }

  const left = duration > 0 ? (from / duration) * 100 : 0;
  const width = duration > 0 ? ((to - from) / duration) * 100 : 100;

  return (
    <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Від {formatClipTime(from)}</span>
        <span>До {formatClipTime(to || duration)}</span>
      </div>
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-zinc-200">
          <div className="absolute h-full rounded-full bg-zinc-900" style={{ left: `${left}%`, width: `${width}%` }} />
        </div>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={from}
          disabled={disabled || !duration}
          className={RANGE}
          onChange={(event) => {
            const value = Number(event.target.value);
            setFrom(Math.min(value, to - 0.2));
          }}
          onPointerUp={() => commit(from, to)}
        />
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={to || duration}
          disabled={disabled || !duration}
          className={RANGE}
          onChange={(event) => {
            const value = Number(event.target.value);
            setTo(Math.max(value, from + 0.2));
          }}
          onPointerUp={() => commit(from, to)}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!duration}
          onClick={() => void listen()}
          className="inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
        >
          {playing ? "Стоп" : "Прослухати фрагмент"}
        </button>
        <button
          type="button"
          disabled={!duration || disabled}
          onClick={() => commit(0, duration)}
          className="text-xs text-zinc-400 hover:text-zinc-700 disabled:opacity-40"
        >
          Весь файл
        </button>
      </div>
    </div>
  );
}
