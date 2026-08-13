"use client";

import Link from "next/link";
import { filtersToQuery } from "@/lib/filter";
import type { SearchFilters } from "@/lib/types";

export function Pagination({
  filters,
  total,
  size,
}: {
  filters: SearchFilters;
  total: number;
  size: number;
}) {
  const page = filters.page ?? 1;
  const pages = Math.max(1, Math.ceil(total / size));
  if (pages <= 1) return null;

  const href = (next: number) => {
    const query = filtersToQuery({ ...filters, page: next });
    return query ? `/ogloszenia?${query}` : "/ogloszenia";
  };

  const windowPages = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (item) => item === 1 || item === pages || Math.abs(item - page) <= 2,
  );

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-1">
      {page > 1 && (
        <Link
          href={href(page - 1)}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold"
        >
          Poprzednia
        </Link>
      )}
      {windowPages.map((item, index) => {
        const prev = windowPages[index - 1];
        return (
          <span key={item} className="contents">
            {prev && item - prev > 1 && (
              <span className="px-1 text-muted">…</span>
            )}
            <Link
              href={href(item)}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${
                item === page
                  ? "bg-orange text-white"
                  : "border border-line bg-white"
              }`}
            >
              {item}
            </Link>
          </span>
        );
      })}
      {page < pages && (
        <Link
          href={href(page + 1)}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold"
        >
          Następna
        </Link>
      )}
    </nav>
  );
}
