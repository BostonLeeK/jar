"use client";

import { Button, Card } from "@/components/ui";
import type { SafeUser } from "@/lib/user";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TwitchPanel({
  user,
  configured,
  error,
}: {
  user: SafeUser;
  configured: boolean;
  error?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function disconnect() {
    setPending(true);
    await fetch("/api/twitch/disconnect", { method: "POST" });
    setPending(false);
    router.refresh();
  }

  return (
    <Card className="p-5">
      {user.twitchLogin ? (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {user.twitchAvatar ? (
              <Image
                src={user.twitchAvatar}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
            ) : null}
            <div>
              <p className="text-sm font-medium">{user.twitchDisplayName}</p>
              <p className="text-xs text-zinc-500">twitch.tv/{user.twitchLogin}</p>
            </div>
          </div>
          <Button type="button" variant="danger" onClick={disconnect} disabled={pending}>
            Відʼєднати
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">
            Підключи канал, щоб на сторінці донатів зʼявився нік і аватар Twitch.
          </p>
          {configured ? (
            <a href="/api/twitch/start">
              <Button type="button">Підключити Twitch</Button>
            </a>
          ) : (
            <div className="space-y-2 text-sm text-zinc-500">
              <p>Додай у `.env` ключі застосунку з dev.twitch.tv:</p>
              <p className="font-mono text-xs text-zinc-500">TWITCH_CLIENT_ID</p>
              <p className="font-mono text-xs text-zinc-500">TWITCH_CLIENT_SECRET</p>
              <p>
                Redirect URL:{" "}
                <span className="font-mono text-zinc-700">/api/twitch/callback</span>
              </p>
            </div>
          )}
          {error ? (
            <p className="text-sm text-red-500">Не вдалося підключити Twitch. {error}</p>
          ) : null}
        </div>
      )}
    </Card>
  );
}
