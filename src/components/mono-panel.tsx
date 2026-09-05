"use client";

import { Button, Card, FieldError, Input, Label } from "@/components/ui";
import { formatUah } from "@/lib/money";
import type { MonoJar } from "@/lib/mono";
import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MonoPanel({
  hasToken,
  selectedJarId,
  webhookSet,
  initialJars,
  appUrl,
}: {
  hasToken: boolean;
  selectedJarId: string | null;
  webhookSet: boolean;
  initialJars: MonoJar[];
  appUrl: string;
}) {
  const router = useRouter();
  const [jars, setJars] = useState(initialJars);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [webhookNote, setWebhookNote] = useState<string | null>(
    webhookSet ? null : hasToken ? "Webhook ще не активний. Потрібен публічний APP_URL." : null,
  );

  async function connect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const token = String(new FormData(event.currentTarget).get("token") ?? "");
    const res = await fetch("/api/mono/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = (await res.json()) as {
      error?: string;
      jars?: MonoJar[];
      webhookSet?: boolean;
      webhookError?: string | null;
    };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Не вдалося підключити токен");
      return;
    }
    setJars(data.jars ?? []);
    setWebhookNote(data.webhookSet ? null : data.webhookError || "Webhook не встановлено");
    router.refresh();
  }

  async function selectJar(jarId: string) {
    setPending(true);
    setError(null);
    const res = await fetch("/api/mono/jar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jarId }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Не вдалося обрати банку");
      return;
    }
    router.refresh();
  }

  const local = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="text-sm font-medium">Personal API</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Токен береться на{" "}
          <a href="https://api.monobank.ua/" className="text-white underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
            api.monobank.ua
          </a>
          . Зберігається в зашифрованому вигляді.
        </p>
        <form onSubmit={connect} className="mt-4 space-y-3">
          <div>
            <Label htmlFor="token">X-Token</Label>
            <Input
              id="token"
              name="token"
              type="password"
              placeholder={hasToken ? "Токен підключено — можна замінити" : "Встав токен"}
              required
            />
          </div>
          <Button type="submit" disabled={pending}>
            {hasToken ? "Оновити токен" : "Підключити"}
          </Button>
        </form>
        <FieldError>{error}</FieldError>
        {webhookNote ? <p className="mt-3 text-sm text-amber-400">{webhookNote}</p> : null}
        {local ? (
          <p className="mt-3 text-sm text-zinc-500">
            Зараз APP_URL локальний. Для живих webhook потрібен тунель (Cloudflare Tunnel / ngrok) і той самий URL у
            APP_URL.
          </p>
        ) : null}
      </Card>

      {jars.length > 0 ? (
        <div className="grid gap-3">
          {jars.map((jar) => {
            const active = selectedJarId === jar.id;
            return (
              <button
                key={jar.id}
                type="button"
                disabled={pending}
                onClick={() => selectJar(jar.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  active ? "border-white/40 bg-white/5" : "border-white/8 hover:border-white/20",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{jar.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">send.monobank.ua/{jar.sendId}</p>
                  </div>
                  <p className="font-mono text-sm text-zinc-300">{formatUah(jar.balance)}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : hasToken ? (
        <p className="text-sm text-zinc-500">Банок не знайдено. Створи Банку в застосунку monobank.</p>
      ) : null}
    </div>
  );
}
