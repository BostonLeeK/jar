import { cn } from "@/lib/cn";

export function DailyChart({
  series,
}: {
  series: Array<{ key: string; label: string; value: number; title?: string }>;
}) {
  const max = Math.max(...series.map((item) => item.value), 1);

  return (
    <div className="flex h-40 items-stretch gap-1">
      {series.map((item) => (
        <div key={item.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex w-full min-h-0 flex-1 items-end">
            <div
              className={cn("w-full rounded-t-md", item.value > 0 ? "bg-zinc-900" : "bg-zinc-200")}
              style={{ height: item.value > 0 ? `${Math.max(8, (item.value / max) * 100)}%` : "3px" }}
              title={item.title ?? `${item.label}: ${item.value}`}
            />
          </div>
          <span className="text-[10px] leading-none text-zinc-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
