import type {
  Auction,
  BodyType,
  DamageType,
  DriveTrain,
  Fuel,
  StartCode,
  TitleType,
  Transmission,
  UsRegion,
} from "./types";

export const AUCTION_LABEL: Record<Auction, string> = {
  copart: "Copart",
  iaai: "IAAI",
};

export const FUEL_LABEL: Record<Fuel, string> = {
  benzyna: "Benzyna",
  diesel: "Diesel",
  hybryda: "Hybryda",
  phev: "Hybryda plug-in",
  elektryczny: "Elektryczny",
};

export const BODY_LABEL: Record<BodyType, string> = {
  sedan: "Sedan",
  kombi: "Kombi",
  suv: "SUV",
  coupe: "Coupe",
  hatchback: "Hatchback",
  pickup: "Pickup",
  van: "Van",
  kabriolet: "Kabriolet",
};

export const DAMAGE_LABEL: Record<DamageType, string> = {
  front: "Przód (Front End)",
  rear: "Tył (Rear End)",
  side: "Bok (Side)",
  hail: "Grad (Hail)",
  flood: "Zalanie (Flood)",
  mechanical: "Mechaniczne",
  minor: "Drobne wgniecenia / rysy",
  "all-over": "Całe nadwozie (All Over)",
  rollover: "Dachowanie",
  vandalism: "Wandalizm",
  undercarriage: "Podwozie",
  normal: "Zużycie eksploatacyjne",
  burn: "Pożar",
};

export const TITLE_LABEL: Record<TitleType, string> = {
  salvage: "Salvage",
  clean: "Clean Title",
  rebuildable: "Rebuildable",
  flood: "Flood Title",
  cod: "Certificate of Destruction",
};

export const START_LABEL: Record<StartCode, string> = {
  runs: "Jedzie (Run & Drive)",
  starts: "Odpalany",
  stationary: "Nie odpalany",
};

export const DRIVE_LABEL: Record<DriveTrain, string> = {
  fwd: "Przedni",
  rwd: "Tylny",
  awd: "AWD",
  "4wd": "4x4",
};

export const TRANS_LABEL: Record<Transmission, string> = {
  automatyczna: "Automatyczna",
  manualna: "Manualna",
};

export const REGION_LABEL: Record<UsRegion, string> = {
  northeast: "Północny wschód",
  southeast: "Południowy wschód",
  midwest: "Midwest",
  "south-central": "Południowy środek",
  west: "Zachód",
  mountain: "Góry Skaliste",
};

export const US_STATES: Record<string, string> = {
  AL: "Alabama",
  AZ: "Arizona",
  CA: "Kalifornia",
  CO: "Kolorado",
  FL: "Floryda",
  GA: "Georgia",
  IL: "Illinois",
  KY: "Kentucky",
  LA: "Luizjana",
  MI: "Michigan",
  NJ: "New Jersey",
  NV: "Nevada",
  ND: "Dakota Północna",
  NY: "Nowy Jork",
  OH: "Ohio",
  OK: "Oklahoma",
  PA: "Pensylwania",
  TN: "Tennessee",
  TX: "Teksas",
  UT: "Utah",
  WA: "Waszyngton",
};

export const MAKES_MODELS: Record<string, string[]> = {
  Audi: ["A4", "A6", "Q7", "e-tron"],
  BMW: ["330i", "X5", "M4", "i4"],
  Cadillac: ["Escalade"],
  Chevrolet: ["Camaro", "Silverado", "Tahoe", "Corvette"],
  Dodge: ["Challenger", "Durango", "Ram 1500", "Ram 2500"],
  Ford: ["F-150", "Mustang", "Explorer", "Bronco", "Mustang Mach-E"],
  GMC: ["Sierra"],
  Honda: ["Accord", "CR-V", "Civic"],
  Hyundai: ["Palisade"],
  Jeep: ["Wrangler", "Grand Cherokee", "Gladiator"],
  Kia: ["Telluride"],
  Lexus: ["RX 350", "IS 300"],
  Lincoln: ["Navigator"],
  "Mercedes-Benz": ["C 300", "GLE", "AMG GT"],
  Nissan: ["Altima"],
  Porsche: ["911", "Macan"],
  Tesla: ["Model 3", "Model Y", "Model S", "Cybertruck"],
  Toyota: ["Camry", "RAV4", "Tundra"],
  Volkswagen: ["Atlas"],
};

export const POPULAR_MAKES = [
  "BMW",
  "Mercedes-Benz",
  "Tesla",
  "Ford",
  "Jeep",
  "Chevrolet",
  "Audi",
  "Toyota",
  "Porsche",
  "Dodge",
];
