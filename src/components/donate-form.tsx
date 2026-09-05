"use client";

import { FieldError } from "@/components/ui";
import { formatUah } from "@/lib/money";
import type { PageTheme } from "@/lib/themes";
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
  theme,
  preview,
}: {
  slug: string;
  minAmount: number;
  theme: PageTheme;
  preview?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [pay, setPay] = useState<PayInfo | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const fieldStyle = {
    background: theme.field,
    color: theme.text,
    borderColor: theme.border,
    borderRadius: theme.radius,
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview) {
      return;
    }
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
        <p className="text-sm" style={{ color: theme.muted }}>
          Перекажи рівно <span style={{ color: theme.text }}>{formatUah(pay.amount)}</span>
          {pay.jarTitle ? ` на «${pay.jarTitle}»` : ""}. Код у коментарі:{" "}
          <span className="font-mono">{pay.code}</span>
        </p>
        {qr ? <img src={qr} alt="QR на Банку" className="h-40 w-40 rounded-xl bg-white p-2" /> : null}
        <a href={pay.payUrl} target="_blank" rel="noreferrer" className="block">
          <button
            type="button"
            className="h-12 w-full text-sm font-semibold"
            style={{ background: theme.accent, color: theme.buttonText, borderRadius: theme.radius }}
          >
            Відкрити Банку
          </button>
        </a>
        <button type="button" className="text-sm" style={{ color: theme.muted }} onClick={() => setPay(null)}>
          Змінити дані
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm" style={{ color: theme.muted }}>
        Нік
        <input
          name="nickname"
          required
          minLength={2}
          maxLength={24}
          placeholder="boston_fan"
          disabled={preview}
          className="mt-1.5 h-11 w-full border px-3 text-sm outline-none"
          style={fieldStyle}
        />
      </label>
      <label className="block text-sm" style={{ color: theme.muted }}>
        Сума, ₴
        <input
          name="amount"
          type="number"
          min={minAmount / 100}
          step="1"
          required
          defaultValue={Math.max(minAmount / 100, 50)}
          disabled={preview}
          className="mt-1.5 h-11 w-full border px-3 text-sm outline-none"
          style={fieldStyle}
        />
      </label>
      <label className="block text-sm" style={{ color: theme.muted }}>
        Повідомлення
        <textarea
          name="message"
          maxLength={180}
          placeholder="запускай Condemned"
          disabled={preview}
          className="mt-1.5 min-h-24 w-full border px-3 py-2 text-sm outline-none"
          style={fieldStyle}
        />
      </label>
      <FieldError>{error}</FieldError>
      <button
        type="submit"
        disabled={pending || preview}
        className="h-12 w-full text-sm font-semibold disabled:opacity-50"
        style={{ background: theme.accent, color: theme.buttonText, borderRadius: theme.radius }}
      >
        {pending ? "Готую…" : "Підтримати донатом"}
      </button>
    </form>
  );
}
