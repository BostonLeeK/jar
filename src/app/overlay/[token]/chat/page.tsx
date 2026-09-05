"use client";

import { OverlayShell, useOverlayState } from "@/components/overlay-widgets";
import { ChatView, useTwitchChat } from "@/components/twitch-chat";
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
      <OverlayShell>
        <p className="text-[clamp(14px,3.6cqi,28px)] text-white/80">Підключи Twitch у кабінеті, щоб показати чат.</p>
      </OverlayShell>
    );
  }

  return (
    <OverlayShell align="end">
      <ChatView
        messages={chat.messages}
        tone={state.overlayTone}
        accent={state.overlayAccent}
        duration={state.overlayDuration}
        onDone={chat.dismiss}
      />
    </OverlayShell>
  );
}
