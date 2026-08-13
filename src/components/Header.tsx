"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LotSearch } from "@/components/LotSearch";

const NAV = [
  { href: "/ogloszenia", label: "Ogłoszenia" },
  { href: "/kalkulator", label: "Kalkulator" },
  { href: "/jak-to-dziala", label: "Jak to działa" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-3 px-3 sm:h-[76px] sm:px-4">
        <Link href="/" className="flex shrink-0 items-center" onClick={() => setOpen(false)}>
          <Image
            src="/logo.png"
            alt="American KAPI — Auto Import z USA"
            width={231}
            height={224}
            className="h-11 w-auto bg-transparent sm:h-[64px]"
            priority
            unoptimized
          />
        </Link>
        <div className="hidden min-w-0 max-w-xl flex-1 md:block">
          <LotSearch compact />
        </div>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-navy lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-orange">
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-navy lg:hidden"
          aria-label={open ? "Zamknij menu" : "Otwórz menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="text-xl leading-none">{open ? "×" : "☰"}</span>
        </button>
      </div>
      <div className="border-t border-line px-3 py-2 md:hidden">
        <LotSearch compact />
      </div>
      {open && (
        <div className="border-t border-line bg-white px-3 py-3 lg:hidden">
          <nav className="flex flex-col gap-1 text-sm font-semibold text-navy">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2.5 hover:bg-page"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-navy text-white">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <div className="inline-block rounded-md bg-white px-2 py-1">
            <Image
              src="/logo.png"
              alt="American KAPI"
              width={231}
              height={224}
              className="h-16 w-auto bg-transparent"
              unoptimized
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-white/75">
            American KAPI — auto import z USA. Wyszukiwarka Copart i IAAI oraz
            kalkulator cła, akcyzy, VAT i transportu do Polski.
          </p>
        </div>
        <div>
          <div className="text-sm font-bold">Aukcje</div>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li>
              <Link href="/ogloszenia?aukcja=copart" className="hover:text-white">
                Copart
              </Link>
            </li>
            <li>
              <Link href="/ogloszenia?aukcja=iaai" className="hover:text-white">
                IAAI
              </Link>
            </li>
            <li>
              <Link href="/ogloszenia?usa=1" className="hover:text-white">
                Cło 0% (produkcja USA)
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-bold">Narzędzia</div>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li>
              <Link href="/kalkulator" className="hover:text-white">
                Kalkulator kosztów
              </Link>
            </li>
            <li>
              <Link href="/jak-to-dziala" className="hover:text-white">
                Podatki i stawki 2026
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-bold">Informacja</div>
          <p className="mt-3 text-sm leading-6 text-white/75">
            Szacunki są orientacyjne. Ostateczne cło, akcyza i VAT ustala urząd
            celny na podstawie wartości celnej CIF, VIN i dokumentacji
            pochodzenia.
          </p>
        </div>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-xs text-white/60">
        American KAPI · Auto Import z USA · Copart · IAAI · kurs NBP
      </div>
    </footer>
  );
}
