"use client";

import { useEffect, useState } from "react";

export function twitchChatSrc(login: string, parent: string) {
  const src = new URL(`https://www.twitch.tv/embed/${login}/chat`);
  src.searchParams.set("parent", parent);
  src.searchParams.set("darkpopout", "");
  return src.toString();
}

export function TwitchChatEmbed({ login, className }: { login: string; className?: string }) {
  const [parent, setParent] = useState("");

  useEffect(() => {
    setParent(window.location.hostname);
  }, []);

  if (!parent) {
    return null;
  }

  return <iframe src={twitchChatSrc(login, parent)} title="Twitch chat" className={className ?? "h-full w-full border-0"} />;
}
