"use client";

import { useMemo, useState } from "react";
import { calculateImportCost, FALLBACK_USD_PLN } from "@/lib/calculator";
import { CARS } from "@/lib/cars";
import { formatPln, formatUsd } from "@/lib/format";
import type { BodyType, Fuel, Port, UsRegion } from "@/lib/types";

const field =
  "h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-orange";

export function StandaloneCalculator({
  usdPln = FALLBACK_USD_PLN,
  rateDate = "szacunek",
}: {
  usdPln?: number;
  rateDate?: string;
}) {
  const [bid, setBid] = useState(12000);
  const [repair, setRepair] = useState(4000);
  const [fuel, setFuel] = useState<Fuel>("benzyna");
  const [ccm, setCcm] = useState(1998);
  const [year, setYear] = useState(2021);
  const [body, setBody] = useState<BodyType>("sedan");
  const [usa, setUsa] = useState(true);
  const [region, setRegion] = useState<UsRegion>("southeast");
  const [port, setPort] = useState<Port>("gdynia");
  const [auction, setAuction] = useState<"copart" | "iaai">("copart");

  const car = useMemo(
    () => ({
      ...CARS[0],
      id: "custom",
      auction,
      year,
      fuel,
      engineCcm: fuel === "elektryczny" ? 0 : ccm,
      bodyType: body,
      manufacturedInUSA: usa,
      manufacturedIn: usa ? "USA" : "poza USA",
      region,
      currentBidUsd: bid,
      estimatedRepairUsd: repair,
    }),
    [auction, year, fuel, ccm, body, usa, region, bid, repair],
  );

  const cost = calculateImportCost(car, {
    bidUsd: bid,
    repairUsd: repair,
    port,
    usdPln,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="rounded-lg border border-line bg-white p-5">
        <h2 className="text-lg font-bold">Dane pojazdu i aukcji</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-muted">
            Cena zakupu (USD)
            <input
              className={`${field} mt-1 font-bold`}
              type="number"
              value={bid}
              onChange={(e) => setBid(Number(e.target.value))}
            />
          </label>
          <label className="text-xs font-semibold text-muted">
            Naprawa (USD)
            <input
              className={`${field} mt-1 font-bold`}
              type="number"
              value={repair}
              onChange={(e) => setRepair(Number(e.target.value))}
            />
          </label>
          <label className="text-xs font-semibold text-muted">
            Aukcja
            <select
              className={`${field} mt-1`}
              value={auction}
              onChange={(e) => setAuction(e.target.value as "copart" | "iaai")}
            >
              <option value="copart">Copart</option>
              <option value="iaai">IAAI</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-muted">
            Rok produkcji
            <input
              className={`${field} mt-1`}
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </label>
          <label className="text-xs font-semibold text-muted">
            Paliwo
            <select
              className={`${field} mt-1`}
              value={fuel}
              onChange={(e) => setFuel(e.target.value as Fuel)}
            >
              <option value="benzyna">Benzyna</option>
              <option value="diesel">Diesel</option>
              <option value="hybryda">Hybryda</option>
              <option value="phev">Hybryda plug-in</option>
              <option value="elektryczny">Elektryczny</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-muted">
            Pojemność cm³
            <input
              className={`${field} mt-1`}
              type="number"
              disabled={fuel === "elektryczny"}
              value={ccm}
              onChange={(e) => setCcm(Number(e.target.value))}
            />
          </label>
          <label className="text-xs font-semibold text-muted">
            Nadwozie
            <select
              className={`${field} mt-1`}
              value={body}
              onChange={(e) => setBody(e.target.value as BodyType)}
            >
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="coupe">Coupe</option>
              <option value="pickup">Pickup</option>
              <option value="hatchback">Hatchback</option>
              <option value="kombi">Kombi</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-muted">
            Region USA (transport)
            <select
              className={`${field} mt-1`}
              value={region}
              onChange={(e) => setRegion(e.target.value as UsRegion)}
            >
              <option value="northeast">Północny wschód</option>
              <option value="southeast">Południowy wschód</option>
              <option value="midwest">Midwest</option>
              <option value="south-central">Teksas / południe</option>
              <option value="west">Zachód (CA)</option>
              <option value="mountain">Góry Skaliste</option>
            </select>
          </label>
          <label className="col-span-2 flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              className="accent-orange"
              checked={usa}
              onChange={(e) => setUsa(e.target.checked)}
            />
            Wyprodukowane w USA (cło 0% od 1.07.2026, poza BEV)
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white p-5">
        <div className="grid grid-cols-2 gap-2 rounded-md bg-page p-1 text-sm font-semibold">
          <button
            type="button"
            className={`rounded px-3 py-2 ${port === "gdynia" ? "bg-white text-orange" : "text-muted"}`}
            onClick={() => setPort("gdynia")}
          >
            Gdynia
          </button>
          <button
            type="button"
            className={`rounded px-3 py-2 ${port === "rotterdam" ? "bg-white text-orange" : "text-muted"}`}
            onClick={() => setPort("rotterdam")}
          >
            Rotterdam
          </button>
        </div>
        <div className="mt-4 text-xs font-semibold uppercase text-muted">
          Koszt całkowity
        </div>
        <div className="text-3xl font-extrabold">{formatPln(cost.totalPln)}</div>
        <p className="mt-1 text-sm text-muted">
          {formatUsd(bid)} na aukcji · kurs {usdPln.toFixed(4)} · {rateDate}
        </p>
        <dl className="mt-4 divide-y divide-line text-sm">
          {cost.lines.map((line) => (
            <div key={line.key} className="flex justify-between gap-3 py-2">
              <dt className="text-muted">{line.label}</dt>
              <dd className="font-semibold">{formatPln(line.amountPln)}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 rounded-md bg-page p-3 text-sm font-bold">
          Podatki: {formatPln(cost.taxesPln)}
        </div>
      </div>
    </div>
  );
}
