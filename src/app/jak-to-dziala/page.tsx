export default function HowItWorksPage() {
  return (
    <main className="mx-auto w-full max-w-[860px] px-4 py-10">
      <h1 className="text-3xl font-extrabold">Jak liczymy koszt sprowadzenia</h1>
      <p className="mt-3 text-muted">
        Stawki aktualne na sierpień 2026. Kalkulacja jest orientacyjna — urząd
        celny ustala wartość celną CIF na podstawie faktury, transportu i VIN.
      </p>

      <section className="mt-8 rounded-lg border border-line bg-white p-5">
        <h2 className="text-lg font-bold">1. Wartość celna (CIF)</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Cena na aukcji + opłaty Copart/IAAI (buyer fee, gate, internet bid) +
          transport do portu USA + fracht morski + ubezpieczenie. Od tej kwoty
          idą podatki.
        </p>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-white p-5">
        <h2 className="text-lg font-bold">2. Cło — od 1 lipca 2026</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
          <li>0% — samochód osobowy lub pickup wyprodukowany w USA (nie BEV)</li>
          <li>10% — osobowe spoza USA (Meksyk, Kanada, Niemcy, Japonia, Korea)</li>
          <li>22% — pickup CN 8704 spoza USA</li>
          <li>0% — zabytek 30+ lat</li>
          <li>
            Elektryki nie wchodzą w preferencję 0% cła z umowy UE–USA 2026
          </li>
        </ul>
        <p className="mt-2 text-sm leading-6 text-muted">
          Liczy się fabryka z VIN, nie marka i nie miejsce aukcji.
        </p>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-white p-5">
        <h2 className="text-lg font-bold">3. Akcyza (Polska)</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
          <li>Benzyna / diesel ≤ 2000 cm³ — 3,1%</li>
          <li>Benzyna / diesel &gt; 2000 cm³ — 18,6%</li>
          <li>Hybryda ≤ 2000 cm³ — 1,55%</li>
          <li>Hybryda / PHEV &gt; 2000 cm³ — 9,3%</li>
          <li>PHEV ≤ 2000 cm³ — 0% (zwolnienie do 2029)</li>
          <li>Elektryczny (BEV) — 0%</li>
          <li>Pickup CN 8704 — bez akcyzy od samochodów osobowych</li>
        </ul>
        <p className="mt-2 text-sm leading-6 text-muted">
          Podstawa: wartość celna + cło.
        </p>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-white p-5">
        <h2 className="text-lg font-bold">4. VAT</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
          <li>Gdynia — 23% od wartości celnej + cło + akcyza</li>
          <li>
            Rotterdam — 21% od wartości celnej + cło; akcyzę płacisz później w
            Polsce
          </li>
        </ul>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-white p-5">
        <h2 className="text-lg font-bold">5. Reszta kosztów</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Agencja celna, opłaty portowe, tłumaczenia, przystosowanie świateł i
          prędkościomierza do EU, badanie techniczne, rejestracja oraz naprawa
          po szkodzie aukcyjnej. Kurs USD/PLN bierzemy z tabeli A NBP.
        </p>
      </section>
    </main>
  );
}
