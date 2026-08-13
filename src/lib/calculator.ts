import type { Car, CostBreakdown, CostInput, CostLine, Port } from "./types";

const CURRENT_YEAR = 2026;

function copartBuyerFee(price: number): number {
  const brackets: [number, number][] = [
    [100, 25],
    [200, 45],
    [300, 70],
    [400, 90],
    [500, 120],
    [600, 145],
    [700, 170],
    [800, 195],
    [900, 215],
    [1000, 240],
    [1200, 270],
    [1400, 300],
    [1600, 330],
    [1800, 355],
    [2000, 380],
    [2400, 410],
    [3000, 445],
    [3500, 480],
    [4000, 515],
    [4500, 550],
    [5000, 585],
    [6000, 640],
    [7000, 695],
    [8000, 750],
    [10000, 820],
    [15000, 920],
    [20000, 1020],
    [25000, 1120],
    [30000, 1220],
    [40000, 1370],
    [50000, 1520],
  ];
  for (const [limit, fee] of brackets) {
    if (price < limit) return fee;
  }
  return Math.round(1520 + (price - 50000) * 0.02);
}

function iaaiBuyerFee(price: number): number {
  return Math.round(copartBuyerFee(price) * 0.96 + 15);
}

function extraAuctionFees(auction: Car["auction"]): number {
  const gate = 79;
  const internet = auction === "copart" ? 59 : 49;
  const env = 10;
  return gate + internet + env;
}

const INLAND_BY_REGION: Record<Car["region"], number> = {
  northeast: 420,
  southeast: 390,
  midwest: 780,
  "south-central": 480,
  west: 520,
  mountain: 860,
};

const OCEAN_BY_REGION: Record<Car["region"], { gdynia: number; rotterdam: number }> =
  {
    northeast: { gdynia: 1280, rotterdam: 980 },
    southeast: { gdynia: 1320, rotterdam: 1050 },
    midwest: { gdynia: 1280, rotterdam: 980 },
    "south-central": { gdynia: 1450, rotterdam: 1180 },
    west: { gdynia: 2150, rotterdam: 1780 },
    mountain: { gdynia: 1980, rotterdam: 1650 },
  };

export function dutyRate(car: Car): number {
  const age = CURRENT_YEAR - car.year;
  if (age >= 30) return 0;
  if (car.manufacturedInUSA && car.fuel !== "elektryczny") return 0;
  if (car.bodyType === "pickup") return 0.22;
  return 0.1;
}

export function exciseRate(car: Car): number {
  if (car.bodyType === "pickup") return 0;
  if (car.fuel === "elektryczny") return 0;
  const over2k = car.engineCcm > 2000;
  if (car.fuel === "phev") return over2k ? 0.093 : 0;
  if (car.fuel === "hybryda") return over2k ? 0.093 : 0.0155;
  return over2k ? 0.186 : 0.031;
}

export function vatRate(port: Port): number {
  return port === "gdynia" ? 0.23 : 0.21;
}

function conversionCost(car: Car): number {
  let base = 1800;
  if (car.drivetrain === "rwd" || car.bodyType === "coupe") base += 400;
  if (car.fuel === "elektryczny") base += 600;
  if (car.bodyType === "pickup") base += 900;
  return base;
}

export function estimatePolishMarket(car: Car, usdPln: number): number {
  const age = CURRENT_YEAR - car.year;
  const ageFactor = Math.max(0.62, 1 - age * 0.035);
  const damageFactor =
    car.damage === "minor" || car.damage === "normal"
      ? 0.97
      : car.damage === "hail"
        ? 0.9
        : 0.84;
  return car.estimatedRetailUsd * usdPln * 0.9 * ageFactor * damageFactor;
}

