"use client";

import { useOverlayStream } from "@/components/overlay-stream";
import { normalizeChatDuration, parseOverlayChat, TEST_CHAT_SAMPLES } from "@/lib/chat";
import { overlayPalette } from "@/lib/overlay";
import { parseIrcLine, twitchIrcNick, type ChatMessage } from "@/lib/twitch-irc";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

const FADE_OUT = 1.2;

const LIMIT = 16;

function appendChat(prev: ChatMessage[], message: ChatMessage) {
  return [...prev, message].slice(-LIMIT);
}

export const SAMPLE_CHAT: ChatMessage[] = TEST_CHAT_SAMPLES.map((item, index) => ({
  id: `s${index + 1}`,
  nick: item.nick,
  color: item.color,
  action: false,
  parts: [{ type: "text", text: item.text }],
}));

export function useTwitchChat(login: string | null, token?: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useOverlayStream(token, (payload) => {
    const message = parseOverlayChat(payload);
    if (message) {
      setMessages((prev) => appendChat(prev, message));
    }
  });

  useEffect(() => {
    const channel = login?.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!channel) {
      return;
    }
    let ws: WebSocket | null = null;
    let retry: number | undefined;
    let closed = false;
    let delay = 800;

    function connect() {
      if (closed) {
        return;
      }
      ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
      ws.onopen = () => {
        delay = 800;
        const nick = twitchIrcNick();
        ws?.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
        ws?.send("PASS SCHMOOPIIE");
        ws?.send(`NICK ${nick}`);
        ws?.send(`JOIN #${channel}`);
      };
      ws.onmessage = (event) => {
        for (const line of String(event.data).split(/\r?\n/)) {
          const parsed = parseIrcLine(line);
          if (!parsed) {
            continue;
          }
          if (parsed.kind === "ping") {
            ws?.send(`PONG ${parsed.token}`);
            continue;
          }
          if (parsed.kind === "privmsg") {
            setMessages((prev) => appendChat(prev, parsed.message));
            continue;
          }
          if (parsed.kind === "clearmsg") {
            setMessages((prev) => prev.filter((item) => item.id !== parsed.id));
            continue;
          }
          if (parsed.kind === "clearchat") {
            setMessages((prev) =>
              parsed.nick ? prev.filter((item) => item.nick.toLowerCase() !== parsed.nick) : [],
            );
          }
        }
      };
      ws.onclose = () => {
        if (!closed) {
          retry = window.setTimeout(connect, delay);
          delay = Math.min(delay * 2, 8000);
        }
      };
    }

    connect();
    return () => {
      closed = true;
      window.clearTimeout(retry);
      ws?.close();
    };
  }, [login]);

  function dismiss(id: string) {
    setMessages((prev) => prev.filter((item) => item.id !== id));
  }

  return { messages, dismiss };
}

function ChatLine({
  item,
  tone,
  accent,
  duration,
  preview,
  onDone,
}: {
  item: ChatMessage;
  tone: string;
  accent: string;
  duration: number;
  preview?: boolean;
  onDone?: (id: string) => void;
}) {
  const palette = overlayPalette(tone);
  const hold = normalizeChatDuration(duration);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setFading(false);
    if (preview) {
      return;
    }
    const wait = Math.max(0.4, hold - FADE_OUT);
    const timer = window.setTimeout(() => setFading(true), wait * 1000);
    return () => window.clearTimeout(timer);
  }, [hold, item.id, preview]);

  return (
    <p
      className={cn("text-[clamp(14px,3.8cqi,32px)] leading-snug", preview && "animate-[fadeIn_0.35s_ease]")}
      style={{
        color: palette.text,
        textShadow: tone === "light" ? "0 1px 2px rgba(255,255,255,0.7)" : "0 1px 3px rgba(0,0,0,0.75)",
        animation: preview ? undefined : fading ? `chatOut ${FADE_OUT}s linear forwards` : "chatIn 0.4s ease forwards",
        fontStyle: item.action ? "italic" : undefined,
      }}
      onAnimationEnd={(event) => {
        if (!preview && fading && event.animationName === "chatOut") {
          onDone?.(item.id);
        }
      }}
    >
      <span className="mr-1.5 font-semibold" style={{ color: item.color || accent }}>
        {item.nick}
      </span>
      {item.parts.map((part, index) =>
        part.type === "emote" ? (
          <img
            key={`${item.id}-${index}`}
            src={`https://static-cdn.jtvnw.net/emoticons/v2/${part.id}/default/dark/2.0`}
            alt={part.name}
            title={part.name}
            className="mx-[0.15em] inline-block h-[1.25em] w-[1.25em] align-[-0.2em] object-contain"
          />
        ) : (
          <span key={`${item.id}-${index}`}>{part.text}</span>
        ),
      )}
    </p>
  );
}

export function ChatView({
  messages,
  tone,
  accent,
  duration,
  preview,
  onDone,
}: {
  messages: ChatMessage[];
  tone: string;
  accent: string;
  duration: number;
  preview?: boolean;
  onDone?: (id: string) => void;
}) {
  return (
    <div className="flex w-full flex-col justify-end gap-[1.2cqi]">
      {messages.map((item) => (
        <ChatLine
          key={item.id}
          item={item}
          tone={tone}
          accent={accent}
          duration={duration}
          preview={preview}
          onDone={onDone}
        />
      ))}
    </div>
  );
}
