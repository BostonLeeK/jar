export function uahToKopiyky(amount: number) {
  return Math.round(amount * 100);
}

export function kopiykyToUah(amount: number) {
  return amount / 100;
}

function formatNumber(value: number, fractionDigits: number) {
  const [int, frac] = value.toFixed(fractionDigits).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  if (!frac || Number(frac) === 0) {
    return grouped;
  }
  return `${grouped},${frac}`;
}

export function formatUah(amount: number) {
  return `${formatNumber(kopiykyToUah(amount), 0)}\u00a0₴`;
}

export function formatUahPrecise(amount: number) {
  const uah = kopiykyToUah(amount);
  const digits = Number.isInteger(uah) ? 0 : 2;
  return `${formatNumber(uah, digits)}\u00a0₴`;
}
