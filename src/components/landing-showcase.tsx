"use client";

import {
  IconBolt,
  IconChart,
  IconGrip,
  IconHeart,
  IconPage,
  IconShare,
  IconUser,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { SiTwitch } from "react-icons/si";

const GOAL = 25000;

const SAMPLES = [
  { nick: "boston_fan", amount: 200, message: "запускай Condemned" },
  { nick: "viewer", amount: 100, message: "красунчик" },
  { nick: "lurker", amount: 150, message: "привіт чат" },
];

function money(value: number) {
  return `${value.toLocaleString("uk-UA")} ₴`;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function useDemoStream(reduced: boolean) {
  const [index, setIndex] = useState(0);
  const [raised, setRaised] = useState(12340);
  const [donations, setDonations] = useState(24);
  const [views, setViews] = useState(186);
  const [feed, setFeed] = useState(SAMPLES.slice(0, 2));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reduced) {
      return;
    }
    const tick = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => {
          const next = (current + 1) % SAMPLES.length;
          const item = SAMPLES[next];
          setRaised((value) => Math.min(GOAL, value + item.amount));
          setDonations((value) => value + 1);
          setViews((value) => value + 3);
          setFeed((prev) => [item, ...prev].slice(0, 2));
          return next;
        });
        setVisible(true);
      }, 260);
    }, 3400);
    return () => window.clearInterval(tick);
  }, [reduced]);

  return { current: SAMPLES[index], raised, donations, views, feed, visible };
}

function Note({ className, tilt, children }: { className?: string; tilt?: number; children: ReactNode }) {
  return (
    <p
      className={cn(
        "landing-motion font-[family-name:var(--font-caveat)] text-[22px] leading-none text-violet-600",
        className,
      )}
      style={{ "--note-tilt": `${tilt ?? 6}deg`, animation: "floatNote 4.5s ease-in-out infinite" } as CSSProperties}
    >
      {children}
    </p>
  );
}

function Toggle({ on }: { on?: boolean }) {
  return (
    <span className={cn("relative h-4 w-7 rounded-full transition-colors", on ? "bg-violet-500" : "bg-zinc-200")}>
      <span
        className={cn(
          "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all",
          on ? "right-0.5" : "left-0.5",
        )}
      />
    </span>
  );
}

function PhoneFrame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "w-[220px] overflow-hidden rounded-[28px] border-[6px] border-zinc-900 bg-[#12081c] shadow-2xl shadow-violet-900/20",
        className,
      )}
    >
      <div className="mx-auto mt-1.5 h-1 w-10 rounded-full bg-white/20" />
      {children}
    </div>
  );
}

function DonatePhone({
  raised = 12340,
  recents = SAMPLES.slice(0, 2),
  highlight,
}: {
  raised?: number;
  recents?: Array<{ nick: string; amount: number }>;
  highlight?: string;
}) {
  const progress = Math.min(100, Math.round((raised / GOAL) * 100));
  return (
    <PhoneFrame>
      <div className="px-4 pb-5 pt-4 text-white">
        <div className={cn("flex items-center gap-2 rounded-xl p-1", highlight === "header" && "ring-2 ring-violet-400")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500 text-sm font-semibold">
            B
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">boston</p>
            <p className="text-[10px] text-white/50">/d/boston</p>
          </div>
        </div>
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 rounded-full px-1.5 py-0.5 text-[10px] text-white/70",
            highlight === "social" && "ring-2 ring-violet-400",
          )}
        >
          <SiTwitch className="h-3.5 w-3.5" />
          Twitch
        </div>
        <div className={cn("mt-4 rounded-xl p-1", highlight === "goal" && "ring-2 ring-violet-400")}>
          <div className="mb-1 flex justify-between text-[10px] text-white/55">
            <span>{money(raised)}</span>
            <span>{money(GOAL)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-violet-400 transition-[width] duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div
          className={cn(
            "mt-4 rounded-xl bg-violet-500 py-2.5 text-center text-xs font-medium transition-transform",
            highlight === "donate" && "ring-2 ring-white/70",
          )}
        >
          Підтримати донатом
        </div>
        <div className={cn("mt-4 space-y-2 rounded-xl p-1", highlight === "recent" && "ring-2 ring-violet-400")}>
          {recents.map((item, index) => (
            <div key={`${item.nick}-${index}`} className="flex items-center justify-between text-[11px]">
              <span className="text-white/80">{item.nick}</span>
              <span className="font-medium">{money(item.amount)}</span>
            </div>
          ))}
        </div>
        {highlight === "about" ? (
          <p className="mt-3 rounded-xl px-1 text-[10px] text-white/55 ring-2 ring-violet-400">More good games</p>
        ) : null}
      </div>
    </PhoneFrame>
  );
}

