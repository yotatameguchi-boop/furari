import type { DayPlan, Facts, Traits, TransportLeg } from "./types";
import type { OsmPoi } from "./apis/overpass";
import { emptyTraits } from "./personality";

const ORIGIN_COORDS: Record<string, { lat: number; lon: number }> = {
  東京: { lat: 35.6812, lon: 139.7671 },
  大阪: { lat: 34.7024, lon: 135.4959 },
  名古屋: { lat: 35.1815, lon: 136.9066 },
  福岡: { lat: 33.5904, lon: 130.4017 },
  札幌: { lat: 43.0618, lon: 141.3545 },
  仙台: { lat: 38.2682, lon: 140.8694 },
  広島: { lat: 34.3853, lon: 132.4553 },
};

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nudge(t: Traits, key: keyof Traits, amount: number) {
  t[key] = Math.min(1, Math.max(0, t[key] + amount));
}

export function inferWeights(text: string, tags: Record<string, string> = {}): Traits {
  const t = emptyTraits();
  const blob = `${text} ${Object.values(tags).join(" ")}`;

  if (/温泉|湯|onsen|hot_spring|public_bath/i.test(blob)) {
    nudge(t, "rest", 0.28);
    nudge(t, "slow", 0.18);
    nudge(t, "comfort", 0.12);
  }
  if (/島|island|離島|海|beach|coast/i.test(blob)) {
    nudge(t, "nature", 0.22);
    nudge(t, "slow", 0.12);
    nudge(t, "novelty", 0.1);
  }
  if (/寺|神社|城|museum|美術|heritage|historic|世界遺産|culture/i.test(blob)) {
    nudge(t, "culture", 0.25);
    nudge(t, "slow", 0.08);
  }
  if (/国立公園|山|peak|forest|自然|nature|reserve/i.test(blob)) {
    nudge(t, "nature", 0.28);
    nudge(t, "comfort", -0.08);
  }
  if (/市場|グルメ|食|ラーメン|寿司|food/i.test(blob)) {
    nudge(t, "food", 0.25);
  }
  if (/リゾート|ホテル|resort/i.test(blob)) {
    nudge(t, "comfort", 0.18);
    nudge(t, "rest", 0.1);
  }
  if (/秘境|未踏|珍しい|離島/i.test(blob)) {
    nudge(t, "novelty", 0.22);
    nudge(t, "solitude", 0.12);
  }
  if (/町|集落|small|town/i.test(blob)) {
    nudge(t, "slow", 0.15);
    nudge(t, "solitude", 0.1);
  }

  return t;
}

export function estimateBudget(text: string, distanceKm: number, international = false) {
  if (international) {
    let dailyMin = 25000;
    let dailyMax = 50000;
    if (/欧州|パリ|ローマ|ロンドン|スペイン|アイスランド|iceland|europe/i.test(text)) {
      dailyMin = 32000;
      dailyMax = 75000;
    } else if (/ハワイ|アメリカ|カナダ|オーストラリア|ニュージーランド/i.test(text)) {
      dailyMin = 35000;
      dailyMax = 80000;
    } else if (/東南アジア|タイ|ベトナム|バリ|インドネシア/i.test(text)) {
      dailyMin = 18000;
      dailyMax = 38000;
    }
    return {
      dailyMin,
      dailyMax,
      minDays: distanceKm > 5000 ? 4 : 3,
      maxDays: 10,
    };
  }

  let dailyMin = 14000;
  let dailyMax = 26000;
  if (/離島|島|flight|飛行/i.test(text) || distanceKm > 900) {
    dailyMin = 20000;
    dailyMax = 42000;
  } else if (/温泉|リゾート|高級/i.test(text)) {
    dailyMin = 18000;
    dailyMax = 35000;
  } else if (/町|集落|small/i.test(text)) {
    dailyMin = 12000;
    dailyMax = 22000;
  }
  return { dailyMin, dailyMax, minDays: distanceKm > 700 ? 3 : 2, maxDays: 5 };
}

export function isInJapan(lat: number, lon: number) {
  return lat >= 24 && lat <= 46.5 && lon >= 122 && lon <= 154;
}

function buildInternationalTransport(
  destName: string,
  km: number,
): { summary: string; legs: TransportLeg[] } {
  const hours = Math.max(2, Math.round(km / 750));
  return {
    summary: "海外は空路が本体。到着日は移動だけで終わってもいい。",
    legs: [
      {
        from: "羽田 or 成田",
        to: `${destName}方面`,
        mode: "flight",
        duration: `約${hours}時間`,
        note: "直行便を優先。乗継は最低2時間見る",
      },
      {
        from: "現地空港",
        to: destName,
        mode: "train",
        duration: "約30–90分",
        transfer: true,
        note: "空港鉄道・バス・Grab など。パスポートと現金/カードを確認",
      },
    ],
  };
}

