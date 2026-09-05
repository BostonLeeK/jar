import { cn } from "@/lib/cn";

export function StatusDot({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-zinc-400">
      <span className={cn("h-1.5 w-1.5 rounded-full", on ? "bg-emerald-400" : "bg-zinc-600")} />
      {label}
    </span>
  );
}
