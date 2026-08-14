import { fetchJson, uniqueBy } from "./http";

export type NominatimPlace = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  importance?: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    province?: string;
    county?: string;
    country?: string;
  };
};

export async function searchPlaces(query: string, limit = 12) {
  const q = encodeURIComponent(`${query} 日本`);
  const url =
    `https://nominatim.openstreetmap.org/search?q=${q}` +
    `&format=json&limit=${limit}&countrycodes=jp&accept-language=ja`;
  const rows = await fetchJson<NominatimPlace[]>(url);
  return uniqueBy(rows, (r) => normalizePlaceName(r.display_name));
}

export async function searchPlacesGlobal(query: string, limit = 12) {
  const q = encodeURIComponent(`${query} travel destination`);
  const url =
    `https://nominatim.openstreetmap.org/search?q=${q}` +
    `&format=json&limit=${limit}&accept-language=ja`;
  const rows = await fetchJson<NominatimPlace[]>(url);
  return uniqueBy(rows, (r) => normalizePlaceName(r.display_name)).filter(
    (r) => r.address?.country !== "日本" && !r.display_name.includes("日本"),
  );
}

export async function geocode(name: string, global = false) {
  const rows = global ? await searchPlacesGlobal(name, 1) : await searchPlaces(name, 1);
  return rows[0] ?? null;
}

export function normalizePlaceName(displayName: string) {
  return displayName.split(",")[0]?.trim() ?? displayName;
}

export function regionFromPlace(place: NominatimPlace) {
  const addr = place.address;
  const country = addr?.country;
  const local =
    addr?.state ??
    addr?.province ??
    addr?.county ??
    addr?.city ??
    addr?.town ??
    null;
  if (country && country !== "日本" && local) return `${country} · ${local}`;
  if (country && country !== "日本") return country;
  return local ?? "日本";
}

export function countryFromPlace(place: NominatimPlace) {
  return place.address?.country ?? "日本";
}
