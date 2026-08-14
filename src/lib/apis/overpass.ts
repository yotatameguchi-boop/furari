import { fetchJson } from "./http";

type OverpassResponse = {
  elements: {
    id: number;
    type: "node" | "way" | "relation";
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
  }[];
};

export type OsmPoi = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  kind: string;
  tags: Record<string, string>;
};

function centerOf(el: OverpassResponse["elements"][number]) {
  if (el.lat != null && el.lon != null) return { lat: el.lat, lon: el.lon };
  if (el.center) return el.center;
  return null;
}

export async function fetchTourismNear(
  lat: number,
  lon: number,
  radiusM = 12000,
  limit = 15,
) {
  const query = `
[out:json][timeout:25];
(
  node["tourism"](around:${radiusM},${lat},${lon});
  way["tourism"](around:${radiusM},${lat},${lon});
);
out center ${limit};
`;
  const url = "https://overpass-api.de/api/interpreter";
  const data = await fetchJson<OverpassResponse>(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  const pois: OsmPoi[] = [];
  for (const el of data.elements) {
    const c = centerOf(el);
    const name = el.tags?.name ?? el.tags?.["name:ja"];
    if (!c || !name) continue;
    pois.push({
      id: `${el.type}/${el.id}`,
      name,
      lat: c.lat,
      lon: c.lon,
      kind: el.tags?.tourism ?? el.tags?.historic ?? el.tags?.natural ?? "spot",
      tags: el.tags ?? {},
    });
  }
  return pois;
}

export async function fetchThemedTowns(theme: "onsen" | "historic" | "island" | "nature") {
  const filters: Record<typeof theme, string> = {
    onsen: 'node["natural"="hot_spring"](area.japan); node["amenity"="public_bath"](area.japan);',
    historic: 'node["historic"](area.japan); node["heritage"](area.japan);',
    island: 'node["place"="island"](area.japan); node["place"="islet"](area.japan);',
    nature: 'node["natural"="peak"](area.japan); node["leisure"="nature_reserve"](area.japan);',
  };
  const query = `
[out:json][timeout:25];
area["ISO3166-1"="JP"][admin_level=2]->.japan;
(
  ${filters[theme]}
);
out body 100;
`;
  const url = "https://overpass-api.de/api/interpreter";
  const data = await fetchJson<OverpassResponse>(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  const pois: OsmPoi[] = [];
  for (const el of data.elements) {
    const c = centerOf(el);
    const name = el.tags?.name ?? el.tags?.["name:ja"];
    if (!c || !name) continue;
    pois.push({
      id: `${el.type}/${el.id}`,
      name,
      lat: c.lat,
      lon: c.lon,
      kind: theme,
      tags: el.tags ?? {},
    });
  }
  return pois;
}