export function buildTransport(
  origin: string,
  destName: string,
  destCoord: { lat: number; lon: number },
  options?: { international?: boolean },
): { summary: string; legs: TransportLeg[] } {
  const from = ORIGIN_COORDS[origin] ?? ORIGIN_COORDS["東京"];
  const km = haversineKm(from, destCoord);
  const international = options?.international ?? !isInJapan(destCoord.lat, destCoord.lon);
  const legs: TransportLeg[] = [];

  if (international) {
    return buildInternationalTransport(destName, km);
  }

  if (km < 120) {
    legs.push({
      from: origin,
      to: destName,
      mode: "train",
      duration: `約${Math.max(1, Math.round(km / 45))}時間`,
      note: "在来線または特急。乗換は1回以内を目安に",
    });
    return { summary: "近場なので、鉄道中心。移動そのものは短く。", legs };
  }

  if (km < 450) {
    legs.push({
      from: origin,
      to: "途中の新幹線駅",
      mode: "shinkansen",
      duration: `約${Math.max(1, Math.round(km / 220))}時間`,
    });
    legs.push({
      from: "途中の新幹線駅",
      to: destName,
      mode: "train",
      duration: "約30–90分",
      transfer: true,
      note: "在来線で最終目的地へ",
    });
    return { summary: "新幹線＋在来線。乗り継ぎは1回が現実的。", legs };
  }

  if (km < 900) {
    legs.push({
      from: origin,
      to: destName,
      mode: "shinkansen",
      duration: `約${Math.max(2, Math.round(km / 200))}時間`,
      note: "のぞみ・はやぶさ系。指定席推奨",
    });
    return { summary: "新幹線一本で届く距離。乗換を減らせる。", legs };
  }

  legs.push({
    from: `${origin}空港`,
    to: `${destName}最寄り空港`,
    mode: "flight",
    duration: `約${Math.max(1.5, Math.round(km / 700))}時間`,
  });
  legs.push({
    from: "空港",
    to: destName,
    mode: /島|離島/.test(destName) ? "ferry" : "bus",
    duration: /島|離島/.test(destName) ? "約20–90分" : "約40–70分",
    transfer: true,
    note: /島|離島/.test(destName) ? "欠航に備えて余裕日を1日" : "空港バスまたは鉄道",
  });
  return { summary: "距離があるので空路。島なら港までの船も見る。", legs };
}

export function buildPlanFromPois(
  destName: string,
  days: number,
  pois: OsmPoi[],
  summary?: string,
): DayPlan[] {
  const picks = pois.slice(0, Math.max(3, days * 2));
  const plans: DayPlan[] = [];

  for (let d = 1; d <= days; d++) {
    if (d === 1) {
      plans.push({
        day: 1,
        title: "着いて、歩幅を合わせる",
        beats: [
          {
            time: "午後",
            place: destName,
            detail: summary
              ? firstChars(summary, 90)
              : "荷物を置いたら、一つだけ外に出る。全部回らない。",
          },
          {
            time: "夕方",
            place: picks[0]?.name ?? destName,
            detail: picks[0]
              ? `${picks[0].name}を外から見る。中まで入らなくてもいい。`
              : "人が減る時間帯に、同じ通りをもう一周。",
          },
        ],
      });
      continue;
    }

    const poi = picks[(d - 2) % Math.max(1, picks.length)];
    if (d === days) {
      plans.push({
        day: d,
        title: "帰路の前に、余白",
        beats: [
          {
            time: "午前",
            place: poi?.name ?? destName,
            detail: "昨日よかった場所に戻るか、新しい場所は足さない。",
          },
          {
            time: "午後",
            place: "移動",
            detail: "最終便より一本前。移動の疲れを、旅の最後に持ち帰らない。",
          },
        ],
      });
      continue;
    }

    plans.push({
      day: d,
      title: poi ? `${poi.name}の日` : "余白の日",
      beats: [
        {
          time: "午前",
          place: poi?.name ?? destName,
          detail: poi
            ? `${poi.name}。OpenStreetMap 上の ${poi.kind} スポット。`
            : "予定を増やさない。カフェに長く座る。",
        },
        {
          time: "午後",
          place: destName,
          detail: "歩ける距離だけ歩く。タクシーは使ってもいい。",
        },
      ],
    });
  }

  return plans;
}

function firstChars(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

export function originCoord(origin?: string) {
  return ORIGIN_COORDS[origin ?? "東京"] ?? ORIGIN_COORDS["東京"];
}

export function distanceFromOrigin(origin: string | undefined, coord: { lat: number; lon: number }) {
  return haversineKm(originCoord(origin), coord);
}

export function budgetNote(facts: Facts) {
  if (facts.scope === "international") {
    if (facts.budgetBand === "low") {
      return "LCC と宿を抑える。東南アジアなら現地ごはんでかなり下げられる。";
    }
    if (facts.budgetBand === "high") {
      return "フライトと宿に寄せる。移動の疲れを部屋で回収する想定。";
    }
    return "航空券が最大の出費。現地は食と交通を半分ずつくらい。";
  }
  if (facts.budgetBand === "low") {
    return "宿は小さめ、移動は公共交通。食事は市場と一軒で足る。";
  }
  if (facts.budgetBand === "high") {
    return "宿に寄せる。移動の疲れを、部屋で回収する想定。";
  }
  return "移動と宿に半分、食べと入場に半分、くらいが無理ない。";
}
