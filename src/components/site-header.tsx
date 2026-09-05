import Link from "next/link";

export function SiteHeader({ authed }: { authed?: boolean }) {
  return (
    <header className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
      <Link href="/" className="text-sm font-medium tracking-tight">
        jar<span className="text-zinc-500">.</span>
      </Link>
      <nav className="flex items-center gap-2 text-sm">
        {authed ? (
          <Link
            href="/dashboard"
            className="rounded-md bg-white px-3 py-1.5 font-medium text-black hover:bg-zinc-200"
          >
            Кабінет
          </Link>
        ) : (
          <>
            <Link href="/login" className="rounded-md px-3 py-1.5 text-zinc-400 hover:text-white">
              Увійти
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-white px-3 py-1.5 font-medium text-black hover:bg-zinc-200"
            >
              Почати
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
