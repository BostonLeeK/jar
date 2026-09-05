"use client";

import { CopyField } from "@/components/copy-field";
import { Button, Card, Input, Label } from "@/components/ui";
import { overlayPath } from "@/lib/urls";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function WidgetsPanel({
  token,
  appUrl,
}: {
  token: string;
  appUrl: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [testPending, setTestPending] = useState(false);
  const origin = appUrl;
  const alertUrl = `${origin}${overlayPath(token)}`;
  const goalUrl = `${origin}${overlayPath(token, "goal")}`;
  const recentUrl = `${origin}${overlayPath(token, "recent")}`;

  async function rotate() {
    setPending(true);
    await fetch("/api/settings", { method: "POST" });
    setPending(false);
    router.refresh();
  }

  async function testAlert() {
    setTestPending(true);
    await fetch("/api/donations/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: "boston_fan",
        amount: 200,
        message: "запускай Condemned",
      }),
    });
    setTestPending(false);
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-5">
        <CopyField label="Alert overlay" value={alertUrl} hint="Browser Source 800×200, прозорий фон." />
        <CopyField label="Прогрес збору" value={goalUrl} hint="Browser Source 480×90." />
        <CopyField label="Останні донати" value={recentUrl} hint="Browser Source 360×280." />
        <div className="flex gap-2">
          <Button type="button" onClick={testAlert} disabled={testPending}>
            {testPending ? "Надсилаю…" : "Тестовий алерт"}
          </Button>
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
          <li>3. Увімкни Shutdown source when not visible</li>
          <li>4. Refresh browser when scene becomes active</li>
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
      <Button type="submit" className="sm:col-span-4 w-fit" disabled={pending}>
        Надіслати тест
      </Button>
    </form>
  );
}
