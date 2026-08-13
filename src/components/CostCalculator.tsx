"use client";

import { useMemo, useState } from "react";
import { PriceBadges } from "@/components/PriceBadges";
import { calculateImportCost } from "@/lib/calculator";
import { formatPln, formatUsd } from "@/lib/format";
import type { Car, Port } from "@/lib/types";

type Props = {
  car: Car;
  usdPln: number;
  rateDate: string;
};

export function CostCalculator({ car, usdPln, rateDate }: Props) {
  const [bid, setBid] = useState(car.currentBidUsd);
  const [repair, setRepair] = useState(car.estimatedRepairUsd);
  const [port, setPort] = useState<Port>("gdynia");

  const cost = useMemo(
    () =>
      calculateImportCost(car, {
        bidUsd: bid,
        repairUsd: repair,
        port,
        usdPln,
      }),
    [car, bid, repair, port, usdPln],
  );

  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <PriceBadges
        currentBidUsd={car.currentBidUsd}
        buyNowUsd={car.buyNowUsd}
      />
      {car.buyNowUsd ? (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-md border border-navy px-2 py-1.5 text-xs font-bold text-navy hover:bg-navy hover:text-white"
            onClick={() => setBid(car.currentBidUsd)}
          >
            Licz od aktualnej
          </button>
          <button
            type="button"
            className="rounded-md border border-orange px-2 py-1.5 text-xs font-bold text-orange hover:bg-orange hover:text-white"
            onClick={() => setBid(car.buyNowUsd!)}
          >
            Licz od Kup teraz
          </button>
        </div>
      ) : null}

      <div className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">
        Szacowany koszt sprowadzenia
      </div>
      <div className="mt-1 text-3xl font-extrabold text-ink">
        {formatPln(cost.totalPln)}
      </div>
      <p className="mt-1 text-sm text-muted">
        Kurs NBP {usdPln.toFixed(4)} PLN/USD · {rateDate}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-md bg-page p-1 text-sm font-semibold">
        <button
          type="button"
          className={`rounded px-3 py-2 ${port === "gdynia" ? "bg-white text-orange" : "text-muted"}`}
          onClick={() => setPort("gdynia")}
        >
          Gdynia 23% VAT
        </button>
        <button
          type="button"
          className={`rounded px-3 py-2 ${port === "rotterdam" ? "bg-white text-orange" : "text-muted"}`}
          onClick={() => setPort("rotterdam")}
        >
          Rotterdam 21% VAT
        </button>
      </div>

      <label className="mt-4 block text-xs font-semibold text-muted">
        Twoja oferta (USD)
        <input
          type="range"
          min={Math.max(500, Math.round(car.currentBidUsd * 0.6))}
          max={Math.round((car.buyNowUsd ?? car.currentBidUsd * 1.4) * 1.15)}
          value={bid}
          onChange={(e) => setBid(Number(e.target.value))}
          className="mt-2 w-full accent-orange"
        />
        <input
          type="number"
          className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm font-bold"
          value={bid}
          onChange={(e) => setBid(Number(e.target.value))}
        />
      </label>

      <label className="mt-3 block text-xs font-semibold text-muted">
        Koszt naprawy (USD) · szacunek aukcji {formatUsd(car.estimatedRepairUsd)}
        <input
          type="range"
          min={0}
          max={Math.max(car.estimatedRepairUsd * 2, 2000)}
          value={repair}
          onChange={(e) => setRepair(Number(e.target.value))}
          className="mt-2 w-full accent-orange"
        />
        <input
          type="number"
          className="mt-2 h-10 w-full rounded-md border border-line px-3 text-sm font-bold"
          value={repair}
          onChange={(e) => setRepair(Number(e.target.value))}
        />
      </label>

      <dl className="mt-5 divide-y divide-line text-sm">
        {cost.lines.map((line) => (
          <div key={line.key} className="flex items-start justify-between gap-3 py-2">
            <dt className="text-muted">
              {line.label}
              {line.hint && (
                <div className="mt-0.5 text-[11px] leading-4">{line.hint}</div>
              )}
            </dt>
            <dd className="shrink-0 font-semibold">{formatPln(line.amountPln)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 space-y-2 rounded-md bg-page p-3 text-sm">
        <Row label="Podatki (cło + akcyza + VAT)" value={formatPln(cost.taxesPln)} />
        <Row label="Transport i ubezpieczenie" value={formatPln(cost.transportPln)} />
        <Row
          label="Na kołach, bez naprawy"
          value={formatPln(cost.landedWithoutRepairPln)}
        />
        <Row label="Orientacyjna wartość w PL" value={formatPln(cost.marketPln)} />
        <Row
          label={cost.savingsPln >= 0 ? "Potencjalna oszczędność" : "Powyżej rynku"}
          value={formatPln(cost.savingsPln)}
          strong
          positive={cost.savingsPln >= 0}
        />
      </div>

      <a
        href={
          car.auction === "copart"
            ? `https://www.copart.com/lot/${car.lot}`
            : `https://www.iaai.com/Search?Keyword=${car.vin}`
        }
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex h-11 items-center justify-center rounded-md bg-orange text-sm font-bold text-white hover:bg-orange-hover"
      >
        Otwórz lot na {car.auction === "copart" ? "Copart" : "IAAI"}
      </a>
      <p className="mt-3 text-[11px] leading-4 text-muted">
        Kalkulacja orientacyjna. Cło 0% od 1.07.2026 dotyczy aut wyprodukowanych
        w USA (nie elektryków). Akcyza zależy od pojemności i napędu. VAT w
        Gdyni 23% od CIF + cło + akcyza.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
  positive,
}: {
  label: string;
  value: string;
  strong?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span
        className={`font-bold ${
          strong ? (positive ? "text-deal" : "text-[#c62828]") : "text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
