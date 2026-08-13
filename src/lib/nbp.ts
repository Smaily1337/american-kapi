import { FALLBACK_USD_PLN } from "./calculator";

export async function getUsdPln(): Promise<{ rate: number; date: string }> {
  try {
    const res = await fetch(
      "https://api.nbp.pl/api/exchangerates/rates/a/usd/?format=json",
      { next: { revalidate: 3600 }, headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error("NBP error");
    const data = (await res.json()) as {
      rates: { mid: number; effectiveDate: string }[];
    };
    return { rate: data.rates[0].mid, date: data.rates[0].effectiveDate };
  } catch {
    return { rate: FALLBACK_USD_PLN, date: "szacunek" };
  }
}
