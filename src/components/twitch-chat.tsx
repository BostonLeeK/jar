"use client";

import { overlayPalette } from "@/lib/overlay";
import { parseIrcLine, twitchIrcNick, type ChatMessage } from "@/lib/twitch-irc";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

const LIMIT = 16;

export const SAMPLE_CHAT: ChatMessage[] = [
  {
    id: "s1",
    nick: "boston_fan",
    color: "#bf94ff",
    action: false,
    parts: [{ type: "text", text: "запускай Condemned" }],
  },
  {
    id: "s2",
    nick: "viewer",
    color: "#2ecc71",
    action: false,
    parts: [{ type: "text", text: "красунчик" }],
  },
  {
    id: "s3",
    nick: "chat",
    color: "#00d2d3",
    action: false,
    parts: [{ type: "text", text: "gg wp" }],
  },
];

export function useTwitchChat(login: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const channel = login?.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!channel) {
      setMessages([]);
      return;
    }
    let ws: WebSocket | null = null;
    let retry: number | undefined;
    let closed = false;
    let delay = 800;

    function push(message: ChatMessage) {
      setMessages((prev) => [...prev, message].slice(-LIMIT));
    }

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
            push(parsed.message);
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
  const palette = overlayPalette(tone);
  const hold = Math.max(4, duration);

  return (
    <div className="flex w-full flex-col justify-end gap-[1.2cqi]">
      {messages.map((item) => (
        <p
          key={item.id}
          className={cn("text-[clamp(14px,3.8cqi,32px)] leading-snug", preview && "animate-[fadeIn_0.35s_ease]")}
          style={{
            color: palette.text,
            textShadow: tone === "light" ? "0 1px 2px rgba(255,255,255,0.7)" : "0 1px 3px rgba(0,0,0,0.75)",
            animation: preview ? undefined : `chatLine ${hold}s linear forwards`,
            fontStyle: item.action ? "italic" : undefined,
          }}
          onAnimationEnd={(event) => {
            if (!preview && event.animationName === "chatLine") {
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
      ))}
    </div>
  );
}
