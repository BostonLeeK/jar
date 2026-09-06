"use client";

import { useEffect, useRef } from "react";

export type OverlayStreamPayload = {
  type: string;
  [key: string]: unknown;
};

export function useOverlayStream(token: string | null | undefined, onEvent: (payload: OverlayStreamPayload) => void) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!token) {
      return;
    }
    let source: EventSource | null = null;
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
        try {
          onEventRef.current(JSON.parse(event.data) as OverlayStreamPayload);
        } catch {
          return;
        }
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
      window.clearTimeout(watchdog);
      window.clearTimeout(reconnect);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [token]);
}
