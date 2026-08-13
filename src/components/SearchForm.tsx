"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LotSearch } from "@/components/LotSearch";
import { filtersToQuery } from "@/lib/filter";
import { BODY_LABEL, DAMAGE_LABEL, FUEL_LABEL } from "@/lib/labels";
import type {
  Auction,
  BodyType,
  CopartFacet,
  CopartSearchResult,
  DamageType,
  Fuel,
} from "@/lib/types";

const YEARS = Array.from({ length: 20 }, (_, i) => 2026 - i);

type Props = {
  compact?: boolean;
};

export function SearchForm({ compact = false }: Props) {
  const router = useRouter();
  const [aukcja, setAukcja] = useState<Auction | "all">("copart");
  const [marka, setMarka] = useState("");
  const [model, setModel] = useState("");
  const [rokOd, setRokOd] = useState("");
  const [rokDo, setRokDo] = useState("");
  const [cenaOd, setCenaOd] = useState("");
  const [cenaDo, setCenaDo] = useState("");
  const [paliwo, setPaliwo] = useState("");
  const [uszkodzenie, setUszkodzenie] = useState("");
  const [nadwozie, setNadwozie] = useState("");
  const [kmOd, setKmOd] = useState("");
  const [usa, setUsa] = useState(false);
  const [makes, setMakes] = useState<CopartFacet[]>([]);
  const [models, setModels] = useState<CopartFacet[]>([]);
  const [count, setCount] = useState<number | null>(null);

  const filters = useMemo(
    () => ({
      aukcja,
      marka: marka || undefined,
      model: model || undefined,
      rokOd: rokOd ? Number(rokOd) : undefined,
      rokDo: rokDo ? Number(rokDo) : undefined,
      cenaOd: cenaOd ? Number(cenaOd) : undefined,
      cenaDo: cenaDo ? Number(cenaDo) : undefined,
      paliwo: paliwo ? [paliwo as Fuel] : undefined,
      uszkodzenie: uszkodzenie ? [uszkodzenie as DamageType] : undefined,
      nadwozie: nadwozie ? [nadwozie as BodyType] : undefined,
      kmOd: kmOd ? Number(kmOd) : undefined,
      usa: usa || undefined,
    }),
    [
      aukcja,
      marka,
      model,
      rokOd,
      rokDo,
      cenaOd,
      cenaDo,
      paliwo,
      uszkodzenie,
      nadwozie,
      kmOd,
      usa,
    ],
  );

  useEffect(() => {
    const query = filtersToQuery(filters);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          query ? `/api/copart/search?${query}` : "/api/copart/search",
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as CopartSearchResult;
        if (!data.facets) return;
        setCount(data.total);
        if (data.facets.makes.length && !marka) setMakes(data.facets.makes);
        setModels(data.facets.models);
      } catch {
        /* ignore abort */
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [filters, marka]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = filtersToQuery(filters);
    router.push(query ? `/ogloszenia?${query}` : "/ogloszenia");
  }

  const field =
    "h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-orange";

  return (
    <div
      className={`rounded-xl bg-white ${compact ? "p-0 shadow-none" : "p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"}`}
    >
      {!compact && (
        <div className="mb-4">
          <LotSearch />
        </div>
      )}
      <form onSubmit={submit}>
      {!compact && (
        <div className="mb-4 flex gap-1 rounded-lg bg-page p-1 text-sm font-semibold">
          {(
            [
              ["copart", "Copart na żywo"],
              ["iaai", "IAAI (wkrótce)"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setAukcja(value)}
              className={`flex-1 rounded-md px-3 py-2 ${
                aukcja === value ? "bg-white text-orange shadow-sm" : "text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <label className="col-span-1 text-xs font-semibold text-muted">
          Marka
          <select
            className={`${field} mt-1`}
            value={marka}
            onChange={(e) => {
              setMarka(e.target.value);
              setModel("");
              setModels([]);
            }}
          >
            <option value="">
              {makes.length ? "Dowolna" : "Ładowanie marek…"}
            </option>
            {makes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label} ({item.count.toLocaleString("pl-PL")})
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted">
          Model
          <select
            className={`${field} mt-1`}
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={!marka}
          >
            <option value="">
              {!marka
                ? "Najpierw wybierz markę"
                : models.length
                  ? "Dowolny"
                  : "Ładowanie modeli…"}
            </option>
            {models.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label} ({item.count.toLocaleString("pl-PL")})
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted">
          Rok od
          <select
            className={`${field} mt-1`}
            value={rokOd}
            onChange={(e) => setRokOd(e.target.value)}
          >
            <option value="">Od</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted">
          Rok do
          <select
            className={`${field} mt-1`}
            value={rokDo}
            onChange={(e) => setRokDo(e.target.value)}
          >
            <option value="">Do</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted">
          Cena aukcji od (USD)
          <input
            className={`${field} mt-1`}
            type="number"
            min={0}
            placeholder="np. 5000"
            value={cenaOd}
            onChange={(e) => setCenaOd(e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold text-muted">
          Cena aukcji do (USD)
          <input
            className={`${field} mt-1`}
            type="number"
            min={0}
            placeholder="np. 25000"
            value={cenaDo}
            onChange={(e) => setCenaDo(e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold text-muted">
          Rodzaj paliwa
          <select
            className={`${field} mt-1`}
            value={paliwo}
            onChange={(e) => setPaliwo(e.target.value)}
          >
            <option value="">Dowolny</option>
            {Object.entries(FUEL_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted">
          Uszkodzenie
          <select
            className={`${field} mt-1`}
            value={uszkodzenie}
            onChange={(e) => setUszkodzenie(e.target.value)}
          >
            <option value="">Dowolne</option>
            {Object.entries(DAMAGE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted">
          Nadwozie
          <select
            className={`${field} mt-1`}
            value={nadwozie}
            onChange={(e) => setNadwozie(e.target.value)}
          >
            <option value="">Dowolne</option>
            {Object.entries(BODY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted">
          Moc od (KM)
          <input
            className={`${field} mt-1`}
            type="number"
            min={0}
            placeholder="np. 200"
            value={kmOd}
            onChange={(e) => setKmOd(e.target.value)}
          />
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={usa}
            onChange={(e) => setUsa(e.target.checked)}
            className="h-4 w-4 accent-orange"
          />
          Tylko produkcja USA (cło 0%)
        </label>
        <button
          type="submit"
          className="col-span-1 h-11 rounded-md bg-orange text-sm font-bold text-white hover:bg-orange-hover sm:col-span-2 md:col-span-1"
        >
          {count == null
            ? "Szukaj na Copart"
            : `Pokaż ${count.toLocaleString("pl-PL")} ogłoszeń`}
        </button>
      </div>
    </form>
    </div>
  );
}
