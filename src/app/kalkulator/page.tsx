import { StandaloneCalculator } from "@/components/StandaloneCalculator";
import { getUsdPln } from "@/lib/nbp";

export default async function CalculatorPage() {
  const { rate, date } = await getUsdPln();

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-8">
      <h1 className="text-3xl font-extrabold">Kalkulator kosztów sprowadzenia</h1>
      <p className="mt-2 max-w-3xl text-muted">
        Podaj cenę z Copart lub IAAI, pojemność, napęd i miejsce produkcji.
        Policzysz cło, akcyzę, VAT, fracht i naprawę według stawek 2026.
      </p>
      <div className="mt-6">
        <StandaloneCalculator usdPln={rate} rateDate={date} />
      </div>
    </main>
  );
}
