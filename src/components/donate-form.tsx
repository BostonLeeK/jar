"use client";

import { FieldError } from "@/components/ui";
import { formatUah } from "@/lib/money";
import type { PageTheme } from "@/lib/themes";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

type PayInfo = {
  id: string;
  code: string;
  amount: number;
  payUrl: string;
  jarTitle: string | null;
};

type PayStatus = {
  status: "waiting" | "paid" | "expired" | "missing";
  amount?: number;
  nickname?: string;
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
  const [thanks, setThanks] = useState<PayStatus | null>(null);
  const [expired, setExpired] = useState(false);
  const fieldStyle = {
    background: theme.field,
    color: theme.text,
    borderColor: theme.border,
    borderRadius: theme.radius,
  };

  useEffect(() => {
    if (!pay || preview || thanks || expired) {
      return;
    }
    const payId = pay.id;
    let active = true;
    async function tick() {
      const res = await fetch(`/api/donate/${slug}/status?id=${encodeURIComponent(payId)}`, { cache: "no-store" });
      if (!res.ok || !active) {
        return;
      }
      const data = (await res.json()) as PayStatus;
      if (data.status === "paid") {
        setThanks(data);
      }
      if (data.status === "expired" || data.status === "missing") {
        setExpired(true);
      }
    }
    tick();
    const timer = window.setInterval(tick, 2500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [expired, pay, preview, slug, thanks]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview) {
      return;
    }
    setPending(true);
    setError(null);
    setThanks(null);
    setExpired(false);
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
    window.open(data.payUrl, "_blank", "noopener,noreferrer");
  }

  function reset() {
    setPay(null);
    setQr(null);
    setThanks(null);
    setExpired(false);
    setError(null);
  }

  if (thanks) {
    return (
      <div className="space-y-4">
        <p className="text-xl font-semibold tracking-tight" style={{ color: theme.text }}>
          Дякуємо{thanks.nickname ? `, ${thanks.nickname}` : ""}!
        </p>
        <p className="text-sm" style={{ color: theme.muted }}>
          {formatUah(thanks.amount ?? pay?.amount ?? 0)} уже на Банці і на стрімі.
        </p>
        <button
          type="button"
          className="h-12 w-full text-sm font-semibold transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: theme.accent, color: theme.buttonText, borderRadius: theme.radius }}
          onClick={reset}
        >
          Надіслати ще
        </button>
      </div>
    );
  }

  if (pay) {
    return (
      <div className="space-y-4">
        <p className="text-sm" style={{ color: theme.muted }}>
          Сума і коментар уже в посиланні
          {pay.jarTitle ? ` на «${pay.jarTitle}»` : ""}. Підтверди платіж у Банці.
        </p>
        <p className="text-sm" style={{ color: theme.text }}>
          {formatUah(pay.amount)}
          <span className="mx-2" style={{ color: theme.muted }}>
            ·
          </span>
          <span className="font-mono">{pay.code}</span>
        </p>
        {qr ? <img src={qr} alt="QR на Банку" className="h-40 w-40 rounded-xl bg-white p-2" /> : null}
        <a href={pay.payUrl} target="_blank" rel="noreferrer" className="block">
          <button
            type="button"
            className="h-12 w-full text-sm font-semibold transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: theme.accent, color: theme.buttonText, borderRadius: theme.radius }}
          >
            Відкрити Банку
          </button>
        </a>
        <p className="text-xs" style={{ color: theme.muted }}>
          {expired
            ? "Час на цей код вийшов. Зміни дані і спробуй ще раз."
            : `Чекаємо оплату. Якщо поля порожні — перекажи рівно ${formatUah(pay.amount)} і вкажи код ${pay.code} у коментарі.`}
        </p>
        <button type="button" className="text-sm transition-opacity hover:opacity-80" style={{ color: theme.muted }} onClick={reset}>
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
        className="h-12 w-full text-sm font-semibold transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        style={{ background: theme.accent, color: theme.buttonText, borderRadius: theme.radius }}
      >
        {pending ? "Готую…" : "Підтримати донатом"}
      </button>
    </form>
  );
}
