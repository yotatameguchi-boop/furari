import { slugify } from "./apis/http";
import { buildSpotLinks } from "./spot-links";
import type { Destination } from "./destinations";
import { buildTransport, estimateBudget, inferWeights } from "./infer";
import type { DayPlan } from "./types";

export type DomesticSpot = {
  id?: string;
  prefecture: string;
  name: string;
  lat: number;
  lon: number;
  hook: string;
  why: string;
  tags: string;
};

function defaultPlan(name: string, hook: string): DayPlan[] {
  return [
    {
      day: 1,
      title: "着いて、歩幅を合わせる",
      beats: [
        { time: "午後", place: name, detail: hook },
        { time: "夕方", place: name, detail: "初日は一つだけ。全部回らない。" },
      ],
    },
    {
      day: 2,
      title: "代表スポットを一つ",
      beats: [
        { time: "午前", place: name, detail: "定番でも、早い時間か夕方に寄せる。" },
        { time: "午後", place: name, detail: "カフェか市場。予定を足さない。" },
      ],
    },
    {
      day: 3,
      title: "余白で帰る",
      beats: [
        { time: "午前", place: name, detail: "昨日よかった場所に戻る。" },
        { time: "午後", place: "移動", detail: "最終便より一本前。" },
      ],
    },
  ];
}

export function buildDomesticDestination(
  spot: DomesticSpot,
  idPrefix: string,
): Destination {
  const weights = inferWeights(`${spot.name} ${spot.tags}`, {
    prefecture: spot.prefecture,
  });
  const coord = { lat: spot.lat, lon: spot.lon };
  const transport = buildTransport("東京", spot.name, coord);
  const budget = estimateBudget(spot.tags, 400, false);

  return {
    id: spot.id ?? `${idPrefix}-${slugify(spot.prefecture)}-${slugify(spot.name)}`,
    name: spot.name,
    region: spot.prefecture,
    country: "日本",
    lat: spot.lat,
    lon: spot.lon,
    links: buildSpotLinks({
      name: spot.name,
      lat: spot.lat,
      lon: spot.lon,
      region: spot.prefecture,
      country: "日本",
    }),
    hook: spot.hook,
    why: spot.why,
    weights,
    dailyMin: budget.dailyMin,
    dailyMax: budget.dailyMax,
    minDays: budget.minDays,
    maxDays: budget.maxDays,
    access: { 東京: transport, 大阪: transport },
    plan: defaultPlan(spot.name, spot.hook),
    extraDays: [
      {
        day: 4,
        title: "余白の日",
        beats: [{ time: "終日", place: spot.name, detail: "新しい場所を足さない。" }],
      },
    ],
  };
}

export function buildDomesticCatalog(
  spots: DomesticSpot[],
  idPrefix: string,
): Destination[] {
  return spots.map((s) => buildDomesticDestination(s, idPrefix));
}
