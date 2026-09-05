"use client";

import { ChatView, useTwitchChat } from "@/components/twitch-chat";
import { useOverlayState } from "@/components/overlay-widgets";
import { useParams } from "next/navigation";

export default function ChatOverlayPage() {
  const params = useParams<{ token: string }>();
  const state = useOverlayState(params.token);
  const chat = useTwitchChat(state?.twitchLogin ?? null);

  if (!state) {
    return null;
  }

  if (!state.twitchLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 text-sm text-white/80">
        Підключи Twitch у кабінеті, щоб показати чат.
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-end p-4">
      <ChatView
        messages={chat.messages}
        tone={state.overlayTone}
        accent={state.overlayAccent}
        duration={state.overlayDuration}
        onDone={chat.dismiss}
      />
    </main>
  );
}
