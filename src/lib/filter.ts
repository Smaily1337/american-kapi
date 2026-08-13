import { calculateImportCost, FALLBACK_USD_PLN } from "./calculator";
import { CARS } from "./cars";
import { milesToKm } from "./format";
import type { Car, SearchFilters, SortKey } from "./types";

export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): SearchFilters {
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const num = (key: string) => {
    const raw = one(key);
    if (!raw) return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const list = <T extends string>(key: string): T[] | undefined => {
    const raw = one(key);
    if (!raw) return undefined;
    return raw.split(",").filter(Boolean) as T[];
  };
  const bool = (key: string) => {
    const raw = one(key);
    if (raw === "1" || raw === "true") return true;
    if (raw === "0" || raw === "false") return false;
    return undefined;
  };

  return {
    q: one("q") || undefined,
    aukcja: (one("aukcja") as SearchFilters["aukcja"]) || "all",
    marka: one("marka") || undefined,
    model: one("model") || undefined,
    cenaOd: num("cenaOd"),
    cenaDo: num("cenaDo"),
    kosztOd: num("kosztOd"),
    kosztDo: num("kosztDo"),
    rokOd: num("rokOd"),
    rokDo: num("rokDo"),
    przebiegOd: num("przebiegOd"),
    przebiegDo: num("przebiegDo"),
    paliwo: list("paliwo"),
    kmOd: num("kmOd"),
    kmDo: num("kmDo"),
    ccmOd: num("ccmOd"),
    ccmDo: num("ccmDo"),
    uszkodzenie: list("uszkodzenie"),
    tytul: list("tytul"),
    stan: list("stan"),
    nadwozie: list("nadwozie"),
    skrzynia: one("skrzynia") as SearchFilters["skrzynia"],
    naped: list("naped"),
    stanUSA: one("stanUSA") || undefined,
    kluczyki: bool("kluczyki"),
    usa: bool("usa"),
    sort: (one("sort") as SortKey) || "trafne",
    page: num("page") || 1,
  };
}

export function filtersToQuery(filters: SearchFilters): string {
  const params = new URLSearchParams();
  const set = (key: string, value: string | number | boolean | undefined) => {
    if (value === undefined || value === "" || value === "all") return;
    params.set(key, String(value));
  };
  set("q", filters.q);
  set("aukcja", filters.aukcja);
  set("marka", filters.marka);
  set("model", filters.model);
  set("cenaOd", filters.cenaOd);
  set("cenaDo", filters.cenaDo);
  set("kosztOd", filters.kosztOd);
  set("kosztDo", filters.kosztDo);
  set("rokOd", filters.rokOd);
  set("rokDo", filters.rokDo);
  set("przebiegOd", filters.przebiegOd);
  set("przebiegDo", filters.przebiegDo);
  set("paliwo", filters.paliwo?.join(","));
  set("kmOd", filters.kmOd);
  set("kmDo", filters.kmDo);
  set("ccmOd", filters.ccmOd);
  set("ccmDo", filters.ccmDo);
  set("uszkodzenie", filters.uszkodzenie?.join(","));
  set("tytul", filters.tytul?.join(","));
  set("stan", filters.stan?.join(","));
  set("nadwozie", filters.nadwozie?.join(","));
  set("skrzynia", filters.skrzynia);
  set("naped", filters.naped?.join(","));
  set("stanUSA", filters.stanUSA);
  if (filters.kluczyki !== undefined) set("kluczyki", filters.kluczyki ? "1" : "0");
  if (filters.usa !== undefined) set("usa", filters.usa ? "1" : "0");
  set("sort", filters.sort === "trafne" ? undefined : filters.sort);
  set("page", filters.page && filters.page > 1 ? filters.page : undefined);
  return params.toString();
}

export function filterCars(
  filters: SearchFilters,
  usdPln = FALLBACK_USD_PLN,
  source: Car[] = CARS,
): Car[] {
  let result = source.filter((car) => {
    if (filters.aukcja && filters.aukcja !== "all" && car.auction !== filters.aukcja) {
      return false;
    }
    if (filters.marka && car.make !== filters.marka) return false;
    if (filters.model && car.model !== filters.model) return false;
    if (filters.cenaOd !== undefined && car.currentBidUsd < filters.cenaOd) return false;
    if (filters.cenaDo !== undefined && car.currentBidUsd > filters.cenaDo) return false;
    if (filters.rokOd !== undefined && car.year < filters.rokOd) return false;
    if (filters.rokDo !== undefined && car.year > filters.rokDo) return false;
    const km = milesToKm(car.mileageMiles);
    if (filters.przebiegOd !== undefined && km < filters.przebiegOd) return false;
    if (filters.przebiegDo !== undefined && km > filters.przebiegDo) return false;
    if (filters.paliwo?.length && !filters.paliwo.includes(car.fuel)) return false;
    if (filters.kmOd !== undefined && car.horsepower < filters.kmOd) return false;
    if (filters.kmDo !== undefined && car.horsepower > filters.kmDo) return false;
    if (filters.ccmOd !== undefined && car.engineCcm < filters.ccmOd) return false;
    if (filters.ccmDo !== undefined && car.engineCcm > filters.ccmDo) return false;
    if (filters.uszkodzenie?.length && !filters.uszkodzenie.includes(car.damage)) {
      return false;
    }
    if (filters.tytul?.length && !filters.tytul.includes(car.title)) return false;
    if (filters.stan?.length && !filters.stan.includes(car.startCode)) return false;
    if (filters.nadwozie?.length && !filters.nadwozie.includes(car.bodyType)) {
      return false;
    }
    if (filters.skrzynia && car.transmission !== filters.skrzynia) return false;
    if (filters.naped?.length && !filters.naped.includes(car.drivetrain)) return false;
    if (filters.stanUSA && car.state !== filters.stanUSA) return false;
    if (filters.kluczyki !== undefined && car.keys !== filters.kluczyki) return false;
    if (filters.usa !== undefined && car.manufacturedInUSA !== filters.usa) return false;
    if (filters.q) {
      const hay = `${car.make} ${car.model} ${car.version} ${car.vin} ${car.lot} ${car.city}`
        .toLowerCase();
      if (!hay.includes(filters.q.toLowerCase().trim())) return false;
    }
    return true;
  });

  const withCost = result.map((car) => {
    const breakdown = calculateImportCost(car, {
      bidUsd: car.currentBidUsd,
      repairUsd: car.estimatedRepairUsd,
      port: "gdynia",
      usdPln,
    });
    return { car, cost: breakdown.totalPln, deal: breakdown.dealScore };
  });

  if (filters.kosztOd !== undefined) {
    result = withCost.filter((item) => item.cost >= filters.kosztOd!).map((i) => i.car);
  }
  if (filters.kosztDo !== undefined) {
    const allowed = new Set(
      withCost.filter((item) => item.cost <= filters.kosztDo!).map((i) => i.car.id),
    );
    result = result.filter((car) => allowed.has(car.id));
  }

  const costMap = new Map(withCost.map((item) => [item.car.id, item]));

  switch (filters.sort) {
    case "cena-asc":
      result = [...result].sort((a, b) => a.currentBidUsd - b.currentBidUsd);
      break;
    case "cena-desc":
      result = [...result].sort((a, b) => b.currentBidUsd - a.currentBidUsd);
      break;
    case "rok-desc":
      result = [...result].sort((a, b) => b.year - a.year);
      break;
    case "koszt-asc":
      result = [...result].sort(
        (a, b) => (costMap.get(a.id)?.cost ?? 0) - (costMap.get(b.id)?.cost ?? 0),
      );
      break;
    case "okazja":
      result = [...result].sort(
        (a, b) => (costMap.get(b.id)?.deal ?? 0) - (costMap.get(a.id)?.deal ?? 0),
      );
      break;
    default:
      result = [...result].sort(
        (a, b) => (costMap.get(b.id)?.deal ?? 0) - (costMap.get(a.id)?.deal ?? 0),
      );
  }

  return result;
}

export function countForQuery(
  filters: SearchFilters,
  usdPln = FALLBACK_USD_PLN,
): number {
  return filterCars(filters, usdPln).length;
}
