"use client";

import { Button, FieldError } from "@/components/ui";
import { UploadBar } from "@/components/upload-bar";
import { uploadForm } from "@/lib/upload";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function CoverField({
  cover,
  onChange,
}: {
  cover: string | null;
  onChange?: (url: string | null) => void;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState(cover);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  async function upload(file: File) {
    const local = URL.createObjectURL(file);
    setPending(true);
    setProgress(1);
    setFileName(file.name);
    setError(null);
    setCurrent(local);
    onChange?.(local);
    try {
      const body = new FormData();
      body.set("cover", file);
      const res = await uploadForm("/api/settings/cover", body, setProgress);
      const data = (await res.json()) as { pageCoverUrl?: string; error?: string };
      if (!res.ok || !data.pageCoverUrl) {
        setCurrent(cover);
        onChange?.(cover);
        setError(data.error || "Не вдалося завантажити");
        return;
      }
      setCurrent(data.pageCoverUrl);
      onChange?.(data.pageCoverUrl);
      router.refresh();
    } catch {
      setCurrent(cover);
      onChange?.(cover);
      setError("Не вдалося завантажити");
    } finally {
      URL.revokeObjectURL(local);
      setPending(false);
      setProgress(0);
      setFileName("");
    }
  }

  async function remove() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/settings/cover", { method: "DELETE" });
    setPending(false);
    if (!res.ok) {
      setError("Не вдалося видалити");
      return;
    }
    setCurrent(null);
    onChange?.(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={pending}
        className="relative h-28 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 transition-all duration-150 hover:-translate-y-px hover:shadow-sm"
      >
        {current ? (
          <img src={current} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm text-zinc-500">Своє фото праворуч на картці</span>
        )}
        {pending ? (
          <span className="absolute inset-x-0 bottom-0 bg-white/80 px-3 py-2">
            <UploadBar value={progress} name={fileName} />
          </span>
        ) : null}
      </button>
      <p className="text-sm text-zinc-500">JPG, PNG або WEBP, до 15 МБ. Лігше читатиметься текст, якщо обличчя чи краєвид справа.</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => input.current?.click()} disabled={pending}>
          {pending ? `${progress}%` : "Завантажити фон"}
        </Button>
        {current ? (
          <Button type="button" variant="ghost" onClick={remove} disabled={pending}>
            Прибрати
          </Button>
        ) : null}
      </div>
      <FieldError>{error}</FieldError>
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
