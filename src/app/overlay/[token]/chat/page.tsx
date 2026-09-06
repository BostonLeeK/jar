"use client";

import { OverlayShell, useOverlayState } from "@/components/overlay-widgets";
import { ChatView, useTwitchChat } from "@/components/twitch-chat";
import { useParams } from "next/navigation";

export default function ChatOverlayPage() {
  const params = useParams<{ token: string }>();
  const state = useOverlayState(params.token);
  const chat = useTwitchChat(state?.twitchLogin ?? null, params.token);

  if (!state) {
    return null;
  }

  return (
    <OverlayShell align="end">
      <ChatView
        messages={chat.messages}
        tone={state.overlayTone}
        accent={state.overlayAccent}
        duration={state.overlayChatDuration}
        onDone={chat.dismiss}
      />
    </OverlayShell>
  );
}
