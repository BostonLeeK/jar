"use client";

import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Огляд" },
  { href: "/dashboard/mono", label: "Monobank" },
  { href: "/dashboard/twitch", label: "Twitch" },
  { href: "/dashboard/customize", label: "Сторінка" },
  { href: "/dashboard/widgets", label: "OBS" },
];

export function DashboardNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex shrink-0 flex-col border-b border-white/8 px-4 py-4 md:w-56 md:border-b-0 md:border-r md:py-6">
      <div className="mb-4 flex items-center justify-between md:mb-8">
        <Link href="/" className="px-2 text-sm font-medium tracking-tight">
          jar<span className="text-zinc-500">.</span>
        </Link>
        <div className="md:hidden">
          <LogoutButton className="w-auto" />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto md:flex-1 md:flex-col">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "whitespace-nowrap rounded-md px-2 py-1.5 text-sm transition-colors",
                active ? "bg-white/8 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-white",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 hidden border-t border-white/8 pt-4 md:block">
        <p className="truncate px-2 text-xs text-zinc-500">{email}</p>
        <LogoutButton />
      </div>
    </aside>
  );
}
