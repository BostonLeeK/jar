import { LogoMark } from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/user";
import Link from "next/link";

const STEPS = [
  { n: "01", title: "Підключи Банку", text: "Токен з api.monobank.ua і вибір банки. Webhook ставиться сам." },
  { n: "02", title: "Налаштуй віджети", text: "Три Browser Source для OBS: алерт, прогрес і останні донати." },
  { n: "03", title: "Запусти сторінку", text: "Глядач вводить нік і меседж, платить у Банку — алерт летить на стрім." },
];

const FEATURES = [
  { title: "Готові віджети", text: "Overlay для OBS з прозорим фоном. Тестовий алерт без справжнього переказу." },
  { title: "Шаблони сторінки", text: "Midnight, Aurora, Violet, Paper і Mono. Превʼю одразу як жива сторінка." },
  { title: "Свій лінк", text: "Короткий URL /d/твій-нік. QR і посилання на Банку після форми." },
  { title: "Аналітика", text: "Перегляди, донати, сума, конверсія і графік по днях." },
];

const FAQ = [
  {
    q: "Яка комісія?",
    a: "Jar нічого не бере. Поповнення Банки з української картки в Mono без комісії сервісу.",
  },
  {
    q: "Чи потрібен ФОП?",
    a: "Ні. Працюємо через особисту Банку і Personal API. ФОП потрібен лише для mono База.",
  },
  {
    q: "Звідки нік донатора?",
    a: "З твоєї сторінки. Глядач вводить нік і меседж, ми матчимо платіж по сумі або коду в коментарі.",
  },
  {
    q: "OBS як підключити?",
    a: "Кабінет → Віджети → скопіюй URL → Sources → Browser. Прозорий фон, ширина 800×200 для алерту.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const startHref = user ? "/dashboard" : "/register";

  return (
    <div className="min-h-dvh bg-white text-zinc-900">
      <SiteHeader authed={Boolean(user)} marketing />

      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div>
          <p className="text-sm font-medium text-violet-600">Monobank · Twitch · OBS</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            Підключи Банку і приймай донати вже сьогодні
          </h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-500">
            Сторінка донатів, webhook Monobank і свої віджети для стріму. Без комісії сервісу.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={startHref}
              className="inline-flex h-12 items-center rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              {user ? "Відкрити кабінет" : "Почати безкоштовно"}
            </Link>
            <a
              href="#how"
              className="inline-flex h-12 items-center rounded-xl border border-zinc-200 px-5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Як це працює
            </a>
          </div>
          <ul className="mt-8 space-y-2 text-sm text-zinc-500">
            <li>Без комісії Jar</li>
            <li>Готові шаблони сторінки</li>
            <li>Алерти в OBS за пару хвилин</li>
          </ul>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 shadow-xl shadow-zinc-200/70">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs text-zinc-400">Панель</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {["Донати", "Зібрано", "Перегляди"].map((label, index) => (
                  <div key={label} className="rounded-xl bg-zinc-50 p-3">
                    <p className="text-[11px] text-zinc-400">{label}</p>
                    <p className="mt-1 text-lg font-semibold">{["24", "4 200 ₴", "186"][index]}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-zinc-900 p-4 text-white">
                <p className="text-xs text-zinc-400">Новий донат</p>
                <p className="mt-1 text-sm font-medium">boston_fan — 200 ₴</p>
                <p className="mt-1 text-xs text-zinc-400">запускай Condemned</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-8 -left-4 hidden w-48 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg sm:block">
            <p className="text-xs text-zinc-400">Сторінка</p>
            <p className="mt-1 text-sm font-medium">jar.tobto.dev/d/boston</p>
            <div className="mt-3 h-1.5 rounded-full bg-zinc-100">
              <div className="h-full w-2/5 rounded-full bg-violet-500" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-100 bg-zinc-50 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-6 text-sm text-zinc-400">
          <span>Twitch</span>
          <span>OBS</span>
          <span>Monobank</span>
        </div>
      </section>

      <section id="how" className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-semibold tracking-tight">Як це працює?</h2>
        <p className="mt-3 max-w-2xl text-zinc-500">Три кроки. Без посередників і без відсотка з донату.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="rounded-2xl border border-zinc-200 bg-white p-6">
              <p className="text-sm font-medium text-violet-600">{step.n}</p>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-zinc-50 py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="text-3xl font-semibold tracking-tight">Більше, ніж просто донат</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {FEATURES.map((item) => (
              <div key={item.title} className="rounded-2xl border border-zinc-200 bg-white p-6">
                <div className="h-9 w-9 rounded-xl bg-violet-50" />
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-semibold tracking-tight">Шаблони сторінки</h2>
        <p className="mt-3 max-w-2xl text-zinc-500">
          Не конструктор з нуля — готові дизайни. Обрав шаблон, написав текст, зберег.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-5">
          {[
            { name: "Midnight", bg: "#0b0d12", accent: "#fff" },
            { name: "Aurora", bg: "#070814", accent: "#7cffb2" },
            { name: "Violet", bg: "#0e0e10", accent: "#bf94ff" },
            { name: "Paper", bg: "#f4efe6", accent: "#1b1713" },
            { name: "Mono", bg: "#000", accent: "#fff" },
          ].map((item) => (
            <div key={item.name} className="overflow-hidden rounded-2xl border border-zinc-200">
              <div className="flex h-28 items-end p-3" style={{ background: item.bg }}>
                <div className="h-8 w-full" style={{ background: item.accent, borderRadius: 10 }} />
              </div>
              <p className="px-3 py-2 text-sm font-medium">{item.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="bg-zinc-50 py-20">
        <div className="mx-auto w-full max-w-3xl px-6">
          <h2 className="text-3xl font-semibold tracking-tight">Питання</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-2xl border border-zinc-200 bg-white p-5">
                <h3 className="font-medium">{item.q}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="rounded-3xl bg-zinc-900 px-8 py-14 text-white md:px-14">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight">Зроби свою сторінку за вечір</h2>
          <p className="mt-3 max-w-lg text-zinc-400">Банка, шаблон, віджет у OBS. Donatello не потрібен.</p>
          <Link
            href={startHref}
            className="mt-8 inline-flex h-12 items-center rounded-xl bg-white px-5 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
          >
            {user ? "До кабінету" : "Почати безкоштовно"}
          </Link>
        </div>
      </section>

      <footer className="border-t border-zinc-100 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-zinc-400">
          <Link href="/" className="text-[16px] text-zinc-900">
            <LogoMark />
          </Link>
          <p>Для стрімів з Банкою</p>
        </div>
      </footer>
    </div>
  );
}
