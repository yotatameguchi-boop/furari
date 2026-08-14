import { fetchGlobalTouristSpots, fetchHotSprings, fetchTouristSpots, parseCoord } from "./apis/wikidata";
import { mapPool, slugify, uniqueBy } from "./apis/http";
import { geocodeOpenMeteo } from "./apis/open-meteo";
import { fetchThemedTowns } from "./apis/overpass";
import {
  countryFromPlace,
  geocode,
  normalizePlaceName,
  regionFromPlace,
  searchPlaces,
  searchPlacesGlobal,
} from "./apis/nominatim";
import { firstSentence, getExtract, searchArticles } from "./apis/wikipedia";
import type { Destination } from "./destinations";
import {
  buildPlanFromPois,
  buildTransport,
  distanceFromOrigin,
  estimateBudget,
  inferWeights,
} from "./infer";
import { fetchTourismNear } from "./apis/overpass";
import { buildSpotLinks } from "./spot-links";
import type { Facts, Traits } from "./types";

export type DiscoveryResult = {
  destinations: Destination[];
  sources: string[];
  fetchedCount: number;
};

/** API 取得上限（ここを上げると候補プールが広がる） */
export const DISCOVERY_LIMITS = {
  maxQueries: 36,
  maxThemes: 4,
  nominatimPerQuery: 18,
  wikipediaQueryCount: 18,
  wikipediaPerQuery: 15,
  wikidataDomesticTourist: 120,
  wikidataDomesticOnsen: 80,
  wikidataGlobalTourist: 150,
  wikidataOffsetPages: 4,
  openMeteoSamples: 40,
  rawDedupeCap: 700,
  buildCap: 280,
  buildConcurrency: 14,
  geocodeConcurrency: 10,
  poiNearLimit: 15,
} as const;

const cache = new Map<string, { at: number; value: DiscoveryResult }>();
const CACHE_TTL_MS = 1000 * 60 * 45;

function buildQueries(traits: Traits, facts: Facts) {
  const q: string[] = [];
  const scope = facts.scope ?? "any";
  if (facts.namedPlace) q.push(facts.namedPlace);
  if (scope !== "domestic") {
    if (traits.food >= 0.55) q.push("food market city", "street food", "culinary travel");
    if (traits.culture >= 0.55) q.push("world heritage", "historic city", "museum city");
    if (traits.nature >= 0.55) q.push("national park", "island resort", "scenic coast");
    if (traits.rest >= 0.55) q.push("beach resort", "spa town", "wellness retreat");
    if (traits.novelty >= 0.55) q.push("hidden gem travel", "off the beaten path");
    if (traits.slow >= 0.55) q.push("slow travel town", "walkable city");
    if (q.length === 0 || scope === "international") {
      q.push("travel destination", "city break", "resort", "popular vacation");
    }
  }
  if (scope !== "international") {
    if (traits.nature >= 0.55) q.push("国立公園", "離島", "温泉郷", "渓谷", "高原");
    if (traits.culture >= 0.55) q.push("世界遺産", "古い町", "城", "神社仏閣");
    if (traits.food >= 0.55) q.push("食べ歩き", "朝市", "グルメ", "海の幸");
    if (traits.rest >= 0.55) q.push("温泉", "リゾート", "スパ", "海辺");
    if (traits.novelty >= 0.55) q.push("秘境", "離島", "未踏");
    if (traits.slow >= 0.55) q.push("小さな町", "のどか", "宿場町");
    if (traits.solitude >= 0.55) q.push("人里離れた", "静かな観光地");
    if (q.length === 0) q.push("観光地", "温泉", "離島", "古い町", "名所");
  }
  return [...new Set(q)].slice(0, DISCOVERY_LIMITS.maxQueries);
}

