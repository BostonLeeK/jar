import type { ChatMessage, ChatPart } from "@/lib/twitch-irc";
import { clamp } from "@/lib/validate";

export const CHAT_DURATION_MIN = 5;
export const CHAT_DURATION_MAX = 180;
export const CHAT_DURATION_DEFAULT = 30;

export function normalizeChatDuration(value: number) {
  return clamp(Math.round(Number.isFinite(value) ? value : CHAT_DURATION_DEFAULT), CHAT_DURATION_MIN, CHAT_DURATION_MAX);
}

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const TEST_CHAT_SAMPLES = [
  { nick: "boston_fan", color: "#bf94ff", text: "запускай Condemned" },
  { nick: "viewer", color: "#2ecc71", text: "красунчик" },
  { nick: "chat", color: "#00d2d3", text: "gg wp" },
] as const;

export function createChatMessage(input: {
  nick?: string;
  message?: string;
  color?: string;
  action?: boolean;
}): ChatMessage {
  const color = input.color?.trim() ?? "";
  return {
    id: `chat_test_${crypto.randomUUID()}`,
    nick: input.nick?.trim() || "boston_fan",
    color: HEX_COLOR.test(color) ? color : "#bf94ff",
    action: Boolean(input.action),
    parts: [{ type: "text", text: input.message?.trim() || "запускай Condemned" }],
  };
}

export function createTestChatBurst(): ChatMessage[] {
  return TEST_CHAT_SAMPLES.map((item) =>
    createChatMessage({ nick: item.nick, message: item.text, color: item.color }),
  );
}

export function parseOverlayChat(payload: { type?: unknown; [key: string]: unknown }): ChatMessage | null {
  if (payload.type !== "chat" || typeof payload.id !== "string" || typeof payload.nick !== "string") {
    return null;
  }
  if (!Array.isArray(payload.parts) || !payload.parts.every(isChatPart)) {
    return null;
  }
  return {
    id: payload.id,
    nick: payload.nick,
    color: typeof payload.color === "string" ? payload.color : "",
    action: Boolean(payload.action),
    parts: payload.parts,
  };
}

function isChatPart(value: unknown): value is ChatPart {
  if (!value || typeof value !== "object") {
    return false;
  }
  const part = value as ChatPart;
  if (part.type === "text") {
    return typeof part.text === "string";
  }
  if (part.type === "emote") {
    return typeof part.id === "string" && typeof part.name === "string";
  }
  return false;
}
