import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-6">
      <p className="font-mono text-xs text-zinc-600">404</p>
      <h1 className="mt-3 text-2xl font-medium tracking-tight">Немає такої сторінки</h1>
      <Link href="/" className="mt-6 text-sm text-zinc-400 hover:text-white">
        На головну
      </Link>
    </main>
  );
}
