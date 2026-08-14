import { discoverDestinations } from "./discover";
import {
  destinations as curatedDestinations,
  rankDestinations,
  scalePlan,
  type Destination,
} from "./destinations";
import { domesticExtraDestinations } from "./domestic-extra";
import { overseasDestinations } from "./overseas";
import { prefectureDestinations } from "./prefectures";
import { prefectureExtraDestinations } from "./prefecture-extra";
import { prefectureThirdDestinations } from "./prefecture-third";
import { prefectureFourthDestinations } from "./prefecture-fourth";
import { prefectureFifthDestinations } from "./prefecture-fifth";
import { budgetNote } from "./infer";
import { linksForDestination } from "./spot-links";
import type { Facts, Proposal, Traits } from "./types";

function personalityRead(traits: Traits): string {
  const bits: string[] = [];
  if (traits.slow >= 0.58) bits.push("予定で埋めるより、余白がある方が呼吸できそう");
  else bits.push("止まっているより、少し動いていた方が気分が上がりそう");
  if (traits.solitude >= 0.6) bits.push("人の多い名所より、歩幅を自分で決められる場所");
  else if (traits.solitude <= 0.4) bits.push("完全な孤独より、生活の音がどこかにある町");
  if (traits.food >= 0.62) bits.push("景色より先に、食べた記憶が残りそう");
  if (traits.rest >= 0.62) bits.push("今は達成より、湯か海で神経系を戻す順番");
  if (traits.novelty >= 0.62) bits.push("定番の写真スポットより、少し手間のかかる方が後から効く");
  if (traits.nature >= 0.62) bits.push("建物の密度より、空気が先に変わる場所");
  return `${bits.slice(0, 3).join("。")}。`;
}

function originAccess(dest: Destination, origin: string) {
  return dest.access[origin] ?? dest.access["東京"] ?? Object.values(dest.access)[0];
}

function mergePools(...groups: Destination[][]) {
  const byName = new Map<string, Destination>();
  for (const group of groups) {
    for (const d of group) {
      if (!byName.has(d.name)) byName.set(d.name, d);
    }
  }
  return [...byName.values()];
}

export async function buildProposalAsync(
  traits: Traits,
  facts: Facts,
): Promise<Proposal & { sources: string[]; candidateCount: number }> {
  const days = facts.days ?? (traits.slow >= 0.6 ? 3 : 2);
  const discovery = await discoverDestinations(traits, facts, days);
  const pool = mergePools(
    curatedDestinations,
    prefectureDestinations,
    prefectureExtraDestinations,
    prefectureThirdDestinations,
    prefectureFourthDestinations,
    prefectureFifthDestinations,
    domesticExtraDestinations,
    overseasDestinations,
    discovery.destinations,
  );
  const ranked = rankDestinations(traits, facts, days, pool);
  const best = ranked[0].dest;
  const alts = ranked.slice(1, 18).map((row) => ({
    id: row.dest.id,
    name: row.dest.name,
    why: row.dest.hook,
    links: linksForDestination(row.dest),
  }));
  const access = originAccess(best, facts.origin ?? "東京");
  const plan = scalePlan(best, days);
  const min = best.dailyMin * days;
  const max = best.dailyMax * days;

  return {
    id: best.id,
    name: best.name,
    region: best.region,
    country: best.country,
    hook: best.hook,
    why: best.why,
    personalityRead: personalityRead(traits),
    days,
    budget: { min, max, note: budgetNote(facts) },
    transport: access,
    plan,
    links: linksForDestination(best),
    alternatives: alts,
    sources: discovery.sources.length > 0 ? discovery.sources : ["手元の旅データ"],
    candidateCount: pool.length,
  };
}
