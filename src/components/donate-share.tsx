"use client";

import { useState } from "react";

export function DonateChrome({
  slug,
  color,
  border,
  preview,
}: {
  slug: string;
  color: string;
  border: string;
  preview?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  async function share() {
    if (preview) {
      return;
    }
    const url = `${window.location.origin}/d/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ url, title: document.title });
        return;
      }
    } catch {}
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => void share()}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium"
        style={{ color, borderColor: border }}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" />
        </svg>
        {copied ? "Скопійовано" : "Поділитись"}
      </button>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-8 items-center justify-center rounded-full border"
        style={{ color, borderColor: border }}
        aria-label="Меню"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <circle cx="6" cy="12" r="1.4" />
          <circle cx="12" cy="12" r="1.4" />
          <circle cx="18" cy="12" r="1.4" />
        </svg>
      </button>
      {open ? (
        <div
          className="absolute top-10 right-0 z-20 min-w-40 rounded-2xl border px-1 py-1 text-xs shadow-lg"
          style={{ color, borderColor: border, background: "color-mix(in srgb, currentColor 8%, transparent)" }}
        >
          <button type="button" className="block w-full rounded-xl px-3 py-2 text-left" onClick={() => void share()}>
            Копіювати лінк
          </button>
        </div>
      ) : null}
    </div>
  );
}
