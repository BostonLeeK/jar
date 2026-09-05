"use client";

import { Button, Card } from "@/components/ui";
import type { SafeUser } from "@/lib/user";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TwitchPanel({
  user,
  configured,
  reachable,
  error,
}: {
  user: SafeUser;
  configured: boolean;
  reachable: boolean;
  error?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const needsAlerts = Boolean(user.twitchLogin && !user.twitchEventSub);

  async function disconnect() {
    setPending(true);
    await fetch("/api/twitch/disconnect", { method: "POST" });
    setPending(false);
    router.refresh();
  }

  return (
    <Card className="p-5">
      {user.twitchLogin ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {user.twitchAvatar ? (
                <img src={user.twitchAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
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
          {user.twitchEventSub ? (
            <p className="text-sm text-zinc-500">
              Алерти в оверлеї: фоловери, підписки, гіфти, bits і рейди. Донати з Банки рахуються окремо.
            </p>
          ) : needsAlerts && reachable ? (
            <div className="space-y-3">
              <p className="text-sm text-zinc-500">
                Канал підключено без алертів. Підключи знову, щоб дозволити фоловерів, підписки, bits і рейди.
              </p>
              <a href="/api/twitch/start">
                <Button type="button">Увімкнути алерти Twitch</Button>
              </a>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              Нік на сторінці донатів уже є. Живі алерти Twitch увімкнуться на публічному https — локально EventSub не доходить.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">
            Підключи канал: нік зʼявиться на сторінці донатів, а фоловери, підписки, гіфти, bits і рейди підуть у той самий алерт, що й Банка.
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
