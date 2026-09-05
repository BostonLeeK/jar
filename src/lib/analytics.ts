export type Period = "7" | "30" | "all";

export function parsePeriod(value?: string): Period {
  if (value === "30" || value === "all") {
    return value;
  }
  return "7";
}

export function periodSince(period: Period) {
  if (period === "all") {
    return null;
  }
  const days = period === "30" ? 30 : 7;
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));
  return since;
}

function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildDailySeries(period: Period, dates: Date[]) {
  const days = period === "all" ? 14 : period === "30" ? 30 : 7;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const counts = new Map<string, number>();
  for (const date of dates) {
    const key = dayKey(date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dayKey(date);
    return {
      key,
      label: `${date.getDate()}.${date.getMonth() + 1}`,
      value: counts.get(key) ?? 0,
    };
  });
}
