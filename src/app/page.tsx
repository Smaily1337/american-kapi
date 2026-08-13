import Link from "next/link";
import { CarImage } from "@/components/CarImage";
import { PriceBadges } from "@/components/PriceBadges";
import { SearchForm } from "@/components/SearchForm";
import { calculateImportCost } from "@/lib/calculator";
import { searchCopart } from "@/lib/copart";
import { POPULAR_MAKES } from "@/lib/labels";
import { getUsdPln } from "@/lib/nbp";
import type { Car } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { rate } = await getUsdPln();
  let featured: { car: Car; cost: ReturnType<typeof calculateImportCost> }[] =
    [];
  try {
    const live = await searchCopart({ page: 1, rokOd: 2018 });
    featured = live.cars.slice(0, 6).map((car) => ({
      car,
      cost: calculateImportCost(car, {
        bidUsd: car.currentBidUsd,
        repairUsd: car.estimatedRepairUsd,
        port: "gdynia",
        usdPln: rate,
      }),
    }));
  } catch {
    featured = [];
  }

  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-3 py-8 sm:px-4 md:py-14">
          <p className="text-sm font-semibold tracking-wide text-orange">
            AMERICAN KAPI · AUTO IMPORT Z USA
          </p>
          <h1 className="mt-2 max-w-3xl text-2xl font-extrabold leading-tight text-navy sm:text-3xl md:text-5xl">
            Samochody z Copart. Szukaj jak na Otomoto, licz koszt sprowadzenia
            od razu.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted md:text-lg">
            Wklej numer lotu, VIN albo link z Copart — albo szukaj po marce i
            modelu. Kalkulator od razu dolicza cło, akcyzę, VAT i fracht.
          </p>
          <div className="mt-8">
            <SearchForm />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-10">
        <h2 className="text-xl font-extrabold">Najpopularniejsze marki</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {POPULAR_MAKES.map((make) => (
            <Link
              key={make}
              href={`/ogloszenia?marka=${encodeURIComponent(make.toUpperCase())}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold hover:border-orange hover:text-orange"
            >
              {make}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-extrabold">Aktualne loty Copart</h2>
          <Link href="/ogloszenia?sort=okazja" className="text-sm font-bold text-orange">
            Zobacz wszystkie
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(({ car, cost }) => (
            <Link
              key={car.id}
              href={`/ogloszenia/${car.id}`}
              className="overflow-hidden rounded-lg border border-line bg-white hover:border-[#cfd3d8]"
            >
              <div className="relative h-44 bg-[#ececec]">
                <CarImage
                  src={car.images[0] ?? ""}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
              <div className="p-4">
                <div className="font-bold">
                  {car.year} {car.make} {car.model}
                </div>
                <div className="mt-1 text-sm text-muted">{car.version}</div>
                <div className="mt-3">
                  <PriceBadges
                    currentBidUsd={car.currentBidUsd}
                    buyNowUsd={car.buyNowUsd}
                    landedPln={cost.totalPln}
                    compact
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 md:grid-cols-3">
          <Step
            n="1"
            title="Wybierz auto z Copart lub IAAI"
            text="Te same filtry co na Otomoto: marka, model, rok, KM, paliwo, uszkodzenie, tytuł, stan USA."
          />
          <Step
            n="2"
            title="Policz cło, akcyzę i VAT"
            text="Od 1.07.2026 cło 0% na auta wyprodukowane w USA. Akcyza 0–18,6%, VAT 23% w Gdyni."
          />
          <Step
            n="3"
            title="Zobacz koszt na kołach w PL"
            text="Transport USA, fracht, agencja, konwersja EU i naprawa — wszystko w jednej kwocie."
          />
        </div>
      </section>
    </main>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div>
      <div className="text-3xl font-black text-orange">{n}</div>
      <h3 className="mt-2 text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/70">{text}</p>
    </div>
  );
}
