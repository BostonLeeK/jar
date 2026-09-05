"use client";

import { formatAlertDetail, type AlertKind } from "@/lib/alerts";
import { CustomBlock } from "@/components/custom-markup";
import { DEFAULT_ALERT_CSS, DEFAULT_ALERT_HTML, DEFAULT_GOAL_CSS, DEFAULT_GOAL_HTML, DEFAULT_RECENT_CSS, DEFAULT_RECENT_HTML } from "@/lib/custom-defaults";
import { formatUah } from "@/lib/money";
import { clipRange } from "@/lib/audio-clip";
import { overlayPalette, pickAlertVisual, type AlertTierConfig, type TwitchAlertConfig } from "@/lib/overlay";
import { escapeAttr, escapeHtml } from "@/lib/template";
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
  twitchLogin: string | null;
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
  ttsLang: string;
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
  const durationRef = useRef(duration);
  durationRef.current = duration;

  useEffect(() => {
    let source: EventSource | null = null;
    let hide: number | undefined;
    let watchdog: number | undefined;
    let reconnect: number | undefined;
    let stopped = false;

    function arm() {
      window.clearTimeout(watchdog);
      watchdog = window.setTimeout(connect, 40000);
    }

    function connect() {
      window.clearTimeout(reconnect);
      source?.close();
      if (stopped) {
        return;
      }
      source = new EventSource(`/api/overlay/${token}/stream`);
      source.onopen = arm;
      source.onmessage = (event) => {
        arm();
        const payload = JSON.parse(event.data) as { type: string } & OverlayDonation;
        if (payload.type !== "donation" && payload.type !== "alert") {
          return;
        }
        setCurrent(payload);
        window.clearTimeout(hide);
        hide = window.setTimeout(() => setCurrent(null), durationRef.current * 1000);
      };
      source.onerror = () => {
        source?.close();
        if (!stopped) {
          window.clearTimeout(reconnect);
          reconnect = window.setTimeout(connect, 1500);
        }
      };
      arm();
    }

    connect();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        connect();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      source?.close();
      window.clearTimeout(hide);
      window.clearTimeout(watchdog);
      window.clearTimeout(reconnect);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [token]);

  return current;
}

