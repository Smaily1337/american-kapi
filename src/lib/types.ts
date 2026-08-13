export type Auction = "copart" | "iaai";

export type Fuel =
  | "benzyna"
  | "diesel"
  | "hybryda"
  | "phev"
  | "elektryczny";

export type BodyType =
  | "sedan"
  | "kombi"
  | "suv"
  | "coupe"
  | "hatchback"
  | "pickup"
  | "van"
  | "kabriolet";

export type DamageType =
  | "front"
  | "rear"
  | "side"
  | "hail"
  | "flood"
  | "mechanical"
  | "minor"
  | "all-over"
  | "rollover"
  | "vandalism"
  | "undercarriage"
  | "normal"
  | "burn";

export type TitleType =
  | "salvage"
  | "clean"
  | "rebuildable"
  | "flood"
  | "cod";

export type DriveTrain = "fwd" | "rwd" | "awd" | "4wd";

export type Transmission = "automatyczna" | "manualna";

export type StartCode = "runs" | "starts" | "stationary";

export type Port = "gdynia" | "rotterdam";

export type UsRegion =
  | "northeast"
  | "southeast"
  | "midwest"
  | "south-central"
  | "west"
  | "mountain";

export interface Car {
  id: string;
  lot: string;
  vin: string;
  auction: Auction;
  make: string;
  model: string;
  version: string;
  year: number;
  mileageMiles: number;
  fuel: Fuel;
  horsepower: number;
  engineCcm: number;
  cylinders: number;
  transmission: Transmission;
  drivetrain: DriveTrain;
  bodyType: BodyType;
  color: string;
  damage: DamageType;
  secondaryDamage?: DamageType;
  title: TitleType;
  keys: boolean;
  startCode: StartCode;
  currentBidUsd: number;
  buyNowUsd?: number;
  estimatedRetailUsd: number;
  estimatedRepairUsd: number;
  city: string;
  state: string;
  region: UsRegion;
  saleDate: string;
  images: string[];
  manufacturedInUSA: boolean;
  manufacturedIn: string;
  highlights: string[];
}

export interface SearchFilters {
  q?: string;
  aukcja?: Auction | "all";
  marka?: string;
  model?: string;
  cenaOd?: number;
  cenaDo?: number;
  kosztOd?: number;
  kosztDo?: number;
  rokOd?: number;
  rokDo?: number;
  przebiegOd?: number;
  przebiegDo?: number;
  paliwo?: Fuel[];
  kmOd?: number;
  kmDo?: number;
  ccmOd?: number;
  ccmDo?: number;
  uszkodzenie?: DamageType[];
  tytul?: TitleType[];
  stan?: StartCode[];
  nadwozie?: BodyType[];
  skrzynia?: Transmission;
  naped?: DriveTrain[];
  stanUSA?: string;
  kluczyki?: boolean;
  usa?: boolean;
  sort?: SortKey;
  page?: number;
}

export interface CopartFacet {
  label: string;
  value: string;
  count: number;
}

export interface CopartSearchResult {
  cars: Car[];
  total: number;
  page: number;
  size: number;
  facets: {
    makes: CopartFacet[];
    models: CopartFacet[];
    years: CopartFacet[];
    damage: CopartFacet[];
    body: CopartFacet[];
    fuel: CopartFacet[];
  };
}

export type SortKey =
  | "trafne"
  | "cena-asc"
  | "cena-desc"
  | "rok-desc"
  | "koszt-asc"
  | "okazja";

export interface CostInput {
  bidUsd: number;
  repairUsd: number;
  port: Port;
  usdPln: number;
}

export interface CostLine {
  key: string;
  label: string;
  amountPln: number;
  amountUsd?: number;
  hint?: string;
}

export interface CostBreakdown {
  usdPln: number;
  port: Port;
  bidUsd: number;
  buyerFeeUsd: number;
  extraAuctionFeesUsd: number;
  inlandUsd: number;
  oceanUsd: number;
  insuranceUsd: number;
  cifUsd: number;
  cifPln: number;
  dutyRate: number;
  dutyPln: number;
  exciseRate: number;
  excisePln: number;
  vatRate: number;
  vatPln: number;
  brokerPln: number;
  portFeesPln: number;
  documentsPln: number;
  conversionPln: number;
  registrationPln: number;
  repairPln: number;
  taxesPln: number;
  transportPln: number;
  landedWithoutRepairPln: number;
  totalPln: number;
  marketPln: number;
  savingsPln: number;
  dealScore: number;
  lines: CostLine[];
}
