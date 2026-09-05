"use client";

import { clamp } from "@/lib/validate";
import { clipRange, formatClipTime, roundClip } from "@/lib/audio-clip";
import { useEffect, useRef, useState } from "react";

function readDuration(node: HTMLAudioElement) {
  const value = node.duration;
  return Number.isFinite(value) && value > 0 ? value : 0;
}

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
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<"from" | "to" | null>(null);
  const fromRef = useRef(start);
  const toRef = useRef(end);
  const [duration, setDuration] = useState(0);
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(end);
  const [playing, setPlaying] = useState(false);

  function setClip(nextFrom: number, nextTo: number) {
    fromRef.current = nextFrom;
    toRef.current = nextTo;
    setFrom(nextFrom);
    setTo(nextTo);
  }

  useEffect(() => {
    let dead = false;
    let objectUrl = "";
    const node = new Audio();
    audio.current = node;
    node.preload = "auto";

    const apply = () => {
      const length = readDuration(node);
      if (dead || !length) {
        return;
      }
      setDuration(length);
    };

    node.addEventListener("loadedmetadata", apply);
    node.addEventListener("durationchange", apply);
    node.addEventListener("canplay", apply);

    void (async () => {
      try {
        const res = await fetch(src, { cache: "reload" });
        if (!res.ok) {
          throw new Error("audio");
        }
        const blob = await res.blob();
        if (dead) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        node.src = objectUrl;
        node.load();
      } catch {
        if (!dead) {
          node.src = src;
          node.load();
        }
      }
    })();

    return () => {
      dead = true;
      node.pause();
      node.removeAttribute("src");
      node.load();
      audio.current = null;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setPlaying(false);
    };
  }, [src]);

  useEffect(() => {
    if (!duration) {
      return;
    }
    const range = clipRange({ start, end }, duration);
    setClip(range.start, range.end);
  }, [duration, end, start]);

  useEffect(() => {
    const node = audio.current;
    if (!node) {
      return;
    }
    const onTime = () => {
      if (node.currentTime >= toRef.current - 0.03) {
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
  }, [src]);

  function pointToTime(clientX: number) {
    const box = track.current?.getBoundingClientRect();
    if (!box || !duration) {
      return 0;
    }
    return roundClip(clamp(((clientX - box.left) / box.width) * duration, 0, duration));
  }

  function move(clientX: number) {
    const time = pointToTime(clientX);
    const gap = Math.min(0.2, duration);
    if (drag.current === "from") {
      setClip(Math.min(time, toRef.current - gap), toRef.current);
      return;
    }
    if (drag.current === "to") {
      setClip(fromRef.current, Math.max(time, fromRef.current + gap));
    }
  }

  function stopDrag() {
    if (!drag.current) {
      return;
    }
    drag.current = null;
    onChange(fromRef.current, toRef.current);
  }

  function startDrag(which: "from" | "to", event: React.PointerEvent<HTMLButtonElement>) {
    if (disabled || !duration) {
      return;
    }
    drag.current = which;
    event.currentTarget.setPointerCapture(event.pointerId);
    move(event.clientX);
  }

  async function listen() {
    const node = audio.current;
    if (!node || !duration) {
      return;
    }
    if (playing) {
      node.pause();
      setPlaying(false);
      return;
    }
    node.currentTime = fromRef.current;
    await node.play();
    setPlaying(true);
  }

  const left = duration > 0 ? (from / duration) * 100 : 0;
  const width = duration > 0 ? ((to - from) / duration) * 100 : 0;

  return (
    <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Від {formatClipTime(from)}</span>
        <span>{duration ? `До ${formatClipTime(to)}` : "Читаю файл…"}</span>
      </div>
      <div
        ref={track}
        className="relative mx-2 h-8 touch-none select-none"
        onPointerDown={(event) => {
          if (disabled || !duration || (event.target as HTMLElement).closest("button")) {
            return;
          }
          const time = pointToTime(event.clientX);
          drag.current = Math.abs(time - fromRef.current) <= Math.abs(time - toRef.current) ? "from" : "to";
          event.currentTarget.setPointerCapture(event.pointerId);
          move(event.clientX);
        }}
        onPointerMove={(event) => {
          if (drag.current) {
            move(event.clientX);
          }
        }}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-zinc-200">
          <div className="absolute h-full rounded-full bg-zinc-900" style={{ left: `${left}%`, width: `${Math.max(width, 0)}%` }} />
        </div>
        <button
          type="button"
          disabled={disabled || !duration}
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full bg-zinc-900 disabled:opacity-40"
          style={{ left: `${left}%` }}
          onPointerDown={(event) => startDrag("from", event)}
          onPointerMove={(event) => {
            if (drag.current) {
              move(event.clientX);
            }
          }}
          onPointerUp={stopDrag}
          aria-label="Початок фрагмента"
        />
        <button
          type="button"
          disabled={disabled || !duration}
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full bg-zinc-900 disabled:opacity-40"
          style={{ left: `${left + width}%` }}
          onPointerDown={(event) => startDrag("to", event)}
          onPointerMove={(event) => {
            if (drag.current) {
              move(event.clientX);
            }
          }}
          onPointerUp={stopDrag}
          aria-label="Кінець фрагмента"
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
          onClick={() => {
            setClip(0, duration);
            onChange(0, duration);
          }}
          className="text-xs text-zinc-400 hover:text-zinc-700 disabled:opacity-40"
        >
          Весь файл
        </button>
      </div>
    </div>
  );
}
