import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6">
      <style>{`html,body{background:#fff!important;min-height:100dvh;}`}</style>
      <p className="font-mono text-xs text-zinc-600">404</p>
      <h1 className="mt-3 text-2xl font-medium tracking-tight">Немає такої сторінки</h1>
      <Link href="/" className="mt-6 text-sm text-zinc-500 hover:text-zinc-900">
        На головну
      </Link>
    </main>
  );
}
