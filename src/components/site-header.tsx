import { LogoMark } from "@/components/icons";
import Link from "next/link";

export function SiteHeader({ authed, marketing }: { authed?: boolean; marketing?: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-[18px] text-zinc-900">
          <LogoMark />
        </Link>
        {marketing ? (
          <nav className="hidden items-center gap-6 text-sm text-zinc-500 md:flex">
            <a href="#how" className="hover:text-zinc-900">
              Як це працює
            </a>
            <a href="#features" className="hover:text-zinc-900">
              Можливості
            </a>
            <a href="#templates" className="hover:text-zinc-900">
              Шаблони
            </a>
            <a href="#faq" className="hover:text-zinc-900">
              FAQ
            </a>
          </nav>
        ) : null}
        <nav className="flex items-center gap-2 text-sm">
          {authed ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-zinc-900 px-3 py-2 font-medium text-white hover:bg-zinc-800"
            >
              Кабінет
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-xl px-3 py-2 text-zinc-500 hover:text-zinc-900">
                Увійти
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-zinc-900 px-3 py-2 font-medium text-white hover:bg-zinc-800"
              >
                Почати безкоштовно
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
