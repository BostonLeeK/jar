import { LogoMark } from "@/components/icons";
import { CreatorGallery, CreatorProof } from "@/components/landing-creators";
import { LANDING_FEATURES, LANDING_STEPS, LANDING_TRUST } from "@/components/landing-data";
import { LandingBuilder, LandingHeroVisual } from "@/components/landing-showcase";
import { SiteHeader } from "@/components/site-header";
import { getLandingCreators } from "@/lib/creators";
import { getCurrentUser } from "@/lib/user";
import Link from "next/link";
import { SiTwitch } from "react-icons/si";

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
    a: "Кабінет → Віджети → скопіюй URL → Sources → Browser. Прозорий фон, Width/Height як на стрімі, Scale 100%, Control audio via OBS.",
  },
];

export default async function HomePage() {
  const [user, { count, creators }] = await Promise.all([getCurrentUser(), getLandingCreators()]);
  const startHref = user ? "/dashboard" : "/register";

  return (
    <div className="min-h-dvh bg-white text-zinc-900">
      <style>{`html,body{background:#fff!important;min-height:100dvh;}`}</style>
      <SiteHeader authed={Boolean(user)} marketing />

      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(124,58,237,0.07)_1px,transparent_0)] bg-[size:20px_20px]" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[0.86fr_1.14fr] lg:py-20">
          <div>
            <p className="landing-motion text-sm font-medium text-violet-600 [animation:riseIn_0.6s_ease]">
              Monobank · Twitch · OBS
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              Підключи Банку і приймай донати вже сьогодні
            </h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-500">
              Сторінка донатів, webhook Monobank і свої віджети для стріму. Без комісії сервісу.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={startHref}
                className="inline-flex h-12 items-center rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-zinc-800 hover:shadow-sm"
              >
                {user ? "Відкрити кабінет" : "Почати безкоштовно"}
              </Link>
              <a
                href="#how"
                className="inline-flex h-12 items-center rounded-xl border border-zinc-200 px-5 text-sm text-zinc-700 transition-all duration-150 hover:-translate-y-px hover:bg-zinc-50 hover:shadow-sm"
              >
                Як це працює
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
              {LANDING_TRUST.map((item) => {
                const Icon = item.icon;
                return (
                  <span key={item.title} className="inline-flex items-center gap-1.5">
                    <Icon className="h-4 w-4 text-violet-600" />
                    {item.title}
                  </span>
                );
              })}
            </div>
            <CreatorProof count={count} creators={creators} />
          </div>
          <LandingHeroVisual />
        </div>
      </section>

      <section className="border-y border-zinc-100 bg-zinc-50 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-6 text-sm text-zinc-400">
          <span className="inline-flex items-center gap-2">
            <SiTwitch className="landing-motion h-4 w-4 [animation:heartBeat_2.4s_ease-in-out_infinite]" />
            Twitch
          </span>
          <span>OBS</span>
          <span>Monobank</span>
          <span className="text-zinc-300">·</span>
          <span>Чат і алерти зі стріму</span>
        </div>
      </section>

      <CreatorGallery count={count} creators={creators} startHref={startHref} />

      <section id="how" className="mx-auto w-full max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-semibold tracking-tight">Як це працює?</h2>
        <p className="mt-3 max-w-2xl text-zinc-500">Три кроки. Без посередників і без відсотка з донату.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {LANDING_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="landing-motion rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                style={{ animation: `riseIn 0.55s ease ${index * 90}ms both` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-medium text-violet-600">0{index + 1}</p>
                <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{step.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="features" className="bg-zinc-50 py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="text-3xl font-semibold tracking-tight">Більше, ніж просто донат</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {LANDING_FEATURES.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="landing-motion rounded-2xl border border-violet-100 bg-violet-50/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  style={{ animation: `riseIn 0.55s ease ${index * 80}ms both` }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="builder" className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">Конструктор сторінки</h2>
          <p className="mt-3 text-zinc-500">
            Збери сторінку з блоків і одразу подивись, як вона виглядає. Є готові шаблони — і ручний режим, якщо хочеш
            свій HTML.
          </p>
        </div>
        <div className="mt-10">
          <LandingBuilder />
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
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 px-8 py-14 text-white md:px-14">
          <div className="landing-motion pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-violet-500/30 blur-3xl [animation:blobDrift_8s_ease-in-out_infinite]" />
          <div className="landing-motion pointer-events-none absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-fuchsia-400/20 blur-2xl [animation:blobDrift_10s_ease-in-out_infinite_reverse]" />
          <h2 className="relative max-w-xl text-3xl font-semibold tracking-tight">Зроби свою сторінку за вечір</h2>
          <p className="relative mt-3 max-w-lg text-zinc-400">Банка, шаблон, віджет у OBS. Історія стартує з твого лінка.</p>
          <Link
            href={startHref}
            className="relative mt-8 inline-flex h-12 items-center rounded-xl bg-white px-5 text-sm font-medium text-zinc-900 transition-all duration-150 hover:-translate-y-px hover:bg-zinc-100 hover:shadow-sm"
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
          <p>Зроблено з любовʼю для стрімів України</p>
        </div>
      </footer>
    </div>
  );
}
