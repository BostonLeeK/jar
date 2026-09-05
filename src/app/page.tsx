import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/user";
import Link from "next/link";

const STEPS = [
  { n: "01", title: "Реєстрація", text: "Створи акаунт і кастомну сторінку донатів." },
  { n: "02", title: "Банка", text: "Встав Personal API токен і обери банку." },
  { n: "03", title: "OBS", text: "Додай Browser Source — алерти приходять з webhook." },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="relative flex min-h-full flex-col">
      <div className="pointer-events-none absolute inset-0 grid-fade" />
      <SiteHeader authed={Boolean(user)} />
      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-24 pt-16">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Monobank · Twitch · OBS</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-medium leading-[1.05] tracking-tight sm:text-7xl">
          Донати з Банки.
          <br />
          Без комісії сервісу.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-500">
          Сторінка з ніком і повідомленням, webhook Monobank і свої віджети для OBS. Стиль — як тобі треба.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="inline-flex h-10 items-center rounded-md bg-white px-4 text-sm font-medium text-black hover:bg-zinc-200"
          >
            {user ? "Відкрити кабінет" : "Створити сторінку"}
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-md border border-white/10 px-4 text-sm text-zinc-300 hover:bg-white/5"
          >
            У мене вже є акаунт
          </Link>
        </div>
        <div className="mt-20 grid gap-px overflow-hidden rounded-xl border border-white/8 bg-white/8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="bg-black p-5">
              <p className="font-mono text-xs text-zinc-600">{step.n}</p>
              <h2 className="mt-3 text-sm font-medium">{step.title}</h2>
              <p className="mt-1 text-sm text-zinc-500">{step.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
