"use client";

import { Button, Card, FieldError } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatUah } from "@/lib/money";
import type { MonoAccount } from "@/lib/monobank/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ACCOUNT_TYPES: Record<string, string> = {
  black: "Чорна карта",
  white: "Біла карта",
  platinum: "Platinum",
  iron: "Iron",
  fop: "ФОП",
  yellow: "Yellow",
};

function accountLabel(account: MonoAccount) {
  const kind = ACCOUNT_TYPES[account.type] ?? account.type;
  const pan = account.maskedPan?.[0];
  const last4 = pan ? pan.slice(-4) : account.iban?.slice(-4);
  const suffix = last4 ? ` ****${last4}` : "";
  if (account.type === "fop") {
    return `${kind} ${account.currencyCode === 980 ? "UAH" : account.currencyCode}${suffix}`;
  }
  return `${kind}${suffix}`;
}

export function MonobankProviderPanel({
  configured,
  status,
  clientName,
  selectedAccountId,
  initialAccounts,
  appUrl,
}: {
  configured: boolean;
  status: string;
  clientName: string | null;
  selectedAccountId: string | null;
  initialAccounts: MonoAccount[];
  appUrl: string;
}) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [name, setName] = useState(clientName);
  const [selected, setSelected] = useState(selectedAccountId);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [webhookNote, setWebhookNote] = useState<string | null>(null);

  useEffect(() => {
    if (currentStatus !== "pending") {
      return;
    }
    const timer = window.setInterval(async () => {
      const res = await fetch("/api/integrations/monobank/status");
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as {
        status?: string;
        clientName?: string | null;
        selectedAccountId?: string | null;
      };
      if (data.status && data.status !== currentStatus) {
        setCurrentStatus(data.status);
        setName(data.clientName ?? null);
        setSelected(data.selectedAccountId ?? null);
        if (data.status === "connected") {
          const accountsRes = await fetch("/api/integrations/monobank/accounts");
          if (accountsRes.ok) {
            const body = (await accountsRes.json()) as { accounts?: MonoAccount[] };
            setAccounts(body.accounts ?? []);
          }
          router.refresh();
        }
      }
    }, 2500);
    return () => window.clearInterval(timer);
  }, [currentStatus, router]);

  async function connect() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/integrations/monobank/connect", { method: "POST" });
    const data = (await res.json()) as { error?: string; acceptUrl?: string };
    setPending(false);
    if (!res.ok || !data.acceptUrl) {
      setError(data.error || "Не вдалося створити запит на доступ");
      return;
    }
    setCurrentStatus("pending");
    const opened = window.open(data.acceptUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.href = data.acceptUrl;
    }
  }

  async function chooseAccount(accountId: string) {
    setPending(true);
    setError(null);
    const res = await fetch("/api/integrations/monobank/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    });
    const data = (await res.json()) as { error?: string; webhookSet?: boolean; webhookError?: string | null };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Не вдалося обрати рахунок");
      return;
    }
    setSelected(accountId);
    setWebhookNote(data.webhookSet ? null : data.webhookError || "Webhook не встановлено");
    router.refresh();
  }

  async function remove() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/integrations/monobank", { method: "DELETE" });
    setPending(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error || "Не вдалося відключити Monobank");
      return;
    }
    setCurrentStatus("revoked");
    setName(null);
    setSelected(null);
    setAccounts([]);
    router.refresh();
  }

  const local = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");
  const connected = currentStatus === "connected";

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="text-sm font-medium">Provider API</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Підключи акаунт monobank через офіційний запит доступу. Після підтвердження обери рахунок для донатів.
        </p>
        {!configured ? (
          <p className="mt-3 text-sm text-amber-600">
            Provider API не налаштовано. Додай MONOBANK_KEY_ID і MONOBANK_PRIVATE_KEY.
          </p>
        ) : null}
        {connected && name ? <p className="mt-3 text-sm text-zinc-700">Підключений Monobank · {name}</p> : null}
        {currentStatus === "pending" ? (
          <p className="mt-3 text-sm text-amber-600">Очікуємо підтвердження в застосунку monobank.</p>
        ) : null}
        {currentStatus === "failed" ? (
          <p className="mt-3 text-sm text-amber-600">Запит не знайдено або термін дії минув. Створи новий.</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" disabled={pending || !configured} onClick={connect}>
            {connected || currentStatus === "pending" ? "Підключити знову" : "Підключити Monobank"}
          </Button>
          {connected || currentStatus === "pending" ? (
            <Button type="button" variant="secondary" disabled={pending} onClick={remove}>
              Відключити
            </Button>
          ) : null}
        </div>
        <FieldError>{error}</FieldError>
        {webhookNote ? <p className="mt-3 text-sm text-amber-600">{webhookNote}</p> : null}
        {local ? (
          <p className="mt-3 text-sm text-zinc-500">
            Зараз APP_URL локальний. Для callback і webhook потрібен тунель і публічний HTTPS URL.
          </p>
        ) : null}
      </Card>

      {connected && accounts.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">Оберіть рахунок для донатів:</p>
          <div className="grid gap-3">
            {accounts.map((account) => {
              const active = selected === account.id;
              return (
                <button
                  key={account.id}
                  type="button"
                  disabled={pending}
                  onClick={() => chooseAccount(account.id)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-colors",
                    active ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300",
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium">{accountLabel(account)}</p>
                    <p className="font-mono text-sm text-zinc-700">{formatUah(account.balance)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {connected && accounts.length === 0 ? (
        <p className="text-sm text-zinc-500">Рахунків не знайдено.</p>
      ) : null}
    </div>
  );
}