export function calculateImportCost(car: Car, input: CostInput): CostBreakdown {
  const { bidUsd, repairUsd, port, usdPln } = input;
  const buyerFeeUsd =
    car.auction === "copart" ? copartBuyerFee(bidUsd) : iaaiBuyerFee(bidUsd);
  const extraAuctionFeesUsd = extraAuctionFees(car.auction);
  const inlandUsd = INLAND_BY_REGION[car.region];
  const oceanUsd = OCEAN_BY_REGION[car.region][port];
  const subtotalBeforeIns = bidUsd + buyerFeeUsd + extraAuctionFeesUsd + inlandUsd;
  const insuranceUsd = Math.max(85, Math.round(subtotalBeforeIns * 0.015));
  const cifUsd =
    bidUsd +
    buyerFeeUsd +
    extraAuctionFeesUsd +
    inlandUsd +
    oceanUsd +
    insuranceUsd;
  const cifPln = cifUsd * usdPln;

  const dRate = dutyRate(car);
  const dutyPln = cifPln * dRate;
  const eRate = exciseRate(car);
  const excisePln = (cifPln + dutyPln) * eRate;
  const vRate = vatRate(port);
  const vatBase =
    port === "gdynia" ? cifPln + dutyPln + excisePln : cifPln + dutyPln;
  const vatPln = vatBase * vRate;

  const brokerPln = 1600;
  const portFeesPln = port === "gdynia" ? 950 : 1200;
  const documentsPln = 780;
  const conversionPln = conversionCost(car);
  const registrationPln = 420;
  const repairPln = repairUsd * usdPln;

  const taxesPln = dutyPln + excisePln + vatPln;
  const transportPln = (inlandUsd + oceanUsd + insuranceUsd) * usdPln;
  const landedWithoutRepairPln =
    cifPln +
    taxesPln +
    brokerPln +
    portFeesPln +
    documentsPln +
    conversionPln +
    registrationPln;
  const totalPln = landedWithoutRepairPln + repairPln;
  const marketPln = estimatePolishMarket(car, usdPln);
  const savingsPln = marketPln - totalPln;
  const dealScore = marketPln > 0 ? savingsPln / marketPln : 0;

  const dutyHint = car.manufacturedInUSA
    ? car.fuel === "elektryczny"
      ? "Elektryki nie wchodzą w preferencję 0% cła (UE–USA 2026)."
      : "Cło 0% od 1.07.2026 — auto wyprodukowane w USA."
    : car.bodyType === "pickup"
      ? "Pickup CN 8704 spoza USA: cło 22%."
      : `Produkcja: ${car.manufacturedIn}. Cło 10% (CN 8703).`;

  const exciseHint =
    car.bodyType === "pickup"
      ? "Pickup (CN 8704) — bez akcyzy od samochodów osobowych."
      : car.fuel === "elektryczny"
        ? "BEV — akcyza 0%."
        : car.fuel === "phev" && car.engineCcm <= 2000
          ? "PHEV ≤ 2000 cm³ — zwolnienie z akcyzy do 2029."
          : undefined;

  const lines: CostLine[] = [
    {
      key: "bid",
      label: "Cena na aukcji",
      amountPln: bidUsd * usdPln,
      amountUsd: bidUsd,
    },
    {
      key: "fees",
      label: `Opłaty ${car.auction === "copart" ? "Copart" : "IAAI"}`,
      amountPln: (buyerFeeUsd + extraAuctionFeesUsd) * usdPln,
      amountUsd: buyerFeeUsd + extraAuctionFeesUsd,
      hint: "Buyer fee, gate fee, internet bid fee",
    },
    {
      key: "inland",
      label: "Transport USA → port",
      amountPln: inlandUsd * usdPln,
      amountUsd: inlandUsd,
    },
    {
      key: "ocean",
      label:
        port === "gdynia"
          ? "Fracht morski → Gdynia"
          : "Fracht morski → Rotterdam",
      amountPln: oceanUsd * usdPln,
      amountUsd: oceanUsd,
    },
    {
      key: "insurance",
      label: "Ubezpieczenie transportu",
      amountPln: insuranceUsd * usdPln,
      amountUsd: insuranceUsd,
    },
    {
      key: "duty",
      label: `Cło ${Math.round(dRate * 100)}%`,
      amountPln: dutyPln,
      hint: dutyHint,
    },
    {
      key: "excise",
      label: `Akcyza ${formatRate(eRate)}`,
      amountPln: excisePln,
      hint: exciseHint,
    },
    {
      key: "vat",
      label: `VAT ${Math.round(vRate * 100)}% (${port === "gdynia" ? "PL" : "NL"})`,
      amountPln: vatPln,
      hint:
        port === "gdynia"
          ? "VAT 23% od wartości celnej + cło + akcyza"
          : "VAT 21% w NL od wartości celnej + cło; akcyza PL osobno",
    },
    {
      key: "broker",
      label: "Agencja celna",
      amountPln: brokerPln,
    },
    {
      key: "port",
      label: "Opłaty portowe",
      amountPln: portFeesPln,
    },
    {
      key: "docs",
      label: "Tłumaczenia i dokumenty",
      amountPln: documentsPln,
    },
    {
      key: "conversion",
      label: "Przystosowanie do EU (światła, prędkościomierz)",
      amountPln: conversionPln,
    },
    {
      key: "reg",
      label: "Badanie techniczne i rejestracja",
      amountPln: registrationPln,
    },
    {
      key: "repair",
      label: "Szacowany koszt naprawy",
      amountPln: repairPln,
      amountUsd: repairUsd,
    },
  ];

  return {
    usdPln,
    port,
    bidUsd,
    buyerFeeUsd,
    extraAuctionFeesUsd,
    inlandUsd,
    oceanUsd,
    insuranceUsd,
    cifUsd,
    cifPln,
    dutyRate: dRate,
    dutyPln,
    exciseRate: eRate,
    excisePln,
    vatRate: vRate,
    vatPln,
    brokerPln,
    portFeesPln,
    documentsPln,
    conversionPln,
    registrationPln,
    repairPln,
    taxesPln,
    transportPln,
    landedWithoutRepairPln,
    totalPln,
    marketPln,
    savingsPln,
    dealScore,
    lines,
  };
}

function formatRate(rate: number): string {
  return `${(rate * 100).toLocaleString("pl-PL", { maximumFractionDigits: 2 })}%`;
}

export const FALLBACK_USD_PLN = 3.72;