function themesFromTraits(traits: Traits): ("onsen" | "historic" | "island" | "nature")[] {
  const themes: ("onsen" | "historic" | "island" | "nature")[] = [];
  if (traits.rest >= 0.55) themes.push("onsen");
  if (traits.culture >= 0.55) themes.push("historic");
  if (traits.nature >= 0.55 || traits.novelty >= 0.55) themes.push("island", "nature");
  if (themes.length === 0) themes.push("historic", "nature", "onsen", "island");
  return [...new Set(themes)].slice(0, DISCOVERY_LIMITS.maxThemes);
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

type RawCandidate = {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  text: string;
  tags: Record<string, string>;
  source: string;
};

type WikidataRow = {
  id: string;
  name: string;
  coord?: string;
  description?: string;
  country?: string;
};

async function wikidataPages(
  fetcher: (limit: number, offset: number) => Promise<WikidataRow[]>,
  pageSize: number,
) {
  const pages = await Promise.all(
    Array.from({ length: DISCOVERY_LIMITS.wikidataOffsetPages }, (_, page) =>
      safe(() => fetcher(pageSize, page * pageSize), []),
    ),
  );
  return pages.flat();
}

async function geocodeWikidataRow(
  row: WikidataRow,
  international: boolean,
): Promise<RawCandidate | null> {
  const geo = await safe(() => geocode(row.name, international), null);
  if (!geo) return null;
  return {
    name: row.name,
    region: international ? (row.country ?? regionFromPlace(geo)) : regionFromPlace(geo),
    country: international ? (row.country ?? countryFromPlace(geo)) : "日本",
    lat: Number(geo.lat),
    lon: Number(geo.lon),
    text: row.description ?? row.name,
    tags: { wikidata: row.id },
    source: "wikidata",
  };
}

async function expandWikidataRows(
  rows: WikidataRow[],
  international: boolean,
): Promise<RawCandidate[]> {
  const out: RawCandidate[] = [];
  const needsGeocode: WikidataRow[] = [];

  for (const row of rows) {
    const coord = parseCoord(row.coord);
    if (coord) {
      out.push({
        name: row.name,
        region: international ? (row.country ?? "海外") : "日本",
        country: international ? (row.country ?? "海外") : "日本",
        lat: coord.lat,
        lon: coord.lon,
        text: row.description ?? row.name,
        tags: { wikidata: row.id },
        source: "wikidata",
      });
    } else {
      needsGeocode.push(row);
    }
  }

  if (needsGeocode.length > 0) {
    const geocoded = await mapPool(
      needsGeocode,
      DISCOVERY_LIMITS.geocodeConcurrency,
      (row) => geocodeWikidataRow(row, international),
    );
    for (const row of geocoded) {
      if (row) out.push(row);
    }
  }

  return out;
}

async function toDestination(
  raw: RawCandidate,
  traits: Traits,
  facts: Facts,
  days: number,
): Promise<Destination | null> {
  if (!raw.name || raw.name.length < 2) return null;

  const international = raw.country !== "日本";
  const weights = inferWeights(raw.text, raw.tags);
  const distKm = distanceFromOrigin(facts.origin, { lat: raw.lat, lon: raw.lon });
  const budget = estimateBudget(raw.text, distKm, international);
  const transport = buildTransport(facts.origin ?? "東京", raw.name, {
    lat: raw.lat,
    lon: raw.lon,
  }, { international });

  const pois = international
    ? []
    : await safe(
        () => fetchTourismNear(raw.lat, raw.lon, 15000, DISCOVERY_LIMITS.poiNearLimit),
        [],
      );

  const hook =
    firstSentence(raw.text, 80) ||
    `${raw.name}。${international ? "海外" : "国内"}の候補。`;
  const why = `会話の輪郭（${traits.nature >= 0.6 ? "自然" : traits.culture >= 0.6 ? "文化" : traits.rest >= 0.6 ? "休息" : "余白"}）に近い場所。`;

  const plan = buildPlanFromPois(raw.name, days, pois, raw.text);
  const wikipediaTitle = raw.tags.wikipedia;

  return {
    id: `api-${slugify(raw.name)}`,
    name: raw.name,
    region: raw.region,
    country: raw.country,
    lat: raw.lat,
    lon: raw.lon,
    wikipediaTitle,
    links: buildSpotLinks({
      name: raw.name,
      lat: raw.lat,
      lon: raw.lon,
      country: raw.country,
      region: raw.region,
      wikipediaTitle,
    }),
    hook,
    why,
    weights,
    dailyMin: budget.dailyMin,
    dailyMax: budget.dailyMax,
    minDays: budget.minDays,
    maxDays: budget.maxDays,
    access: { [facts.origin ?? "東京"]: transport },
    plan,
    extraDays: [
      {
        day: plan.length + 1,
        title: "余白の日",
        beats: [
          {
            time: "終日",
            place: raw.name,
            detail: "新しい場所を足さない。昨日よかった場所にもう一度。",
          },
        ],
      },
    ],
  };
}

export async function discoverDestinations(
  traits: Traits,
  facts: Facts,
  days: number,
): Promise<DiscoveryResult> {
  const key = JSON.stringify({
    traits: Object.values(traits).map((v) => Math.round(v * 10)),
    facts,
    days,
  });
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.value;
  }

  const L = DISCOVERY_LIMITS;
  const queries = buildQueries(traits, facts);
  const themes = themesFromTraits(traits);
  const scope = facts.scope ?? "any";
  const sources: string[] = [];
  const raws: RawCandidate[] = [];

  const domesticQueries = queries.filter((q) => /[\u3040-\u30ff\u4e00-\u9faf]/.test(q));
  const globalQueries = queries.filter((q) => !/[\u3040-\u30ff\u4e00-\u9faf]/.test(q));

  const [nominatimDomestic, nominatimGlobal] = await Promise.all([
    scope !== "international"
      ? Promise.all(
          domesticQueries.map((q) => safe(() => searchPlaces(q, L.nominatimPerQuery), [])),
        )
      : Promise.resolve([] as Awaited<ReturnType<typeof searchPlaces>>[]),
    scope !== "domestic"
      ? Promise.all(
          (globalQueries.length > 0 ? globalQueries : ["travel destination", "vacation spot"]).map(
            (q) => safe(() => searchPlacesGlobal(q, L.nominatimPerQuery), []),
          ),
        )
      : Promise.resolve([] as Awaited<ReturnType<typeof searchPlacesGlobal>>[]),
  ]);

  if (nominatimDomestic.some((r) => r.length > 0) || nominatimGlobal.some((r) => r.length > 0)) {
    sources.push("Nominatim (OpenStreetMap)");
  }

  for (const rows of [...nominatimDomestic, ...nominatimGlobal]) {
    for (const row of rows) {
      raws.push({
        name: normalizePlaceName(row.display_name),
        region: regionFromPlace(row),
        country: countryFromPlace(row),
        lat: Number(row.lat),
        lon: Number(row.lon),
        text: row.display_name,
        tags: { type: row.type, class: row.class },
        source: "nominatim",
      });
    }
  }

  const wikiSearches = await Promise.all(
    queries.slice(0, L.wikipediaQueryCount).map((q) =>
      safe(() => searchArticles(q, L.wikipediaPerQuery), []),
    ),
  );
  if (wikiSearches.some((r) => r.length > 0)) sources.push("Wikipedia");

  const wikiRows = wikiSearches.flat();
  const wikiEnriched = await mapPool(
    wikiRows,
    L.geocodeConcurrency,
    async (row) => {
      const extract = await safe(() => getExtract(row.title), null);
      const geo = await safe(() => geocode(row.title, scope === "international"), null);
      if (!geo) return null;
      return {
        name: normalizePlaceName(row.title),
        region: regionFromPlace(geo),
        country: countryFromPlace(geo),
        lat: Number(geo.lat),
        lon: Number(geo.lon),
        text: extract?.extract ?? row.snippet.replace(/<[^>]+>/g, ""),
        tags: { wikipedia: row.title },
        source: "wikipedia",
      } satisfies RawCandidate;
    },
  );
  for (const row of wikiEnriched) {
    if (row) raws.push(row);
  }

  const fetchDomesticWd = scope !== "international";
  const fetchGlobalWd = scope !== "domestic";

  const [wikidataTourist, wikidataOnsen, wikidataGlobal, ...osmThemes] = await Promise.all([
    fetchDomesticWd
      ? wikidataPages(fetchTouristSpots, L.wikidataDomesticTourist)
      : Promise.resolve([]),
    fetchDomesticWd
      ? wikidataPages(fetchHotSprings, L.wikidataDomesticOnsen)
      : Promise.resolve([]),
    fetchGlobalWd
      ? wikidataPages(fetchGlobalTouristSpots, L.wikidataGlobalTourist)
      : Promise.resolve([]),
    ...(fetchDomesticWd
      ? themes.map((theme) => safe(() => fetchThemedTowns(theme), []))
      : []),
  ]);

  if (wikidataTourist.length + wikidataOnsen.length + wikidataGlobal.length > 0) {
    sources.push("Wikidata");
  }
  if (osmThemes.some((r) => r.length > 0)) sources.push("Overpass (OpenStreetMap)");

  const [domesticWd, globalWd] = await Promise.all([
    expandWikidataRows([...wikidataTourist, ...wikidataOnsen], false),
    expandWikidataRows(wikidataGlobal, true),
  ]);
  raws.push(...domesticWd, ...globalWd);

  for (const rows of osmThemes) {
    for (const row of rows) {
      if (!row) continue;
      raws.push({
        name: row.name,
        region: "日本",
        country: "日本",
        lat: row.lat,
        lon: row.lon,
        text: `${row.name} ${row.kind}`,
        tags: row.tags,
        source: "overpass",
      });
    }
  }

  const openMeteoSamples = await Promise.all(
    uniqueBy(raws, (r) => r.name)
      .slice(0, L.openMeteoSamples)
      .map((r) => safe(() => geocodeOpenMeteo(r.name), null)),
  );
  if (openMeteoSamples.some(Boolean)) sources.push("Open-Meteo");

  const deduped = uniqueBy(raws, (r) => `${r.country}:${r.name.toLowerCase()}`).slice(
    0,
    L.rawDedupeCap,
  );
  const built = await mapPool(
    deduped.slice(0, L.buildCap),
    L.buildConcurrency,
    (raw) => toDestination(raw, traits, facts, days),
  );
  const destinations = built.filter((d): d is Destination => d != null);

  const result: DiscoveryResult = {
    destinations,
    sources: [...new Set(sources)],
    fetchedCount: deduped.length,
  };
  cache.set(key, { at: Date.now(), value: result });
  return result;
}
