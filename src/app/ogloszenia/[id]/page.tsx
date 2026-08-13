import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CostCalculator } from "@/components/CostCalculator";
import { Gallery } from "@/components/Gallery";
import { ListingCard } from "@/components/ListingCard";
import { PriceBadges } from "@/components/PriceBadges";
import { SpecTable } from "@/components/SpecTable";
import { getCarById } from "@/lib/cars";
import { getCopartLot, searchCopart } from "@/lib/copart";
import { formatDate, formatMileage, formatNumber } from "@/lib/format";
import { DAMAGE_LABEL, FUEL_LABEL } from "@/lib/labels";
import type { Car } from "@/lib/types";
import { getUsdPln } from "@/lib/nbp";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const car = /^\d+$/.test(id) ? await getCopartLot(id) : getCarById(id);
  if (!car) return { title: "Ogłoszenie — American KAPI" };
  return {
    title: `${car.year} ${car.make} ${car.model} · Copart ${car.lot} — KAPI`,
    description: `${car.version}, lot ${car.lot}. Szacunek kosztów sprowadzenia z USA do Polski.`,
  };
}

export default async function CarPage({ params }: Props) {
  const { id } = await params;
  const car = /^\d+$/.test(id) ? await getCopartLot(id) : getCarById(id);
  if (!car) notFound();
  const { rate, date } = await getUsdPln();
  let similar: Car[] = [];
  try {
    const related = await searchCopart({ marka: car.make.toUpperCase(), page: 1 });
    similar = related.cars.filter((item) => item.id !== car.id).slice(0, 4);
  } catch {
    similar = [];
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] px-3 py-4 sm:px-4 sm:py-6">
      <div className="mb-4 text-sm text-muted">
        <Link href="/" className="hover:text-orange">
          KAPI
        </Link>
        {" / "}
        <Link href="/ogloszenia" className="hover:text-orange">
          Ogłoszenia
        </Link>
        {" / "}
        <Link
          href={`/ogloszenia?marka=${encodeURIComponent(car.make.toUpperCase())}`}
          className="hover:text-orange"
        >
          {car.make}
        </Link>
        {" / "}
        <span className="text-ink">
          {car.year} {car.model}
        </span>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <Gallery
            images={car.images.length ? car.images : []}
            alt={`${car.make} ${car.model}`}
          />
          <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
            {car.make} {car.model} {car.version}
          </h1>
          <p className="mt-2 flex flex-wrap gap-x-3 text-sm text-muted">
            <span>{car.year}</span>
            <span>{formatMileage(car.mileageMiles)}</span>
            <span>{FUEL_LABEL[car.fuel]}</span>
            {car.horsepower > 0 && <span>{car.horsepower} KM</span>}
            {car.engineCcm > 0 && <span>{formatNumber(car.engineCcm)} cm³</span>}
            <span>{DAMAGE_LABEL[car.damage]}</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            Aukcja {formatDate(car.saleDate)} · VIN {car.vin} · lot {car.lot}
          </p>
          <div className="mt-4 max-w-md lg:hidden">
            <PriceBadges
              currentBidUsd={car.currentBidUsd}
              buyNowUsd={car.buyNowUsd}
            />
          </div>
          <div className="mt-6">
            <SpecTable car={car} />
          </div>
        </div>
        <div className="lg:sticky lg:top-[88px]">
          <CostCalculator car={car} usdPln={rate} rateDate={date} />
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-extrabold">Podobne ogłoszenia z Copart</h2>
          <div className="space-y-3">
            {similar.map((item) => (
              <ListingCard key={item.id} car={item} usdPln={rate} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