export function LandingHeroVisual() {
  const reduced = usePrefersReducedMotion();
  const demo = useDemoStream(reduced);
  const progress = Math.min(100, Math.round((demo.raised / GOAL) * 100));

  return (
    <div className="relative mx-auto w-full max-w-[640px] sm:pr-[196px] sm:pb-10">
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-violet-200/50">
        <div className="flex items-center gap-1.5 border-b border-zinc-100 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-zinc-200" />
          <span className="h-2 w-2 rounded-full bg-zinc-200" />
          <span className="h-2 w-2 rounded-full bg-zinc-200" />
          <span className="ml-2 truncate text-[10px] text-zinc-400">jar.tobto.dev/dashboard</span>
        </div>
        <div className="grid grid-cols-[76px_1fr] sm:grid-cols-[88px_1fr]">
          <div className="space-y-1.5 border-r border-zinc-100 bg-zinc-50 px-1.5 py-3 sm:px-2">
            {["Панель", "Звʼязки", "Віджети", "Сторінка", "Аналітика"].map((label, index) => (
              <div
                key={label}
                className={cn(
                  "rounded-lg px-1.5 py-1.5 text-[10px] sm:px-2",
                  index === 2 ? "bg-zinc-900 font-medium text-white" : "text-zinc-500",
                )}
              >
                {label}
              </div>
            ))}
          </div>
          <div className="space-y-3 p-3">
            <p className="text-sm font-semibold">Привіт, boston!</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                ["Перегляди", String(demo.views)],
                ["Донати", String(demo.donations)],
                ["Зібрано", money(demo.raised)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-zinc-50 px-2 py-2">
                  <p className="text-[9px] text-zinc-400">{label}</p>
                  <p className="text-sm font-semibold tabular-nums">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-zinc-100 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium">Банка Monobank</p>
                <span className="landing-motion shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-700 [animation:livePing_2s_ease_infinite]">
                  Підключено
                </span>
              </div>
              <p className="mt-1 text-[10px] text-zinc-400">Донати на стрім · {money(demo.raised)} / {money(GOAL)}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-violet-500 transition-[width] duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div
              className={cn(
                "rounded-xl bg-zinc-950 p-3 text-white",
                demo.visible && !reduced && "landing-motion [animation:alertPop_0.45s_ease]",
              )}
            >
              <div className="landing-motion mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 [animation:heartBeat_1.6s_ease-in-out_infinite]">
                <IconHeart className="h-3.5 w-3.5" />
              </div>
              <p className="text-[10px] text-zinc-400">Новий донат</p>
              <p className="mt-0.5 text-xs font-medium">
                {demo.current.nick} — {money(demo.current.amount)}
              </p>
              <p className="mt-1 text-[10px] text-zinc-500">{demo.current.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-xl border border-zinc-100 px-2.5 py-2">
              {[
                ["Звук", true],
                ["Імʼя", true],
                ["Сума", true],
                ["Меседж", true],
              ].map(([label, on]) => (
                <div key={String(label)} className="flex items-center justify-between text-[10px] text-zinc-600">
                  <span>{label}</span>
                  <Toggle on={Boolean(on)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center sm:absolute sm:-right-1 sm:top-14 sm:mt-0 sm:rotate-2 lg:-right-2">
        <div className="landing-motion [animation:floatSoft_5s_ease-in-out_infinite]">
          <DonatePhone raised={demo.raised} recents={demo.feed} />
        </div>
      </div>
      <Note className="absolute -top-1 right-0 hidden sm:block" tilt={6}>
        Все під контролем
      </Note>
      <Note className="absolute bottom-0 left-2 hidden sm:block" tilt={-3}>
        Добре виглядає на телефоні
      </Note>
    </div>
  );
}

const BLOCKS = [
  { id: "header", title: "Аватар і шапка", icon: IconUser },
  { id: "goal", title: "Прогрес збору", icon: IconChart },
  { id: "donate", title: "Кнопка донату", icon: IconHeart },
  { id: "recent", title: "Останні донати", icon: IconBolt },
  { id: "about", title: "Про себе", icon: IconPage },
  { id: "social", title: "Соцмережі", icon: IconShare },
];

const PAGE = ["header", "goal", "donate", "about", "recent"] as const;

export function LandingBuilder() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState<string>("goal");
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (reduced || locked) {
      return;
    }
    const timer = window.setInterval(() => {
      setActive((current) => {
        const index = PAGE.indexOf(current as (typeof PAGE)[number]);
        return PAGE[(index + 1 + PAGE.length) % PAGE.length];
      });
    }, 3200);
    return () => window.clearInterval(timer);
  }, [locked, reduced]);

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_0.9fr_0.85fr]">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <p className="text-sm font-medium">Блоки</p>
        <div className="mt-3 space-y-2">
          {BLOCKS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActive(item.id);
                  setLocked(true);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-300",
                  active === item.id
                    ? "border-violet-200 bg-violet-50 text-zinc-900"
                    : "border-zinc-100 text-zinc-600 hover:border-zinc-200",
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1">{item.title}</span>
                <IconGrip className="h-4 w-4 text-zinc-300" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <p className="text-sm font-medium">Твоя сторінка</p>
        <div className="mt-3 space-y-2">
          {PAGE.map((id, index) => {
            const item = BLOCKS.find((block) => block.id === id);
            if (!item) {
              return null;
            }
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActive(id);
                  setLocked(true);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-300",
                  active === id ? "border-violet-300 bg-violet-50" : "border-dashed border-zinc-200",
                )}
              >
                <span className="w-4 text-xs text-zinc-400">{index + 1}</span>
                <span className="flex-1">{item.title}</span>
                <IconGrip className="h-4 w-4 text-zinc-300" />
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center text-sm text-violet-600">+ Додати блок</p>
      </div>

      <div className="relative flex flex-col items-center rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <p className="mb-4 self-start text-sm font-medium">Превʼю</p>
        <DonatePhone highlight={active} />
        <Note className="absolute right-4 top-16 hidden xl:block" tilt={6}>
          Збирай як хочеш
        </Note>
        <p className="mt-4 text-center text-xs text-zinc-500">
          {BLOCKS.find((item) => item.id === active)?.title}
        </p>
      </div>
    </div>
  );
}
