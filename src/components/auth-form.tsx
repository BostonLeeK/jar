"use client";

import { Button, FieldError, Input, Label } from "@/components/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const res = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
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
        <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={8} />
      </div>
      <FieldError>{error}</FieldError>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Зачекай…" : isRegister ? "Створити акаунт" : "Увійти"}
      </Button>
      <p className="text-center text-sm text-zinc-500">
        {isRegister ? "Вже є акаунт?" : "Немає акаунта?"}{" "}
        <Link href={isRegister ? "/login" : "/register"} className="text-white hover:underline">
          {isRegister ? "Увійти" : "Зареєструватись"}
        </Link>
      </p>
    </form>
  );
}
