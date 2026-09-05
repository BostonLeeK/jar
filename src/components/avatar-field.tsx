"use client";

import { Button, FieldError } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function AvatarField({
  avatar,
  fallback,
  name,
  onChange,
}: {
  avatar: string | null;
  fallback?: string | null;
  name: string;
  onChange?: (url: string | null) => void;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [custom, setCustom] = useState(avatar);
  const current = custom || fallback || null;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function upload(file: File) {
    setPending(true);
    setError(null);
    const body = new FormData();
    body.set("avatar", file);
    const res = await fetch("/api/settings/avatar", { method: "POST", body });
    const data = (await res.json()) as { avatarUrl?: string; error?: string };
    setPending(false);
    if (!res.ok || !data.avatarUrl) {
      setError(data.error || "Не вдалося завантажити");
      return;
    }
    setCustom(data.avatarUrl);
    onChange?.(data.avatarUrl);
    router.refresh();
  }

  async function remove() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/settings/avatar", { method: "DELETE" });
    setPending(false);
    if (!res.ok) {
      setError("Не вдалося видалити");
      return;
    }
    setCustom(null);
    onChange?.(fallback ?? null);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 transition-all duration-150 hover:-translate-y-px hover:shadow-sm"
        disabled={pending}
      >
        {current ? (
          <img src={current} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg font-semibold text-zinc-500">{name.slice(0, 1).toUpperCase()}</span>
        )}
      </button>
      <div className="min-w-0 space-y-2">
        <p className="text-sm text-zinc-500">JPG, PNG або WEBP, до 2 МБ. Якщо Twitch не підключений — це аватар на сторінці.</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => input.current?.click()} disabled={pending}>
            {pending ? "Завантажую…" : "Завантажити"}
          </Button>
          {custom ? (
            <Button type="button" variant="ghost" onClick={remove} disabled={pending}>
              Прибрати
            </Button>
          ) : null}
        </div>
        <FieldError>{error}</FieldError>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            void upload(file);
          }
        }}
      />
    </div>
  );
}
