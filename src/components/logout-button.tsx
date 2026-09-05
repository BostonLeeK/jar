"use client";

import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <Button type="button" variant="ghost" className={cn("w-full justify-start px-2", className)} onClick={logout}>
      Вийти
    </Button>
  );
}
