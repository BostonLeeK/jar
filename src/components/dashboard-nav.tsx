"use client";

import {
  IconAsset,
  IconChart,
  IconHome,
  IconPage,
  IconPlug,
  IconSettings,
  IconWidget,
  LogoMark,
} from "@/components/icons";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Панель керування", icon: IconHome, exact: true },
  { href: "/dashboard/connections", label: "Підключення", icon: IconPlug },
  { href: "/dashboard/widgets", label: "Віджети", icon: IconWidget },
  { href: "/dashboard/assets", label: "Асети", icon: IconAsset },
  { href: "/dashboard/customize", label: "Сторінка донатів", icon: IconPage },
  { href: "/dashboard/analytics", label: "Аналітика", icon: IconChart },
  { href: "/dashboard/settings", label: "Налаштування", icon: IconSettings },
];

export function DashboardNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex shrink-0 flex-col border-b border-zinc-200 bg-white px-4 py-4 md:sticky md:top-0 md:h-dvh md:w-64 md:border-b-0 md:border-r md:py-6">
      <div className="mb-4 flex items-center justify-between md:mb-8">
        <Link href="/" className="px-2 text-[18px] text-zinc-900">
          <LogoMark />
        </Link>
        <div className="md:hidden">
          <LogoutButton className="w-auto" />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto md:flex-1 md:flex-col">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : link.href === "/dashboard/connections"
              ? ["/dashboard/connections", "/dashboard/mono", "/dashboard/twitch"].some((path) =>
                  pathname.startsWith(path),
                )
              : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm transition-colors",
                active ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 hidden space-y-3 md:mt-auto md:block">
        <p className="truncate px-2 text-xs text-zinc-400">{email}</p>
        <LogoutButton />
      </div>
    </aside>
  );
}
