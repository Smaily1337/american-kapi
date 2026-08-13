import { Impit } from "impit";
import { CookieJar } from "tough-cookie";
import { parseCopartLookup } from "./lookup";
import type {
  BodyType,
  Car,
  CopartFacet,
  CopartSearchResult,
  DamageType,
  DriveTrain,
  Fuel,
  SearchFilters,
  StartCode,
  TitleType,
  UsRegion,
} from "./types";

const SEARCH_URL = "https://www.copart.com/public/lots/search";
const DETAILS_URL = "https://www.copart.com/public/data/lotdetails/solr";
const PAGE_SIZE = 20;

type RawLot = Record<string, unknown>;

let jar = new CookieJar();
let client: Impit | null = null;
let cookieTs = 0;
let cookiePromise: Promise<void> | null = null;

function getClient(): Impit {
  if (!client) {
    client = new Impit({
      browser: "chrome131",
      timeout: 30000,
      ignoreTlsErrors: true,
      cookieJar: jar,
      headers: {
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
  }
  return client;
}

function resetClient() {
  jar = new CookieJar();
  client = null;
  cookieTs = 0;
  cookiePromise = null;
}

async function refreshCookies(): Promise<void> {
  const response = await getClient().fetch("https://www.copart.com/", {
    headers: { Accept: "text/html,application/xhtml+xml" },
  });
  await response.text();
  if (response.status >= 400) {
    throw new Error(`Copart homepage ${response.status}`);
  }
  cookieTs = Date.now();
}

async function ensureCookies(force = false): Promise<void> {
  if (!force && cookieTs && Date.now() - cookieTs < 8 * 60 * 1000) return;
  if (force) resetClient();
  if (!cookiePromise) {
    cookiePromise = refreshCookies().finally(() => {
      cookiePromise = null;
    });
  }
  await cookiePromise;
}

function isJsonResponse(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

async function copartPost(
  url: string,
  body: URLSearchParams,
  referer: string,
): Promise<unknown> {
  const send = async () => {
    const response = await getClient().fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        Origin: "https://www.copart.com",
        Referer: referer,
      },
      body,
    });
    return { status: response.status, body: await response.text() };
  };

  await ensureCookies();
  let result = await send();
  if (result.status === 403 || result.status === 401 || !isJsonResponse(result.body)) {
    await ensureCookies(true);
    result = await send();
  }
  if (!isJsonResponse(result.body)) {
    throw new Error(`Copart zwrócił nie-JSON (${result.status})`);
  }
  return JSON.parse(result.body);
}

async function copartGet(url: string, referer: string): Promise<unknown> {
  const send = async () => {
    const response = await getClient().fetch(url, {
      headers: {
        Accept: "application/json",
        Referer: referer,
      },
    });
    return { status: response.status, body: await response.text() };
  };
  await ensureCookies();
  let result = await send();
  if (result.status === 403 || !isJsonResponse(result.body)) {
    await ensureCookies(true);
    result = await send();
  }
  if (!isJsonResponse(result.body)) {
    throw new Error(`Copart lot details nie-JSON (${result.status})`);
  }
  return JSON.parse(result.body);
}

const DAMAGE_CODE: Partial<Record<DamageType, string>> = {
  front: "DAMAGECODE_FR",
  rear: "DAMAGECODE_RR",
  side: "DAMAGECODE_SD",
  hail: "DAMAGECODE_HL",
  flood: "DAMAGECODE_WA",
  mechanical: "DAMAGECODE_MC",
  minor: "DAMAGECODE_MN",
  "all-over": "DAMAGECODE_AO",
  rollover: "DAMAGECODE_RO",
  vandalism: "DAMAGECODE_VA",
  undercarriage: "DAMAGECODE_UN",
  normal: "DAMAGECODE_NW",
  burn: "DAMAGECODE_BN",
};

const TITLE_CODE: Partial<Record<TitleType, string>> = {
  salvage: "TITLEGROUP_S",
  clean: "TITLEGROUP_C",
  cod: "TITLEGROUP_J",
  flood: "TITLEGROUP_F",
  rebuildable: "TITLEGROUP_R",
};

const FUEL_QUERY: Partial<Record<Fuel, string>> = {
  benzyna: 'fuel_type_desc:"GAS"',
  diesel: 'fuel_type_desc:"DIESEL"',
  hybryda: 'fuel_type_desc:"HYBRID"',
  phev: 'fuel_type_desc:"PLUG-IN"',
  elektryczny: 'fuel_type_desc:"ELECTRIC"',
};

const BODY_QUERY: Partial<Record<BodyType, string>> = {
  sedan: 'body_style:"SEDAN"',
  kombi: 'body_style:"STATION WAGON"',
  suv: 'body_style:"SPORT UTILITY VEHICLE"',
  coupe: 'body_style:"COUPE"',
  hatchback: 'body_style:"HATCHBACK"',
  pickup: 'body_style:"PICKUP"',
  van: 'body_style:"VAN"',
  kabriolet: 'body_style:"CONVERTIBLE"',
};

const DRIVE_QUERY: Partial<Record<DriveTrain, string>> = {
  fwd: 'drive:"FRONT-WHEEL DRIVE"',
  rwd: 'drive:"REAR-WHEEL DRIVE"',
  awd: 'drive:"ALL WHEEL DRIVE"',
  "4wd": 'drive:"FOUR WHEEL DRIVE"',
};

function buildSearchBody(filters: SearchFilters): URLSearchParams {
  const page = Math.max(0, (filters.page ?? 1) - 1);
  const params = new URLSearchParams();
  const q = filters.q?.trim();
  params.set("query", q || "*");
  params.set("page", String(page));
  params.set("size", String(PAGE_SIZE));
  params.set("start", String(page * PAGE_SIZE));
  params.set("watchListOnly", "false");
  params.set("freeFormSearch", q ? "true" : "false");
  params.set("hideImages", "false");

  if (filters.sort === "rok-desc") {
    params.set("sort", "lot_year desc");
  } else if (filters.sort === "cena-asc") {
    params.set("sort", "current_bid asc");
  } else if (filters.sort === "cena-desc") {
    params.set("sort", "current_bid desc");
  } else {
    params.set("sort", "auction_date_type desc,auction_date_utc asc");
  }

  const misc = ["#VehicleTypeCode:VEHTYPE_V"];
  if (filters.stan?.includes("runs")) {
    misc.push("#LotConditionCode:CERT-D");
  }
  params.append("filter[MISC]", misc.join(","));

  if (filters.marka) {
    params.append("filter[MAKE]", `lot_make_desc:"${filters.marka.toUpperCase()}"`);
    params.set("includeTagByField[MAKE]", "{!tag=MAKE}");
  }
  if (filters.model) {
    params.append("filter[MODL]", `lot_model_desc:"${filters.model.toUpperCase()}"`);
    params.set("includeTagByField[MODL]", "{!tag=MODL}");
  }

  const rokOd = filters.rokOd ?? 1990;
  const rokDo = filters.rokDo ?? 2027;
  if (filters.rokOd || filters.rokDo) {
    params.append("filter[YEAR]", `lot_year:[${rokOd} TO ${rokDo}]`);
    params.set("includeTagByField[YEAR]", "{!tag=YEAR}");
  }

  if (filters.uszkodzenie?.[0]) {
    const code = DAMAGE_CODE[filters.uszkodzenie[0]];
    if (code) {
      params.append("filter[PRID]", `damage_type_code:${code}`);
      params.set("includeTagByField[PRID]", "{!tag=PRID}");
    }
  }
  if (filters.tytul?.[0]) {
    const code = TITLE_CODE[filters.tytul[0]];
    if (code) {
      params.append("filter[TITL]", `title_group_code:${code}`);
      params.set("includeTagByField[TITL]", "{!tag=TITL}");
    }
  }
  if (filters.paliwo?.[0]) {
    const query = FUEL_QUERY[filters.paliwo[0]];
    if (query) {
      params.append("filter[FUEL]", query);
      params.set("includeTagByField[FUEL]", "{!tag=FUEL}");
    }
  }
  if (filters.nadwozie?.[0]) {
    const query = BODY_QUERY[filters.nadwozie[0]];
    if (query) {
      params.append("filter[BODY]", query);
      params.set("includeTagByField[BODY]", "{!tag=BODY}");
    }
  }
  if (filters.naped?.[0]) {
    const query = DRIVE_QUERY[filters.naped[0]];
    if (query) {
      params.append("filter[DRIV]", query);
    }
  }
  if (filters.skrzynia) {
    const value = filters.skrzynia === "manualna" ? "MANUAL" : "AUTOMATIC";
    params.append("filter[TMTP]", `transmission_type:"${value}"`);
  }

  if (filters.przebiegOd !== undefined || filters.przebiegDo !== undefined) {
    const milesOd =
      filters.przebiegOd !== undefined
        ? Math.round(filters.przebiegOd / 1.60934)
        : "*";
    const milesDo =
      filters.przebiegDo !== undefined
        ? Math.round(filters.przebiegDo / 1.60934)
        : "*";
    params.append(
      "filter[ODM]",
      `odometer_reading_received:[${milesOd} TO ${milesDo}]`,
    );
  }

  return params;
}

function str(lot: RawLot, key: string): string {
  const value = lot[key];
  return value == null ? "" : String(value).trim();
}

function num(lot: RawLot, key: string): number {
  const value = lot[key];
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nested(lot: RawLot, key: string): RawLot {
  const value = lot[key];
  return value && typeof value === "object" ? (value as RawLot) : {};
}

function mapFuel(raw: string): Fuel {
  const value = raw.toUpperCase();
  if (value.includes("ELECTRIC")) return "elektryczny";
  if (value.includes("PLUG") || value.includes("PHEV")) return "phev";
  if (value.includes("HYBRID") || value.includes("HEV")) return "hybryda";
  if (value.includes("DIESEL")) return "diesel";
  return "benzyna";
}

function mapDamage(raw: string): DamageType {
  const value = raw.toUpperCase();
  if (value.includes("FRONT")) return "front";
  if (value.includes("REAR")) return "rear";
  if (value.includes("SIDE")) return "side";
  if (value.includes("HAIL")) return "hail";
  if (value.includes("WATER") || value.includes("FLOOD")) return "flood";
  if (value.includes("MECH")) return "mechanical";
  if (value.includes("MINOR") || value.includes("DENT")) return "minor";
  if (value.includes("ALL OVER")) return "all-over";
  if (value.includes("ROLLOVER")) return "rollover";
  if (value.includes("VANDAL")) return "vandalism";
  if (value.includes("UNDER")) return "undercarriage";
  if (value.includes("BURN") || value.includes("FIRE")) return "burn";
  if (value.includes("NORMAL") || value.includes("WEAR")) return "normal";
  return "minor";
}

function mapTitle(raw: string): TitleType {
  const value = raw.toUpperCase();
  if (value.includes("FLOOD")) return "flood";
  if (value.includes("CLEAN")) return "clean";
  if (value.includes("REBUILD")) return "rebuildable";
  if (value.includes("DESTRUCT") || value.includes("NON REPAIR")) return "cod";
  return "salvage";
}

function mapStart(raw: string): StartCode {
  const value = raw.toUpperCase();
  if (value.includes("RUN")) return "runs";
  if (value.includes("START")) return "starts";
  return "stationary";
}

function mapBody(raw: string, cat: string): BodyType {
  const value = `${raw} ${cat}`.toUpperCase();
  if (value.includes("PICKUP") || value.includes("VEHCAT_P")) return "pickup";
  if (value.includes("SUV") || value.includes("SPORT UTILITY") || value.includes("VEHCAT_S")) {
    return "suv";
  }
  if (value.includes("COUPE")) return "coupe";
  if (value.includes("HATCH")) return "hatchback";
  if (value.includes("VAN")) return "van";
  if (value.includes("CONVERT") || value.includes("CABRIO")) return "kabriolet";
  if (value.includes("WAGON") || value.includes("KOMBI")) return "kombi";
  return "sedan";
}

function mapDrive(raw: string): DriveTrain {
  const value = raw.toUpperCase();
  if (value.includes("FOUR") || value.includes("4WD") || value.includes("4X4")) return "4wd";
  if (value.includes("ALL WHEEL") || value.includes("AWD")) return "awd";
  if (value.includes("REAR")) return "rwd";
  return "fwd";
}

function mapRegion(state: string): UsRegion {
  const west = ["CA", "OR", "WA", "NV", "AZ", "HI", "AK"];
  const mountain = ["CO", "UT", "NM", "ID", "MT", "WY"];
  const southCentral = ["TX", "OK", "AR", "LA"];
  const southeast = ["FL", "GA", "NC", "SC", "AL", "MS", "TN", "KY", "VA"];
  const midwest = ["IL", "OH", "MI", "IN", "WI", "MN", "MO", "IA", "KS", "NE", "ND", "SD"];
  if (west.includes(state)) return "west";
  if (mountain.includes(state)) return "mountain";
  if (southCentral.includes(state)) return "south-central";
  if (southeast.includes(state)) return "southeast";
  if (midwest.includes(state)) return "midwest";
  return "northeast";
}

function parseEngine(egn: string): { ccm: number; cylinders: number } {
  const liters = egn.match(/([\d.]+)\s*L/i);
  const cyl = egn.match(/\b(\d{1,2})\s*$/);
  const cylinders = cyl ? Number(cyl[1]) : 0;
  return {
    ccm: liters ? Math.round(Number(liters[1]) * 1000) : 0,
    cylinders: cylinders >= 3 && cylinders <= 16 ? cylinders : 0,
  };
}

function vinOrigin(vin: string): { usa: boolean; country: string } {
  const first = vin.charAt(0).toUpperCase();
  if (["1", "4", "5"].includes(first)) return { usa: true, country: "USA" };
  if (first === "2") return { usa: false, country: "Kanada" };
  if (first === "3") return { usa: false, country: "Meksyk" };
  if (first === "J") return { usa: false, country: "Japonia" };
  if (first === "W") return { usa: false, country: "Niemcy" };
  if (first === "K") return { usa: false, country: "Korea Płd." };
  if (first === "S") return { usa: false, country: "Wielka Brytania" };
  if (first === "V") return { usa: false, country: "Francja / Hiszpania" };
  return { usa: false, country: "poza USA" };
}

function imagesFromThumb(thumb: string): string[] {
  if (!thumb) return [];
  return [thumb.replace("_thb.", "_ful.").replace("_thb.jpg", "_ful.jpg")];
}

type CopartImageRow = {
  fullUrl?: string;
  highResUrl?: string;
  thumbnailUrl?: string;
  imageTypeEnum?: string;
  imageTypeCode?: string;
  imageSeqNumber?: number;
};

async function fetchCopartLotImages(lot: string): Promise<string[]> {
  const collect = (payload: unknown): string[] => {
    const data = (payload as { data?: { imagesList?: unknown } })?.data?.imagesList;
    const rows: CopartImageRow[] = Array.isArray(data)
      ? data
      : Array.isArray((data as { content?: CopartImageRow[] } | undefined)?.content)
        ? ((data as { content: CopartImageRow[] }).content)
        : [];
    return [
      ...new Set(
        [...rows]
          .sort((a, b) => (a.imageSeqNumber ?? 0) - (b.imageSeqNumber ?? 0))
          .filter((row) => {
            const kind = (row.imageTypeEnum ?? row.imageTypeCode ?? "IMAGE").toUpperCase();
            return !kind.includes("VIDEO") && !kind.includes("AUDIO") && !kind.includes("SOUND");
          })
          .map((row) => row.fullUrl || row.highResUrl || row.thumbnailUrl)
          .filter((url): url is string => Boolean(url)),
      ),
    ];
  };

  try {
    const payload = await copartGet(
      `${DETAILS_URL}/lotImages/${lot}`,
      `https://www.copart.com/lot/${lot}`,
    );
    const urls = collect(payload);
    if (urls.length) return urls;
  } catch {
    /* retry below */
  }
  try {
    await ensureCookies(true);
    const payload = await copartGet(
      `${DETAILS_URL}/lotImages/${lot}`,
      `https://www.copart.com/lot/${lot}`,
    );
    return collect(payload);
  } catch {
    return [];
  }
}

function estimateRepair(lot: RawLot, damage: DamageType, retail: number): number {
  const reported = num(lot, "rc") || num(lot, "lspa");
  if (reported > 0) return Math.round(reported);
  const rates: Record<DamageType, number> = {
    minor: 0.06,
    normal: 0.04,
    mechanical: 0.12,
    side: 0.18,
    rear: 0.16,
    front: 0.22,
    hail: 0.14,
    undercarriage: 0.18,
    "all-over": 0.32,
    rollover: 0.4,
    flood: 0.28,
    vandalism: 0.12,
    burn: 0.5,
  };
  return Math.round(Math.max(retail, 4000) * (rates[damage] ?? 0.15));
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[\s/-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function displayMake(value: string): string {
  const upper = value.toUpperCase();
  if (["BMW", "GMC", "RAM", "VW", "MINI", "KIA"].includes(upper)) return upper;
  return titleCase(value);
}

export function mapCopartLot(lot: RawLot): Car {
  const dynamic = nested(lot, "dynamicLotDetails");
  const lotNumber = str(lot, "lotNumberStr") || String(num(lot, "ln"));
  const make = displayMake(str(lot, "mkn") || "Unknown");
  const model = titleCase(str(lot, "lm") || str(lot, "lmg") || "");
  const version = titleCase(str(lot, "ltd") || str(lot, "lmtd") || "");
  const year = num(lot, "lcy") || new Date().getFullYear();
  const vin = str(lot, "fv");
  const origin = vinOrigin(vin);
  const fuel = mapFuel(str(lot, "ft"));
  const damage = mapDamage(str(lot, "dd"));
  const engine = parseEngine(str(lot, "egn"));
  const retail = Math.max(num(lot, "la"), num(lot, "lotPlugAcv"), 0);
  const currentBid = Math.max(
    num(dynamic, "currentBid"),
    num(lot, "hb"),
    0,
  );
  const buyNow = num(dynamic, "buyTodayBid") || num(lot, "bnp");
  const auctionMs = num(lot, "ad") || num(lot, "lad") || Date.now();
  const state = str(lot, "locState") || str(lot, "ts");
  const body = mapBody(str(lot, "bstl"), str(lot, "vehicleCatCode"));
  const start = mapStart(str(lot, "lcd"));
  const keys = str(lot, "hk").toUpperCase() === "YES";
  const thumb = str(lot, "tims");
  const highlights = [
    str(lot, "lcd"),
    str(lot, "tgd") || str(lot, "td"),
    origin.usa && fuel !== "elektryczny" ? "Cło 0%" : "",
    keys ? "Kluczyki" : "Brak kluczyków",
  ].filter(Boolean);

  return {
    id: lotNumber,
    lot: lotNumber,
    vin: vin || "—",
    auction: "copart",
    make,
    model,
    version,
    year,
    mileageMiles: Math.max(0, num(lot, "orr")),
    fuel,
    horsepower: engine.ccm
      ? Math.round((engine.ccm / 1000) * (fuel === "elektryczny" ? 150 : 110))
      : fuel === "elektryczny"
        ? 300
        : 0,
    engineCcm: engine.ccm,
    cylinders: engine.cylinders || num(lot, "cy"),
    transmission: str(lot, "tsmn").toUpperCase().includes("MANUAL")
      ? "manualna"
      : "automatyczna",
    drivetrain: mapDrive(str(lot, "drv")),
    bodyType: body,
    color: titleCase(str(lot, "clr") || "—"),
    damage,
    title: mapTitle(str(lot, "tgd") || str(lot, "td")),
    keys,
    startCode: start,
    currentBidUsd: currentBid,
    buyNowUsd: buyNow > 0 ? buyNow : undefined,
    estimatedRetailUsd: retail > 0 ? retail : Math.max(currentBid * 2, 5000),
    estimatedRepairUsd: estimateRepair(lot, damage, retail),
    city: titleCase(str(lot, "locCity") || str(lot, "yn")),
    state,
    region: mapRegion(state),
    saleDate: new Date(auctionMs).toISOString(),
    images: imagesFromThumb(thumb),
    manufacturedInUSA: origin.usa,
    manufacturedIn: origin.country,
    highlights,
  };
}

function parseFacets(
  facetFields: unknown,
  code: string,
): CopartFacet[] {
  if (!Array.isArray(facetFields)) return [];
  const field = facetFields.find(
    (item) => item && item.quickPickCode === code,
  ) as { facetCounts?: { displayName?: string; query?: string; count?: number }[] } | undefined;
  const seen = new Set<string>();
  const out: CopartFacet[] = [];
  for (const row of field?.facetCounts ?? []) {
    const query = row.query ?? "";
    const quoted = query.match(/:"([^"]+)"/);
    const plain = query.match(/:([^\s"]+)\s*$/);
    const value = (quoted?.[1] || plain?.[1] || row.displayName || "").trim();
    if (!value || seen.has(value.toUpperCase())) continue;
    seen.add(value.toUpperCase());
    out.push({
      label: titleCase(row.displayName || value),
      value,
      count: row.count ?? 0,
    });
  }
  return out.sort((a, b) => b.count - a.count);
}

function applyLocalFilters(cars: Car[], filters: SearchFilters): Car[] {
  return cars.filter((car) => {
    if (filters.cenaOd !== undefined && car.currentBidUsd < filters.cenaOd) return false;
    if (filters.cenaDo !== undefined && car.currentBidUsd > filters.cenaDo) return false;
    if (filters.kluczyki !== undefined && car.keys !== filters.kluczyki) return false;
    if (filters.usa !== undefined && car.manufacturedInUSA !== filters.usa) return false;
    if (filters.stanUSA && car.state !== filters.stanUSA) return false;
    if (filters.ccmOd !== undefined && car.engineCcm < filters.ccmOd) return false;
    if (filters.ccmDo !== undefined && car.engineCcm > filters.ccmDo) return false;
    if (filters.kmOd !== undefined && car.horsepower > 0 && car.horsepower < filters.kmOd) {
      return false;
    }
    if (filters.kmDo !== undefined && car.horsepower > 0 && car.horsepower > filters.kmDo) {
      return false;
    }
    return true;
  });
}

async function fetchCopartLotDetails(lot: string): Promise<Car | null> {
  try {
    const payload = (await copartGet(
      `${DETAILS_URL}/${lot}`,
      `https://www.copart.com/lot/${lot}`,
    )) as { data?: { lotDetails?: RawLot } };
    const details = payload.data?.lotDetails;
    if (details && (details.ln || details.lotNumberStr)) {
      const car = mapCopartLot(details);
      const gallery = await fetchCopartLotImages(lot);
      if (gallery.length) car.images = gallery;
      return car;
    }
  } catch {
    return null;
  }
  return null;
}

const lotCache = new Map<string, { car: Car; at: number }>();
const lotInflight = new Map<string, Promise<Car | null>>();

async function loadCopartLot(lot: string): Promise<Car | null> {
  let car = await fetchCopartLotDetails(lot);
  if (!car) {
    car =
      (await searchCopart({ q: lot, page: 1 })).cars.find((item) => item.lot === lot) ??
      null;
  }
  if (!car) return null;
  if (car.images.length <= 1) {
    const gallery = await fetchCopartLotImages(lot);
    if (gallery.length) car.images = gallery;
  }
  lotCache.set(lot, { car, at: Date.now() });
  return car;
}

export async function getCopartLot(lot: string): Promise<Car | null> {
  const cached = lotCache.get(lot);
  if (cached && Date.now() - cached.at < 60_000 && cached.car.images.length > 1) {
    return cached.car;
  }
  const pending = lotInflight.get(lot);
  if (pending) return pending;
  const request = loadCopartLot(lot).finally(() => lotInflight.delete(lot));
  lotInflight.set(lot, request);
  return request;
}

export async function searchCopart(
  filters: SearchFilters,
): Promise<CopartSearchResult> {
  const parsed = filters.q ? parseCopartLookup(filters.q) : {};
  const searchFilters = parsed.lot ? { ...filters, q: parsed.lot } : filters;
  const body = buildSearchBody(searchFilters);
  const payload = (await copartPost(
    SEARCH_URL,
    body,
    "https://www.copart.com/lotSearchResults/",
  )) as {
    returnCode?: number;
    data?: {
      results?: {
        totalElements?: number;
        content?: RawLot[];
        facetFields?: unknown;
      };
    };
  };
  const results = payload.data?.results;
  const content = results?.content ?? [];
  let cars = applyLocalFilters(content.map(mapCopartLot), searchFilters);
  if (parsed.lot) {
    const lotCar = await fetchCopartLotDetails(parsed.lot);
    if (lotCar) {
      cars = [lotCar, ...cars.filter((car) => car.id !== lotCar.id)];
    }
  }
  return {
    cars,
    total: Math.max(results?.totalElements ?? 0, cars.length),
    page: filters.page ?? 1,
    size: PAGE_SIZE,
    facets: {
      makes: parseFacets(results?.facetFields, "MAKE"),
      models: parseFacets(results?.facetFields, "MODL"),
      years: parseFacets(results?.facetFields, "YEAR"),
      damage: parseFacets(results?.facetFields, "PRID"),
      body: parseFacets(results?.facetFields, "BODY"),
      fuel: parseFacets(results?.facetFields, "FUEL"),
    },
  };
}

export { PAGE_SIZE };
