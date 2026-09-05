export function UploadBar({ value, name }: { value: number; name?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-zinc-900 transition-[width] duration-150" style={{ width: `${value}%` }} />
      </div>
      <p className="truncate text-xs text-zinc-500">
        {name ? `${name} · ${value}%` : `Завантажую… ${value}%`}
      </p>
    </div>
  );
}
