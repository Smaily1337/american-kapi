import Link from "next/link";
import { redirect } from "next/navigation";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ListingCard } from "@/components/ListingCard";
import { Pagination } from "@/components/Pagination";
import { SortBar } from "@/components/SortBar";
import { searchCopart } from "@/lib/copart";
import { parseFilters } from "@/lib/filter";
import { parseCopartLookup } from "@/lib/lookup";
import { getUsdPln } from "@/lib/nbp";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ListingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseFilters(params);
  if (filters.q) {
    const parsed = parseCopartLookup(filters.q);
    if (parsed.lot) redirect(`/ogloszenia/${parsed.lot}`);
  }
  const { rate } = await getUsdPln();

  if (filters.aukcja === "iaai") {
    return (
      <main className="mx-auto w-full max-w-[1280px] px-4 py-10">
        <h1 className="text-2xl font-extrabold">IAAI</h1>
        <p className="mt-3 max-w-xl text-muted">
          Żywe loty są teraz zaciągane z Copart. IAAI podłączymy w kolejnym
          kroku — ich API jest osobne i też za ochroną botów.
        </p>
        <Link href="/ogloszenia?aukcja=copart" className="mt-6 inline-block font-bold text-orange">
          Pokaż Copart na żywo
        </Link>
      </main>
    );
  }

  let result;
  let error: string | null = null;
  try {
    result = await searchCopart(filters);
  } catch (err) {
    error = err instanceof Error ? err.message : "Nie udało się pobrać Copart";
  }

  const cars = result?.cars ?? [];
  const total = result?.total ?? 0;

  return (
    <main className="mx-auto w-full max-w-[1280px] px-3 py-4 sm:px-4 sm:py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <FilterSidebar
          filters={filters}
          facetMakes={result?.facets.makes}
          facetModels={result?.facets.models}
        />
        <section className="min-w-0 flex-1">
        <div className="mb-3 rounded-md border border-line bg-white px-3 py-2 text-[13px] font-semibold text-navy">
          <span className="mr-2 inline-block rounded bg-orange px-1.5 py-0.5 text-[11px] font-bold text-white">
            LIVE
          </span>
          Na żywo z Copart
          {total ? ` · ${total.toLocaleString("pl-PL")} lotów` : ""}
        </div>
        <SortBar filters={filters} count={total} />
        {error ? (
          <div className="rounded-lg border border-line bg-white p-10 text-center">
            <div className="text-lg font-bold">Copart chwilowo niedostępny</div>
            <p className="mt-2 text-sm text-muted">{error}</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="rounded-lg border border-line bg-white p-10 text-center">
            <div className="text-lg font-bold">Brak ogłoszeń</div>
            <p className="mt-2 text-sm text-muted">
              Zmień filtry — spróbuj szerszego zakresu roku, ceny lub uszkodzenia.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {cars.map((car, index) => (
                <ListingCard key={`${car.lot}-${index}`} car={car} usdPln={rate} />
              ))}
            </div>
            <Pagination filters={filters} total={total} size={result?.size ?? 20} />
          </>
        )}
      </section>
      </div>
    </main>
  );
}
