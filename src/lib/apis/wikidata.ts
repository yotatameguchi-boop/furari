import { fetchJson } from "./http";

type WikidataResult = {
  results: {
    bindings: {
      place: { value: string };
      placeLabel: { value: string };
      coord?: { value: string };
      desc?: { value: string };
      countryLabel?: { value: string };
    }[];
  };
};

export async function fetchGlobalTouristSpots(limit = 80, offset = 0) {
  const query = `
SELECT ?place ?placeLabel ?coord ?countryLabel ?desc WHERE {
  ?place wdt:P31/wdt:P279* wd:Q570116 .
  ?place wdt:P17 ?country .
  FILTER(?country != wd:Q17)
  OPTIONAL { ?place wdt:P625 ?coord . }
  OPTIONAL {
    ?place schema:description ?desc .
    FILTER(LANG(?desc) = "ja")
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ja,en". }
}
LIMIT ${limit}
OFFSET ${offset}
`;
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
  const data = await fetchJson<WikidataResult>(url);
  return data.results.bindings.map((row) => ({
    id: row.place.value.split("/").pop() ?? row.placeLabel.value,
    name: row.placeLabel.value,
    coord: row.coord?.value,
    description: row.desc?.value,
    country: row.countryLabel?.value,
  }));
}

export async function fetchTouristSpots(limit = 60, offset = 0) {
  const query = `
SELECT ?place ?placeLabel ?coord ?desc WHERE {
  ?place wdt:P31/wdt:P279* wd:Q570116 .
  ?place wdt:P17 wd:Q17 .
  OPTIONAL { ?place wdt:P625 ?coord . }
  OPTIONAL {
    ?place schema:description ?desc .
    FILTER(LANG(?desc) = "ja")
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ja". }
}
LIMIT ${limit}
OFFSET ${offset}
`;
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
  const data = await fetchJson<WikidataResult>(url);
  return data.results.bindings.map((row) => ({
    id: row.place.value.split("/").pop() ?? row.placeLabel.value,
    name: row.placeLabel.value,
    coord: row.coord?.value,
    description: row.desc?.value,
  }));
}

export async function fetchHotSprings(limit = 40, offset = 0) {
  const query = `
SELECT ?place ?placeLabel ?coord WHERE {
  ?place wdt:P31/wdt:P279* wd:Q836688 .
  ?place wdt:P17 wd:Q17 .
  OPTIONAL { ?place wdt:P625 ?coord . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "ja". }
}
LIMIT ${limit}
OFFSET ${offset}
`;
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
  const data = await fetchJson<WikidataResult>(url);
  return data.results.bindings.map((row) => ({
    id: row.place.value.split("/").pop() ?? row.placeLabel.value,
    name: row.placeLabel.value,
    coord: row.coord?.value,
    description: row.desc?.value,
  }));
}

export function parseCoord(coord?: string) {
  if (!coord) return null;
  const m = coord.match(/Point\(([-\d.]+)\s+([-\d.]+)\)/);
  if (!m) return null;
  return { lon: Number(m[1]), lat: Number(m[2]) };
}
