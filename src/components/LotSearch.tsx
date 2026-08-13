"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { lookupHref } from "@/lib/lookup";

type Props = {
  compact?: boolean;
  defaultValue?: string;
};

export function LotSearch({ compact = false, defaultValue = "" }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const href = lookupHref(value);
    if (href) router.push(href);
  }

  return (
    <form onSubmit={submit} className={compact ? "flex min-w-0 flex-1" : ""}>
      <label className={compact ? "flex min-w-0 flex-1 items-center gap-2" : "block"}>
        {!compact && (
          <span className="mb-1 block text-xs font-semibold text-muted">
            Znajdź auto z Copart — lot, VIN albo wklej link
          </span>
        )}
        <span className="flex min-w-0 flex-1 gap-2">
          <input
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              compact
                ? "Lot, VIN lub link Copart…"
                : "np. 46185816  ·  5YJ3E1EA8NF…  ·  copart.com/lot/…"
            }
            className="h-10 min-w-0 flex-1 rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-orange"
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-md bg-orange px-4 text-sm font-bold text-white hover:bg-orange-hover"
          >
            Szukaj
          </button>
        </span>
      </label>
    </form>
  );
}
