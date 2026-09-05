"use client";

import { TwitchChatEmbed } from "@/components/twitch-chat";
import { useOverlayState } from "@/components/overlay-widgets";
import { useParams } from "next/navigation";

export default function ChatOverlayPage() {
  const params = useParams<{ token: string }>();
  const state = useOverlayState(params.token);

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
    <main className="h-screen w-full">
      <TwitchChatEmbed login={state.twitchLogin} />
    </main>
  );
}
