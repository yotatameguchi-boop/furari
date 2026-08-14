import type { Destination } from "./destinations";

export type SpotLinks = {
  maps: string;
  wikipedia: string;
  osm?: string;
};

type LinkInput = {
  name: string;
  lat?: number;
  lon?: number;
  country?: string;
  region?: string;
  wikipediaTitle?: string;
};

function mapsQuery(input: LinkInput) {
  if (input.country && input.country !== "日本") {
    return `${input.name} ${input.country}`;
  }
  if (input.region && input.region !== input.name) {
    return `${input.name} ${input.region}`;
  }
  return input.name;
}

export function buildSpotLinks(input: LinkInput): SpotLinks {
  const maps =
    input.lat != null && input.lon != null
      ? `https://www.google.com/maps/search/?api=1&query=${input.lat},${input.lon}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery(input))}`;

  const wikiTitle = input.wikipediaTitle ?? input.name;
  const wikipedia = `https://ja.wikipedia.org/w/index.php?search=${encodeURIComponent(wikiTitle)}`;

  const osm =
    input.lat != null && input.lon != null
      ? `https://www.openstreetmap.org/?mlat=${input.lat}&mlon=${input.lon}#map=14/${input.lat}/${input.lon}`
      : undefined;

  return { maps, wikipedia, osm };
}

export function linksForDestination(dest: Destination): SpotLinks {
  if (dest.links) return dest.links;
  return buildSpotLinks({
    name: dest.name,
    lat: dest.lat,
    lon: dest.lon,
    country: dest.country,
    region: dest.region,
    wikipediaTitle: dest.wikipediaTitle,
  });
}

export function beatMapsUrl(place: string, region: string, country?: string) {
  const query =
    country && country !== "日本" ? `${place} ${country}` : `${place} ${region}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
