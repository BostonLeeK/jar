"use client";

import { formatUah } from "@/lib/money";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

export type OverlayDonation = {
  id: string;
  amount: number;
  nickname: string;
  message: string;
  createdAt: string;
};

export type OverlayState = {
  name: string;
  accentColor: string;
  showGoal: boolean;
  raised: number;
  goal: number;
  overlayDuration: number;
  alertStyle: string;
  donations: OverlayDonation[];
};

export function useOverlayState(token: string) {
  const [state, setState] = useState<OverlayState | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await fetch(`/api/overlay/${token}/state`, { cache: "no-store" });
      if (!res.ok || !active) {
        return;
      }
      setState((await res.json()) as OverlayState);
    }
    load();
    const timer = window.setInterval(load, 4000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [token]);

  return state;
}

export function useOverlayAlerts(token: string, duration: number) {
  const [current, setCurrent] = useState<OverlayDonation | null>(null);

  useEffect(() => {
    const source = new EventSource(`/api/overlay/${token}/stream`);
    let hide: number | undefined;
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { type: string } & OverlayDonation;
      if (payload.type !== "donation") {
        return;
      }
      setCurrent(payload);
      window.clearTimeout(hide);
      hide = window.setTimeout(() => setCurrent(null), duration * 1000);
    };
    return () => {
      source.close();
      window.clearTimeout(hide);
    };
  }, [token, duration]);

  return current;
}

export function AlertView({
  donation,
  style,
  accent,
}: {
  donation: OverlayDonation | null;
  style: string;
  accent: string;
}) {
  if (!donation) {
    return null;
  }

  return (
    <div
      className={cn(
        "animate-[fadeIn_0.35s_ease] text-white",
        style === "banner" && "w-full bg-black/70 px-6 py-4",
        style === "card" && "mx-auto w-fit rounded-xl border border-white/15 bg-black/75 px-6 py-4",
        style === "minimal" && "px-4 py-3",
      )}
    >
      <p className="text-xl font-medium tracking-tight">
        <span style={{ color: accent }}>{donation.nickname}</span>
        <span className="mx-2 text-white/40">—</span>
        <span className="font-mono">{formatUah(donation.amount)}</span>
      </p>
      {donation.message ? <p className="mt-1 text-sm text-white/70">{donation.message}</p> : null}
    </div>
  );
}

export function GoalView({ state }: { state: OverlayState }) {
  if (!state.showGoal || state.goal <= 0) {
    return null;
  }
  const progress = Math.min(100, Math.round((state.raised / state.goal) * 100));
  return (
    <div className="w-[440px] text-white">
      <div className="mb-2 flex items-baseline justify-between text-sm">
        <span className="font-medium">{state.name}</span>
        <span className="font-mono text-white/80">
          {formatUah(state.raised)} / {formatUah(state.goal)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: state.accentColor }} />
      </div>
    </div>
  );
}

export function RecentView({ state }: { state: OverlayState }) {
  return (
    <div className="w-[320px] text-white">
      <p className="mb-2 text-xs uppercase tracking-[0.16em] text-white/50">Останні донати</p>
      <ul className="space-y-2">
        {state.donations.length === 0 ? (
          <li className="text-sm text-white/40">Поки тихо</li>
        ) : (
          state.donations.slice(0, 6).map((item) => (
            <li key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{item.nickname}</span>
              <span className="font-mono text-white/80">{formatUah(item.amount)}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
