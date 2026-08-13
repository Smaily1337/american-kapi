"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { filtersToQuery } from "@/lib/filter";
import {
  BODY_LABEL,
  DAMAGE_LABEL,
  DRIVE_LABEL,
  FUEL_LABEL,
  START_LABEL,
  TITLE_LABEL,
  TRANS_LABEL,
  US_STATES,
} from "@/lib/labels";
import type {
  Auction,
  BodyType,
  CopartFacet,
  DamageType,
  DriveTrain,
  Fuel,
  SearchFilters,
  StartCode,
  TitleType,
} from "@/lib/types";

const YEARS = Array.from({ length: 20 }, (_, i) => 2026 - i);
const field =
  "h-10 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-orange";

type Props = {
  filters: SearchFilters;
  facetMakes?: CopartFacet[];
  facetModels?: CopartFacet[];
};

export function FilterSidebar({ filters, facetMakes, facetModels }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const makes = facetMakes?.length ? facetMakes : [];
  const models = facetModels?.length ? facetModels : [];

  function apply(next: SearchFilters) {
    const query = filtersToQuery({ ...next, sort: filters.sort, page: 1 });
    router.push(query ? `/ogloszenia?${query}` : "/ogloszenia");
  }

  function patch(partial: Partial<SearchFilters>) {
    apply({ ...filters, ...partial });
  }

  function toggleList<T extends string>(
    key: keyof SearchFilters,
    value: T,
    current?: T[],
  ) {
    const set = new Set(current ?? []);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    patch({ [key]: [...set] } as Partial<SearchFilters>);
  }

  const form = (
    <div className="space-y-5 text-sm">
      <Section title="Aukcja">
        {(
          [
            ["all", "Wszystkie"],
            ["copart", "Copart"],
            ["iaai", "IAAI"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 py-0.5">
            <input
              type="radio"
              name="aukcja"
              checked={(filters.aukcja ?? "all") === value}
              onChange={() => patch({ aukcja: value as Auction | "all" })}
              className="accent-orange"
            />
            {label}
          </label>
        ))}
      </Section>

      <Section title="Marka i model">
        <select
          className={field}
          value={filters.marka ?? ""}
          onChange={(e) =>
            patch({ marka: e.target.value || undefined, model: undefined })
          }
        >
          <option value="">Dowolna marka</option>
          {makes.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label} ({item.count.toLocaleString("pl-PL")})
            </option>
          ))}
        </select>
        <select
          className={`${field} mt-2`}
          value={filters.model ?? ""}
          onChange={(e) => patch({ model: e.target.value || undefined })}
          disabled={!filters.marka}
        >
          <option value="">
            {filters.marka
              ? models.length
                ? "Dowolny model"
                : "Ładowanie modeli…"
              : "Najpierw wybierz markę"}
          </option>
          {models.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label} ({item.count.toLocaleString("pl-PL")})
            </option>
          ))}
        </select>
      </Section>

      <Section title="Cena aukcji (USD)">
        <div className="grid grid-cols-2 gap-2">
          <input
            className={field}
            type="number"
            placeholder="Od"
            defaultValue={filters.cenaOd ?? ""}
            onBlur={(e) =>
              patch({
                cenaOd: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <input
            className={field}
            type="number"
            placeholder="Do"
            defaultValue={filters.cenaDo ?? ""}
            onBlur={(e) =>
              patch({
                cenaDo: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </Section>

      <Section title="Szacowany koszt w PL (PLN)">
        <div className="grid grid-cols-2 gap-2">
          <input
            className={field}
            type="number"
            placeholder="Od"
            defaultValue={filters.kosztOd ?? ""}
            onBlur={(e) =>
              patch({
                kosztOd: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <input
            className={field}
            type="number"
            placeholder="Do"
            defaultValue={filters.kosztDo ?? ""}
            onBlur={(e) =>
              patch({
                kosztDo: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </Section>

      <Section title="Rok produkcji">
        <div className="grid grid-cols-2 gap-2">
          <select
            className={field}
            value={filters.rokOd ?? ""}
            onChange={(e) =>
              patch({ rokOd: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">Od</option>
            {YEARS.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
          <select
            className={field}
            value={filters.rokDo ?? ""}
            onChange={(e) =>
              patch({ rokDo: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">Do</option>
            {YEARS.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Przebieg (km)">
        <div className="grid grid-cols-2 gap-2">
          <input
            className={field}
            type="number"
            placeholder="Od"
            defaultValue={filters.przebiegOd ?? ""}
            onBlur={(e) =>
              patch({
                przebiegOd: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <input
            className={field}
            type="number"
            placeholder="Do"
            defaultValue={filters.przebiegDo ?? ""}
            onBlur={(e) =>
              patch({
                przebiegDo: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </Section>

      <Section title="Paliwo">
        {Object.entries(FUEL_LABEL).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 py-0.5">
            <input
              type="checkbox"
              className="accent-orange"
              checked={filters.paliwo?.includes(value as Fuel) ?? false}
              onChange={() => toggleList("paliwo", value as Fuel, filters.paliwo)}
            />
            {label}
          </label>
        ))}
      </Section>

      <Section title="Moc (KM)">
        <div className="grid grid-cols-2 gap-2">
          <input
            className={field}
            type="number"
            placeholder="Od"
            defaultValue={filters.kmOd ?? ""}
            onBlur={(e) =>
              patch({ kmOd: e.target.value ? Number(e.target.value) : undefined })
            }
          />
          <input
            className={field}
            type="number"
            placeholder="Do"
            defaultValue={filters.kmDo ?? ""}
            onBlur={(e) =>
              patch({ kmDo: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>
      </Section>

      <Section title="Pojemność (cm³)">
        <div className="grid grid-cols-2 gap-2">
          <input
            className={field}
            type="number"
            placeholder="Od"
            defaultValue={filters.ccmOd ?? ""}
            onBlur={(e) =>
              patch({
                ccmOd: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <input
            className={field}
            type="number"
            placeholder="Do"
            defaultValue={filters.ccmDo ?? ""}
            onBlur={(e) =>
              patch({
                ccmDo: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </Section>

      <Section title="Rodzaj uszkodzenia">
        {Object.entries(DAMAGE_LABEL).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 py-0.5">
            <input
              type="checkbox"
              className="accent-orange"
              checked={filters.uszkodzenie?.includes(value as DamageType) ?? false}
              onChange={() =>
                toggleList("uszkodzenie", value as DamageType, filters.uszkodzenie)
              }
            />
            {label}
          </label>
        ))}
      </Section>

      <Section title="Tytuł / dokument">
        {Object.entries(TITLE_LABEL).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 py-0.5">
            <input
              type="checkbox"
              className="accent-orange"
              checked={filters.tytul?.includes(value as TitleType) ?? false}
              onChange={() => toggleList("tytul", value as TitleType, filters.tytul)}
            />
            {label}
          </label>
        ))}
      </Section>

      <Section title="Stan techniczny">
        {Object.entries(START_LABEL).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 py-0.5">
            <input
              type="checkbox"
              className="accent-orange"
              checked={filters.stan?.includes(value as StartCode) ?? false}
              onChange={() => toggleList("stan", value as StartCode, filters.stan)}
            />
            {label}
          </label>
        ))}
      </Section>

      <Section title="Nadwozie">
        {Object.entries(BODY_LABEL).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 py-0.5">
            <input
              type="checkbox"
              className="accent-orange"
              checked={filters.nadwozie?.includes(value as BodyType) ?? false}
              onChange={() =>
                toggleList("nadwozie", value as BodyType, filters.nadwozie)
              }
            />
            {label}
          </label>
        ))}
      </Section>

      <Section title="Skrzynia">
        {Object.entries(TRANS_LABEL).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 py-0.5">
            <input
              type="radio"
              name="skrzynia"
              className="accent-orange"
              checked={filters.skrzynia === value}
              onChange={() => patch({ skrzynia: value as SearchFilters["skrzynia"] })}
            />
            {label}
          </label>
        ))}
        <label className="flex items-center gap-2 py-0.5">
          <input
            type="radio"
            name="skrzynia"
            className="accent-orange"
            checked={!filters.skrzynia}
            onChange={() => patch({ skrzynia: undefined })}
          />
          Dowolna
        </label>
      </Section>

      <Section title="Napęd">
        {Object.entries(DRIVE_LABEL).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 py-0.5">
            <input
              type="checkbox"
              className="accent-orange"
              checked={filters.naped?.includes(value as DriveTrain) ?? false}
              onChange={() => toggleList("naped", value as DriveTrain, filters.naped)}
            />
            {label}
          </label>
        ))}
      </Section>

      <Section title="Stan USA">
        <select
          className={field}
          value={filters.stanUSA ?? ""}
          onChange={(e) => patch({ stanUSA: e.target.value || undefined })}
        >
          <option value="">Dowolny</option>
          {Object.entries(US_STATES).map(([code, name]) => (
            <option key={code} value={code}>
              {name} ({code})
            </option>
          ))}
        </select>
      </Section>

      <Section title="Dodatkowe">
        <label className="flex items-center gap-2 py-0.5">
          <input
            type="checkbox"
            className="accent-orange"
            checked={filters.usa === true}
            onChange={(e) => patch({ usa: e.target.checked ? true : undefined })}
          />
          Wyprodukowane w USA (cło 0%)
        </label>
        <label className="flex items-center gap-2 py-0.5">
          <input
            type="checkbox"
            className="accent-orange"
            checked={filters.kluczyki === true}
            onChange={(e) =>
              patch({ kluczyki: e.target.checked ? true : undefined })
            }
          />
          Tylko z kluczykami
        </label>
      </Section>

      <button
        type="button"
        onClick={() => {
          router.push("/ogloszenia");
        }}
        className="w-full rounded-md border border-line py-2 font-semibold hover:bg-page"
      >
        Wyczyść filtry
      </button>
    </div>
  );

  return (
    <div className="w-full lg:w-[300px] lg:shrink-0">
      <button
        type="button"
        className="mb-1 h-11 w-full rounded-md border border-line bg-white text-sm font-bold lg:hidden"
        onClick={() => setOpen(true)}
      >
        Filtry
      </button>
      <aside className="hidden lg:block">{form}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Zamknij filtry"
          />
          <div className="absolute inset-y-0 left-0 w-[min(100%,360px)] overflow-y-auto bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-bold">Filtry</div>
              <button
                type="button"
                className="text-sm font-semibold text-orange"
                onClick={() => setOpen(false)}
              >
                Zamknij
              </button>
            </div>
            {form}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details open className="rounded-lg bg-white p-3">
      <summary className="cursor-pointer list-none text-[13px] font-bold">
        {title}
      </summary>
      <div className="mt-3 space-y-1 text-[13px]">{children}</div>
    </details>
  );
}
