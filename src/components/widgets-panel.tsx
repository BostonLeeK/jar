"use client";

import { CopyField } from "@/components/copy-field";
import { ClearTestDonations } from "@/components/test-donations";
import { Button, Card, Input, Label } from "@/components/ui";
import { overlayPath } from "@/lib/urls";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function WidgetsPanel({
  token,
  appUrl,
  twitchLogin,
}: {
  token: string;
  appUrl: string;
  twitchLogin?: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [testPending, setTestPending] = useState(false);
  const origin = appUrl;
  const alertUrl = `${origin}${overlayPath(token)}`;
  const goalUrl = `${origin}${overlayPath(token, "goal")}`;
  const recentUrl = `${origin}${overlayPath(token, "recent")}`;
  const chatUrl = `${origin}${overlayPath(token, "chat")}`;

  async function rotate() {
    setPending(true);
    await fetch("/api/settings", { method: "POST" });
    setPending(false);
    router.refresh();
  }

  async function testAlert(kind?: "follow" | "sub") {
    setTestPending(true);
    if (kind) {
      await fetch("/api/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
    } else {
      await fetch("/api/donations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: "boston_fan",
          amount: 200,
          message: "запускай Condemned",
        }),
      });
    }
    setTestPending(false);
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-5">
        <CopyField label="Alert overlay" value={alertUrl} hint="Browser Source 800×400, прозорий фон, Control audio via OBS." />
        <CopyField label="Прогрес збору" value={goalUrl} hint="Browser Source 480×90." />
        <CopyField label="Останні донати" value={recentUrl} hint="Browser Source 360×280." />
        <CopyField
          label="Чат Twitch"
          value={chatUrl}
          hint={twitchLogin ? "Browser Source 350×600." : "Підключи Twitch у кабінеті, інакше чат буде порожній."}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => testAlert()} disabled={testPending}>
            {testPending ? "Надсилаю…" : "Тест донат"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => testAlert("follow")} disabled={testPending}>
            Тест фоловер
          </Button>
          <Button type="button" variant="secondary" onClick={() => testAlert("sub")} disabled={testPending}>
            Тест підписка
          </Button>
          <ClearTestDonations />
          <Button type="button" variant="secondary" onClick={rotate} disabled={pending}>
            Оновити токен
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-medium">OBS</h2>
        <ol className="mt-3 space-y-2 text-sm text-zinc-500">
          <li>1. Sources → Browser</li>
          <li>2. Встав URL віджета</li>
          <li>3. Refresh browser when scene becomes active — увімкни</li>
          <li>4. Shutdown source when not visible можна лишити вимкненим, якщо алерти зникають</li>
          <li>5. Custom CSS можна лишити порожнім</li>
        </ol>
      </Card>
    </div>
  );
}

export function TestDonateForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    await fetch("/api/donations/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: form.get("nickname"),
        amount: Number(form.get("amount")),
        message: form.get("message"),
      }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-4">
      <div>
        <Label htmlFor="nickname">Нік</Label>
        <Input id="nickname" name="nickname" defaultValue="boston_fan" />
      </div>
      <div>
        <Label htmlFor="amount">Сума</Label>
        <Input id="amount" name="amount" type="number" defaultValue={200} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="message">Повідомлення</Label>
        <Input id="message" name="message" defaultValue="запускай Condemned" />
      </div>
      <div className="flex flex-wrap gap-2 sm:col-span-4">
        <Button type="submit" disabled={pending}>
          Надіслати тест
        </Button>
        <ClearTestDonations />
      </div>
    </form>
  );
}
