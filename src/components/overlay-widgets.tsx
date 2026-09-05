"use client";

import { formatAlertDetail, type AlertKind } from "@/lib/alerts";
import { formatUah } from "@/lib/money";
import { overlayPalette, pickAlertVisual, type AlertTierConfig } from "@/lib/overlay";
import { cn } from "@/lib/cn";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type OverlayDonation = {
  id: string;
  kind?: AlertKind;
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
      if (payload.type !== "donation" && payload.type !== "alert") {
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

function speakDonation(text: string) {
  if (!window.speechSynthesis || !text.trim()) {
    return;
  }
  const utter = new SpeechSynthesisUtterance(text.trim());
  utter.lang = "uk-UA";
  utter.rate = 1;
  const voice = window.speechSynthesis
    .getVoices()
    .find((item) => item.lang.toLowerCase().startsWith("uk"));
  if (voice) {
    utter.voice = voice;
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export function useAlertEffects(donation: OverlayDonation | null, state: OverlayState | null) {
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const current = stateRef.current;
    if (!donation || !current) {
      return;
    }
    const tier = pickAlertVisual(current.alertTiers, donation);
    const spoken = donation.message.trim() || `${donation.nickname} ${formatAlertDetail(donation)}`;
    const shouldSpeak = current.alertTts && (tier ? tier.tts : true) && Boolean(spoken);
    let audio: HTMLAudioElement | null = null;
    let cancelled = false;

    const speak = () => {
      if (!cancelled && shouldSpeak) {
        speakDonation(spoken);
      }
    };

    window.speechSynthesis?.cancel();
    if (tier?.audioUrl) {
      audio = new Audio(tier.audioUrl);
      audio.play().then(() => undefined).catch(speak);
      audio.onended = speak;
    } else {
      speak();
    }

    return () => {
      cancelled = true;
      audio?.pause();
      window.speechSynthesis?.cancel();
    };
  }, [donation]);
}

function Frame({
  style,
  tone,
  className,
  children,
}: {
  style: string;
  tone: string;
  className?: string;
  children: ReactNode;
}) {
  const palette = overlayPalette(tone);
  return (
    <div
      className={cn(
        "animate-[fadeIn_0.35s_ease]",
        style === "banner" && "w-full px-6 py-4",
        style === "card" && "w-fit rounded-xl border px-6 py-4",
        style === "minimal" && "px-1 py-1",
        className,
      )}
      style={{
        color: palette.text,
        background: style === "minimal" ? "transparent" : palette.surface,
        borderColor: style === "card" ? palette.border : "transparent",
      }}
    >
      {children}
    </div>
  );
}

export function AlertView({
  donation,
  state,
}: {
  donation: OverlayDonation | null;
  state: OverlayState;
}) {
  if (!donation) {
    return null;
  }
  const palette = overlayPalette(state.overlayTone);
  const tier = pickAlertVisual(state.alertTiers, donation);
  return (
    <Frame style={state.alertStyle} tone={state.overlayTone} className="max-w-full">
      {tier?.gifUrl ? (
        <img src={tier.gifUrl} alt="" className="mb-3 max-h-52 max-w-full object-contain" />
      ) : null}
      <p className="text-xl font-medium tracking-tight">
        <span style={{ color: state.overlayAccent }}>{donation.nickname}</span>
        <span className="mx-2" style={{ color: palette.dim }}>
          —
        </span>
        <span className="font-mono">{formatAlertDetail(donation)}</span>
      </p>
      {state.alertShowMessage && donation.message ? (
        <p className="mt-1 text-sm" style={{ color: palette.muted }}>
          {donation.message}
        </p>
      ) : null}
    </Frame>
  );
}

export function GoalView({ state }: { state: OverlayState }) {
  if (!state.showGoal || state.goal <= 0) {
    return null;
  }
  const progress = Math.min(100, Math.round((state.raised / state.goal) * 100));
  const palette = overlayPalette(state.overlayTone);
  return (
    <Frame style={state.goalStyle} tone={state.overlayTone} className="w-[440px] max-w-full">
      {state.goalShowTitle ? (
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium">{state.name}</span>
          <span className="font-mono" style={{ color: palette.muted }}>
            {formatUah(state.raised)} / {formatUah(state.goal)}
          </span>
        </div>
      ) : (
        <div className="mb-2 text-right font-mono text-sm" style={{ color: palette.muted }}>
          {formatUah(state.raised)} / {formatUah(state.goal)}
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full" style={{ background: palette.track }}>
        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: state.overlayAccent }} />
      </div>
    </Frame>
  );
}

export function RecentView({ state }: { state: OverlayState }) {
  const palette = overlayPalette(state.overlayTone);
  const items = state.donations.slice(0, Math.max(1, state.recentLimit));
  return (
    <Frame style={state.recentStyle} tone={state.overlayTone} className="w-[320px] max-w-full">
      <p className="mb-2 text-xs uppercase tracking-[0.16em]" style={{ color: palette.dim }}>
        {state.recentTitle || "Останні донати"}
      </p>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="text-sm" style={{ color: palette.dim }}>
            Поки тихо
          </li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{item.nickname}</span>
              <span className="font-mono" style={{ color: palette.muted }}>
                {formatUah(item.amount)}
              </span>
            </li>
          ))
        )}
      </ul>
    </Frame>
  );
}
