"use client";

import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

async function removeTest(id?: string) {
  const path = id ? `/api/donations/test?id=${encodeURIComponent(id)}` : "/api/donations/test";
  const res = await fetch(path, { method: "DELETE" });
  if (!res.ok) {
    throw new Error("delete failed");
  }
}

export function ClearTestDonations({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    await removeTest().catch(() => undefined);
    setPending(false);
    router.refresh();
  }

  return (
    <Button type="button" variant="secondary" onClick={onClick} disabled={pending || disabled}>
      {pending ? "Видаляю…" : "Видалити тестові"}
    </Button>
  );
}

export function DeleteTestDonation({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    await removeTest(id).catch(() => undefined);
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-xs text-zinc-400 transition-colors hover:text-red-600 disabled:opacity-40"
    >
      {pending ? "…" : "Видалити"}
    </button>
  );
}
