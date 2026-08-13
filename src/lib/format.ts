export function formatPln(value: number, digits = 0): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Math.round(value));
}

export function formatUsd(value: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pl-PL").format(Math.round(value));
}

export function milesToKm(miles: number): number {
  return Math.round(miles * 1.60934);
}

export function formatMileage(miles: number): string {
  return `${formatNumber(milesToKm(miles))} km`;
}

export function formatPercent(rate: number): string {
  const pct = rate * 100;
  return `${pct.toLocaleString("pl-PL", { maximumFractionDigits: 2 })}%`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
