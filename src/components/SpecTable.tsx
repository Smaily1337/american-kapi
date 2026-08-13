import { formatMileage, formatNumber } from "@/lib/format";
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
import type { Car } from "@/lib/types";

export function SpecTable({ car }: { car: Car }) {
  const rows: [string, string][] = [
    ["Marka", car.make],
    ["Model", car.model],
    ["Wersja", car.version],
    ["Rok produkcji", String(car.year)],
    ["Przebieg", formatMileage(car.mileageMiles)],
    ["Paliwo", FUEL_LABEL[car.fuel]],
    ["Moc", car.horsepower > 0 ? `${car.horsepower} KM (szacunek)` : "brak danych Copart"],
    [
      "Pojemność",
      car.engineCcm ? `${formatNumber(car.engineCcm)} cm³` : "— (BEV)",
    ],
    ["Cylindry", car.cylinders ? String(car.cylinders) : "—"],
    ["Skrzynia", TRANS_LABEL[car.transmission]],
    ["Napęd", DRIVE_LABEL[car.drivetrain]],
    ["Nadwozie", BODY_LABEL[car.bodyType]],
    ["Kolor", car.color],
    ["Uszkodzenie", DAMAGE_LABEL[car.damage]],
    [
      "Uszkodzenie dodatkowe",
      car.secondaryDamage ? DAMAGE_LABEL[car.secondaryDamage] : "Brak",
    ],
    ["Tytuł", TITLE_LABEL[car.title]],
    ["Stan", START_LABEL[car.startCode]],
    ["Kluczyki", car.keys ? "Tak" : "Nie"],
    ["Aukcja", car.auction === "copart" ? "Copart" : "IAAI"],
    ["Lot", car.lot],
    ["VIN", car.vin],
    ["Lokalizacja", `${car.city}, ${US_STATES[car.state] ?? car.state}`],
    ["Produkcja", car.manufacturedIn],
    ["Cło 0% (USA 2026)", car.manufacturedInUSA && car.fuel !== "elektryczny" ? "Tak" : "Nie"],
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <h2 className="border-b border-line px-5 py-3 text-base font-bold">
        Szczegóły
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-4 border-b border-line px-5 py-2.5 text-sm last:border-b-0"
          >
            <dt className="text-muted">{label}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
