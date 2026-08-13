"use client";

import { useRouter } from "next/navigation";
import { filtersToQuery } from "@/lib/filter";
import { lookupHref } from "@/lib/lookup";
import type { SearchFilters, SortKey } from "@/lib/types";

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: "trafne", label: "Trafne / okazje" },
  { value: "okazja", label: "Największa oszczędność" },
  { value: "cena-asc", label: "Cena aukcji: od najniższej" },
  { value: "cena-desc", label: "Cena aukcji: od najwyższej" },
  { value: "koszt-asc", label: "Koszt w PL: od najniższego" },
  { value: "rok-desc", label: "Rok: od najnowszych" },
];

export function SortBar({
  filters,
  count,
}: {
  filters: SearchFilters;
  count: number;
}) {
  const router = useRouter();

  return (
    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <h1 className="text-lg font-extrabold sm:text-xl">
        Samochody z USA{" "}
        <span className="font-semibold text-muted">
          · {count.toLocaleString("pl-PL")} ogłoszeń
        </span>
      </h1>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          defaultValue={filters.q ?? ""}
          placeholder="Lot Copart, VIN lub link…"
          className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-orange sm:max-w-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = (e.target as HTMLInputElement).value;
              const href = lookupHref(value);
              if (href) {
                router.push(href);
                return;
              }
              const query = filtersToQuery({
                ...filters,
                q: value || undefined,
                page: 1,
              });
              router.push(query ? `/ogloszenia?${query}` : "/ogloszenia");
            }
          }}
        />
        <label className="flex items-center gap-2 text-sm">
          Sortuj
          <select
            className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-orange sm:w-auto"
            value={filters.sort ?? "trafne"}
            onChange={(e) => {
            const query = filtersToQuery({
              ...filters,
              sort: e.target.value as SortKey,
              page: 1,
            });
              router.push(query ? `/ogloszenia?${query}` : "/ogloszenia");
            }}
          >
            {OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
