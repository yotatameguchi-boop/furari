import { fetchJson } from "./http";

type WikiSearch = {
  query?: { search?: { title: string; snippet: string }[] };
};

type WikiExtract = {
  query?: {
    pages?: Record<
      string,
      { title?: string; extract?: string; pageid?: number }
    >;
  };
};

export async function searchArticles(query: string, limit = 10) {
  const url =
    "https://ja.wikipedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: `${query} 日本 観光`,
      srlimit: String(limit),
      format: "json",
      origin: "*",
    });
  const data = await fetchJson<WikiSearch>(url);
  return data.query?.search ?? [];
}

export async function getExtract(title: string) {
  const url =
    "https://ja.wikipedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      prop: "extracts",
      exintro: "1",
      explaintext: "1",
      titles: title,
      format: "json",
      origin: "*",
    });
  const data = await fetchJson<WikiExtract>(url);
  const pages = data.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  if (!page?.extract) return null;
  return { title: page.title ?? title, extract: page.extract };
}

export function firstSentence(text: string, max = 120) {
  const trimmed = text.replace(/\s+/g, " ").trim();
  const dot = trimmed.search(/[。．.!?\n]/);
  const sentence = dot >= 0 ? trimmed.slice(0, dot + 1) : trimmed;
  return sentence.length > max ? `${sentence.slice(0, max)}…` : sentence;
}
