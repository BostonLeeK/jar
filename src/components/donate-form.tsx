"use client";

import { Button, FieldError, Input, Label, Textarea } from "@/components/ui";
import { formatUah } from "@/lib/money";
import QRCode from "qrcode";
import { useState } from "react";

type PayInfo = {
  code: string;
  amount: number;
  payUrl: string;
  jarTitle: string | null;
};

export function DonateForm({
  slug,
  minAmount,
  accent,
  background,
}: {
  slug: string;
  minAmount: number;
  accent: string;
  background: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [pay, setPay] = useState<PayInfo | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const res = await fetch(`/api/donate/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: form.get("nickname"),
        amount: Number(form.get("amount")),
        message: form.get("message"),
      }),
    });
    const data = (await res.json()) as PayInfo & { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Не вдалося створити донат");
      return;
    }
    setPay(data);
    setQr(await QRCode.toDataURL(data.payUrl, { margin: 1, width: 240, color: { dark: "#000000", light: "#ffffff" } }));
  }

  if (pay) {
    return (
      <div className="space-y-4">
        <p className="text-sm opacity-70">
          Перекажи рівно <span className="font-medium">{formatUah(pay.amount)}</span>
          {pay.jarTitle ? ` на «${pay.jarTitle}»` : ""}. Якщо в коментарі буде код{" "}
          <span className="font-mono">{pay.code}</span> — нік підхопиться гарантовано.
        </p>
        {qr ? <img src={qr} alt="QR на Банку" className="h-44 w-44 rounded-md bg-white p-2" /> : null}
        <a href={pay.payUrl} target="_blank" rel="noreferrer">
          <Button type="button" className="w-full" style={{ background: accent, color: background }}>
            Відкрити Банку
          </Button>
        </a>
        <button type="button" className="text-sm opacity-60 hover:opacity-100" onClick={() => setPay(null)}>
          Змінити дані
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label htmlFor="nickname" className="opacity-60">
          Нік
        </Label>
        <Input id="nickname" name="nickname" required minLength={2} maxLength={24} placeholder="boston_fan" />
      </div>
      <div>
        <Label htmlFor="amount" className="opacity-60">
          Сума, ₴
        </Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min={minAmount / 100}
          step="1"
          required
          defaultValue={Math.max(minAmount / 100, 50)}
        />
      </div>
      <div>
        <Label htmlFor="message" className="opacity-60">
          Повідомлення
        </Label>
        <Textarea id="message" name="message" maxLength={180} placeholder="запускай Condemned" />
      </div>
      <FieldError>{error}</FieldError>
      <Button type="submit" className="w-full" disabled={pending} style={{ background: accent, color: background }}>
        {pending ? "Готую…" : "Далі до оплати"}
      </Button>
    </form>
  );
}
