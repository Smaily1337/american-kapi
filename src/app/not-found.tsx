import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[640px] px-4 py-20 text-center">
      <h1 className="text-3xl font-extrabold">Nie znaleziono ogłoszenia</h1>
      <p className="mt-3 text-muted">
        Lot mógł zostać sprzedany albo filtr jest zbyt wąski.
      </p>
      <Link
        href="/ogloszenia"
        className="mt-6 inline-flex h-11 items-center rounded-md bg-orange px-5 text-sm font-bold text-white"
      >
        Wróć do wyszukiwarki
      </Link>
    </main>
  );
}