function speakBrowser(text: string, lang: string) {
  if (!window.speechSynthesis || !text.trim()) {
    return;
  }
  const utter = new SpeechSynthesisUtterance(text.trim());
  utter.lang = lang === "en" ? "en-US" : "uk-UA";
  utter.rate = 1;
  const prefix = lang === "en" ? "en" : "uk";
  const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith(prefix));
  if (voice) {
    utter.voice = voice;
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function waitUntilEnd(audio: HTMLAudioElement) {
  return new Promise<void>((resolve) => {
    if (audio.ended || audio.error) {
      resolve();
      return;
    }
    const done = () => {
      audio.removeEventListener("ended", done);
      audio.removeEventListener("error", done);
      resolve();
    };
    audio.addEventListener("ended", done);
    audio.addEventListener("error", done);
  });
}

async function playUntilEnd(
  src: string,
  attach?: (audio: HTMLAudioElement) => void,
  clip?: { start: number; end: number },
) {
  const audio = new Audio(src);
  audio.preload = "auto";
  attach?.(audio);
  try {
    await new Promise<void>((resolve, reject) => {
      if (audio.readyState >= 1) {
        resolve();
        return;
      }
      audio.addEventListener("loadedmetadata", () => resolve(), { once: true });
      audio.addEventListener("error", () => reject(new Error("audio")), { once: true });
    });
    const range = clipRange(clip, audio.duration || 0);
    if (range.start > 0) {
      audio.currentTime = range.start;
    }
    const stopAt = range.end > range.start ? range.end : 0;
    const onTime = () => {
      if (stopAt && audio.currentTime >= stopAt - 0.03) {
        audio.pause();
        audio.dispatchEvent(new Event("ended"));
      }
    };
    if (stopAt) {
      audio.addEventListener("timeupdate", onTime);
    }
    await audio.play();
    await waitUntilEnd(audio);
    audio.removeEventListener("timeupdate", onTime);
  } catch {
    return audio;
  }
  return audio;
}

async function fetchTtsUrl(text: string, token: string) {
  const res = await fetch(`/api/overlay/${encodeURIComponent(token)}/tts?text=${encodeURIComponent(text)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("tts");
  }
  const blob = await res.blob();
  if (blob.size < 32) {
    throw new Error("tts");
  }
  return URL.createObjectURL(blob);
}

export function useAlertEffects(donation: OverlayDonation | null, state: OverlayState | null, token: string) {
  const stateRef = useRef(state);
  stateRef.current = state;
  const ready = Boolean(state);
  const playingId = useRef<string | null>(null);
  const nodes = useRef<{ sound: HTMLAudioElement | null; voice: HTMLAudioElement | null; url: string | null }>({
    sound: null,
    voice: null,
    url: null,
  });

  useEffect(() => {
    return () => {
      nodes.current.sound?.pause();
      nodes.current.voice?.pause();
      window.speechSynthesis?.cancel();
      if (nodes.current.url) {
        URL.revokeObjectURL(nodes.current.url);
      }
    };
  }, []);

  useEffect(() => {
    const current = stateRef.current;
    if (!donation || !current || playingId.current === donation.id) {
      return;
    }

    nodes.current.sound?.pause();
    nodes.current.voice?.pause();
    window.speechSynthesis?.cancel();
    if (nodes.current.url) {
      URL.revokeObjectURL(nodes.current.url);
    }
    nodes.current = { sound: null, voice: null, url: null };
    playingId.current = donation.id;

    const alertId = donation.id;
    const tier = pickAlertVisual(current.alertTiers, donation, current.twitchAlerts);
    const spoken = donation.message.trim() || `${donation.nickname} ${formatAlertDetail(donation)}`;
    const shouldSpeak = current.alertTts && (tier ? tier.tts : true) && Boolean(spoken);
    const lang = current.ttsLang;
    const ttsJob = shouldSpeak ? fetchTtsUrl(spoken, token).catch(() => null) : null;

    void (async () => {
      if (tier?.audioUrl) {
        const sound = await playUntilEnd(
          tier.audioUrl,
          (item) => {
            nodes.current.sound = item;
          },
          { start: tier.audioStart, end: tier.audioEnd },
        );
        if (playingId.current !== alertId) {
          sound.pause();
          return;
        }
      }
      if (playingId.current !== alertId || !shouldSpeak) {
        return;
      }
      const url = ttsJob ? await ttsJob : null;
      if (playingId.current !== alertId) {
        if (url) {
          URL.revokeObjectURL(url);
        }
        return;
      }
      if (url) {
        nodes.current.url = url;
        await playUntilEnd(url, (item) => {
          nodes.current.voice = item;
        });
        return;
      }
      speakBrowser(spoken, lang);
    })();
  }, [donation, ready, token]);
}

export function OverlayShell({
  align = "center",
  children,
}: {
  align?: "center" | "start" | "end";
  children: ReactNode;
}) {
  return (
    <main
      className={cn(
        "@container flex h-screen w-screen p-[2.5vw]",
        align === "center" && "items-center",
        align === "start" && "items-start",
        align === "end" && "items-end justify-start",
      )}
    >
      {children}
    </main>
  );
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
        "animate-[fadeIn_0.35s_ease] w-full",
        style === "banner" && "px-[4cqi] py-[3cqi]",
        style === "card" && "rounded-[2cqi] border px-[4cqi] py-[3cqi]",
        style === "minimal" && "px-[1cqi] py-[1cqi]",
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
  const tier = pickAlertVisual(state.alertTiers, donation, state.twitchAlerts);
  if (state.alertUseCustom) {
    return (
      <CustomBlock
        html={state.alertCustomHtml || DEFAULT_ALERT_HTML}
        css={state.alertCustomCss || DEFAULT_ALERT_CSS}
        vars={{
          nickname: escapeHtml(donation.nickname),
          amount: escapeHtml(formatAlertDetail(donation)),
          message: state.alertShowMessage ? escapeHtml(donation.message) : "",
          kind: escapeHtml(donation.kind || "donation"),
          detail: escapeHtml(formatAlertDetail(donation)),
          gif: tier?.gifUrl ? `<img class="jar-gif" src="${escapeAttr(tier.gifUrl)}" alt="">` : "",
        }}
      />
    );
  }
  return (
    <Frame style={state.alertStyle} tone={state.overlayTone}>
      {tier?.gifUrl ? (
        <img src={tier.gifUrl} alt="" className="mb-[2cqi] max-h-[40cqi] max-w-full object-contain" />
      ) : null}
      <p className="text-[clamp(18px,5.2cqi,56px)] font-medium leading-tight tracking-tight">
        <span style={{ color: state.overlayAccent }}>{donation.nickname}</span>
        <span className="mx-[0.4em]" style={{ color: palette.dim }}>
          —
        </span>
        <span className="font-mono">{formatAlertDetail(donation)}</span>
      </p>
      {state.alertShowMessage && donation.message ? (
        <p className="mt-[0.4em] text-[clamp(13px,3.2cqi,32px)]" style={{ color: palette.muted }}>
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
  if (state.goalUseCustom) {
    return (
      <CustomBlock
        html={state.goalCustomHtml || DEFAULT_GOAL_HTML}
        css={state.goalCustomCss || DEFAULT_GOAL_CSS}
        vars={{
          title: escapeHtml(state.name),
          raised: escapeHtml(formatUah(state.raised)),
          goal: escapeHtml(formatUah(state.goal)),
          percent: String(progress),
        }}
      />
    );
  }
  return (
    <Frame style={state.goalStyle} tone={state.overlayTone}>
      {state.goalShowTitle ? (
        <div className="mb-[2cqi] flex items-baseline justify-between gap-[3cqi] text-[clamp(14px,4.4cqi,42px)]">
          <span className="truncate font-medium">{state.name}</span>
          <span className="shrink-0 font-mono" style={{ color: palette.muted }}>
            {formatUah(state.raised)} / {formatUah(state.goal)}
          </span>
        </div>
      ) : (
        <div className="mb-[2cqi] text-right font-mono text-[clamp(14px,4.4cqi,42px)]" style={{ color: palette.muted }}>
          {formatUah(state.raised)} / {formatUah(state.goal)}
        </div>
      )}
      <div className="h-[clamp(8px,2cqi,18px)] overflow-hidden rounded-full" style={{ background: palette.track }}>
        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: state.overlayAccent }} />
      </div>
    </Frame>
  );
}

export function RecentView({ state }: { state: OverlayState }) {
  const palette = overlayPalette(state.overlayTone);
  const items = state.donations.slice(0, Math.max(1, state.recentLimit));
  if (state.recentUseCustom) {
    return (
      <CustomBlock
        html={state.recentCustomHtml || DEFAULT_RECENT_HTML}
        css={state.recentCustomCss || DEFAULT_RECENT_CSS}
        vars={{ title: escapeHtml(state.recentTitle || "Останні донати") }}
        lists={{
          items: items.map((item) => ({
            nickname: escapeHtml(item.nickname),
            amount: escapeHtml(formatUah(item.amount)),
          })),
        }}
      />
    );
  }
  return (
    <Frame style={state.recentStyle} tone={state.overlayTone}>
      <p
        className="mb-[2cqi] text-[clamp(11px,3cqi,22px)] uppercase tracking-[0.16em]"
        style={{ color: palette.dim }}
      >
        {state.recentTitle || "Останні донати"}
      </p>
      <ul className="space-y-[1.6cqi]">
        {items.length === 0 ? (
          <li className="text-[clamp(14px,4.2cqi,36px)]" style={{ color: palette.dim }}>
            Поки тихо
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="flex items-baseline justify-between gap-[3cqi] text-[clamp(14px,4.2cqi,36px)]"
            >
              <span className="truncate">{item.nickname}</span>
              <span className="shrink-0 font-mono" style={{ color: palette.muted }}>
                {formatUah(item.amount)}
              </span>
            </li>
          ))
        )}
      </ul>
    </Frame>
  );
}
