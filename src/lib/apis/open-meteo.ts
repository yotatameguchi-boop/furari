import { fetchJson } from "./http";

type GeocodeResult = {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    country_code?: string;
  }[];
};

type ClimateResult = {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
};

export async function geocodeOpenMeteo(name: string) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?" +
    new URLSearchParams({
      name,
      count: "5",
      language: "ja",
      countryCode: "JP",
    });
  const data = await fetchJson<GeocodeResult>(url);
  return data.results?.[0] ?? null;
}

export async function fetchClimate(lat: number, lon: number) {
  const url =
    "https://archive-api.open-meteo.com/v1/archive?" +
    new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
      timezone: "Asia/Tokyo",
    });
  const data = await fetchJson<ClimateResult>(url, {}, 7000);
  return data.daily ?? null;
}

/** 0–1: のんびり・自然志向ほど穏やかな気候を高評価 */
export function scoreClimate(
  daily: NonNullable<Awaited<ReturnType<typeof fetchClimate>>>,
  preferMild: boolean,
) {
  const avgMax =
    daily.temperature_2m_max.reduce((a, b) => a + b, 0) / daily.temperature_2m_max.length;
  const avgRain =
    daily.precipitation_sum.reduce((a, b) => a + b, 0) / daily.precipitation_sum.length;
  let score = 0.7;
  if (preferMild) {
    if (avgMax >= 12 && avgMax <= 26) score += 0.15;
    if (avgRain < 6) score += 0.1;
  }
  return Math.min(1, score);
}
