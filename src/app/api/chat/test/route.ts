import { createChatMessage, createTestChatBurst } from "@/lib/chat";
import { emitChat } from "@/lib/events";
import { jsonError, readJson } from "@/lib/http";
import { requireApiUser } from "@/lib/user";
import { NextResponse } from "next/server";

const STAGGER_MS = 400;

export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) {
    return jsonError("Потрібна авторизація", 401);
  }
  const body = await readJson<{ nick?: string; message?: string; color?: string }>(req);
  const custom = Boolean(body.nick?.trim() || body.message?.trim());
  const messages = custom ? [createChatMessage(body)] : createTestChatBurst();
  messages.forEach((message, index) => {
    const send = () => emitChat(user.id, message);
    if (index === 0) {
      send();
      return;
    }
    setTimeout(send, index * STAGGER_MS);
  });
  return NextResponse.json({ ids: messages.map((item) => item.id) });
}
