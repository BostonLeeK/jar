"use client";

import { Button, FieldError, Input, Label } from "@/components/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({
  mode,
  googleEnabled,
  error: initialError,
}: {
  mode: "login" | "register";
  googleEnabled?: boolean;
  error?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (isRegister && password !== confirm) {
      setError("Паролі не збігаються");
      return;
    }
    setPending(true);
    const res = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password,
        confirm,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Щось пішло не так");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {googleEnabled ? (
        <>
          <a
            href="/api/auth/google/start"
            className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-800 transition-all duration-150 hover:-translate-y-px hover:bg-zinc-50 hover:shadow-sm active:translate-y-0"
          >
            <GoogleMark />
            Продовжити з Google
          </a>
          <p className="text-center text-xs text-zinc-400">або</p>
        </>
      ) : null}
      <form onSubmit={onSubmit} className="space-y-4">
        {isRegister ? (
          <div>
            <Label htmlFor="name">Імʼя на стрімі</Label>
            <Input id="name" name="name" placeholder="boston" required minLength={2} />
          </div>
        ) : null}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@stream.ua" required />
        </div>
        <div>
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={isRegister ? 8 : undefined}
          />
        </div>
        {isRegister ? (
          <div>
            <Label htmlFor="confirm">Підтвердження пароля</Label>
            <Input id="confirm" name="confirm" type="password" placeholder="••••••••" required minLength={8} />
          </div>
        ) : null}
        <FieldError>{error}</FieldError>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Зачекай…" : isRegister ? "Створити акаунт" : "Увійти"}
        </Button>
        <p className="text-center text-sm text-zinc-500">
          {isRegister ? "Вже є акаунт?" : "Немає акаунта?"}{" "}
          <Link href={isRegister ? "/login" : "/register"} className="cursor-pointer text-zinc-900 hover:underline">
            {isRegister ? "Увійти" : "Зареєструватись"}
          </Link>
        </p>
      </form>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.2 2.8-2.6 3.6v3h4.2c2.5-2.3 3.9-5.7 3.9-8.7z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1 7.9-2.9l-4.2-3c-1.1.8-2.6 1.2-3.7 1.2-2.9 0-5.3-1.9-6.2-4.6H1.5v3.1C3.5 21.5 7.5 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.8 14.7c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V7.2H1.5C.5 9.1 0 10.5 0 12.5s.5 3.4 1.5 5.3l4.3-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.5 1.5 6.2l4.3 3.1C6.7 6.6 9.1 4.8 12 4.8z"
      />
    </svg>
  );
}
