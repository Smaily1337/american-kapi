"use client";

import Link from "next/link";
import { CarImage } from "@/components/CarImage";
import { PriceBadges } from "@/components/PriceBadges";
import { calculateImportCost } from "@/lib/calculator";
import { formatMileage, formatNumber, formatUsd } from "@/lib/format";
import {
  AUCTION_LABEL,
  DAMAGE_LABEL,
  FUEL_LABEL,
  START_LABEL,
  US_STATES,
} from "@/lib/labels";
import type { Car } from "@/lib/types";

type Props = {
  car: Car;
  usdPln: number;
};

export function ListingCard({ car, usdPln }: Props) {
  const cost = calculateImportCost(car, {
    bidUsd: car.currentBidUsd,
    repairUsd: car.estimatedRepairUsd,
    port: "gdynia",
    usdPln,
  });

  const deal =
    cost.dealScore >= 0.18
      ? "Dobra okazja"
      : cost.dealScore >= 0.05
        ? "Fair deal"
        : "Sprawdź kalkulację";

  return (
    <article className="overflow-hidden rounded-lg border border-line bg-white transition hover:border-[#cfd3d8]">
      <Link href={`/ogloszenia/${car.id}`} className="flex flex-col md:flex-row">
        <div className="relative h-48 w-full shrink-0 bg-[#ececec] sm:h-52 md:h-[188px] md:w-[268px]">
          <CarImage
            src={car.images[0]}
            alt={`${car.make} ${car.model}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 268px"
          />
          <span className="absolute left-2 top-2 rounded bg-black/75 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            {AUCTION_LABEL[car.auction]}
          </span>
          {car.manufacturedInUSA && car.fuel !== "elektryczny" && (
            <span className="absolute right-2 top-2 rounded bg-deal px-2 py-0.5 text-[11px] font-bold text-white">
              Cło 0%
            </span>
          )}
          {car.buyNowUsd ? (
            <span className="absolute bottom-2 left-2 rounded bg-orange px-2 py-0.5 text-[11px] font-bold text-white">
              Kup teraz {formatUsd(car.buyNowUsd)}
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-bold leading-6 text-ink sm:text-lg">
                {car.make} {car.model} {car.version}
              </h2>
              <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted">
                <span>{car.year}</span>
                <span>{formatMileage(car.mileageMiles)}</span>
                <span>{FUEL_LABEL[car.fuel]}</span>
                {car.horsepower > 0 && <span>{car.horsepower} KM</span>}
                {car.engineCcm > 0 && (
                  <span>{formatNumber(car.engineCcm)} cm³</span>
                )}
              </p>
              <p className="mt-2 text-[13px] text-muted">
                {DAMAGE_LABEL[car.damage]} · {START_LABEL[car.startCode]} ·{" "}
                {car.city}, {US_STATES[car.state] ?? car.state}
              </p>
            </div>
            <div className="w-full shrink-0 md:max-w-[240px]">
              <PriceBadges
                currentBidUsd={car.currentBidUsd}
                buyNowUsd={car.buyNowUsd}
                landedPln={cost.totalPln}
                compact
              />
              <div className="mt-1 text-[12px] text-muted">{deal}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {car.highlights.slice(0, 3).map((item) => (
              <span
                key={item}
                className="rounded bg-page px-2 py-1 text-[11px] font-semibold text-ink"
              >
                {item}
              </span>
            ))}
            <span className="ml-auto text-[12px] text-muted">
              Lot {car.lot} · {car.keys ? "Kluczyki" : "Brak kluczyków"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
