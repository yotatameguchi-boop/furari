import type { BudgetBand, Facts, Traits } from "./types";

export const emptyTraits = (): Traits => ({
  solitude: 0.5,
  novelty: 0.5,
  slow: 0.5,
  nature: 0.5,
  comfort: 0.5,
  food: 0.5,
  rest: 0.5,
  culture: 0.5,
});

export const emptyFacts = (): Facts => ({ constraints: [] });

const clamp = (n: number) => Math.min(1, Math.max(0, n));

function nudge(traits: Traits, key: keyof Traits, amount: number) {
  traits[key] = clamp(traits[key] + amount);
}

const ORIGINS: { keys: string[]; origin: string }[] = [
  { keys: ["東京", "都内", "渋谷", "新宿", "池袋", "横浜", "神奈川", "千葉", "埼玉"], origin: "東京" },
  { keys: ["大阪", "梅田", "難波", "神戸", "京都", "奈良", "関西"], origin: "大阪" },
  { keys: ["名古屋", "愛知"], origin: "名古屋" },
  { keys: ["福岡", "博多", "北九州"], origin: "福岡" },
  { keys: ["札幌", "北海道"], origin: "札幌" },
  { keys: ["仙台"], origin: "仙台" },
  { keys: ["広島"], origin: "広島" },
];

const OVERSEAS_PLACES = [
  "韓国", "ソウル", "台湾", "台北", "タイ", "バンコク", "ベトナム", "ハノイ",
  "シンガポール", "バリ", "インドネシア", "香港", "欧州", "ヨーロッパ", "パリ",
  "ロンドン", "イタリア", "ローマ", "スペイン", "ハワイ", "ホノルル", "アメリカ",
  "ニューヨーク", "カナダ", "オーストラリア", "シドニー", "ニュージーランド",
  "アイスランド", "ポルトガル", "プーケット", "釜山", "済州", "台南", "チェンマイ",
  "クアラルンプール", "ペナン", "ダナン", "ロンドン", "アムステルダム", "プラハ",
  "サントリーニ", "ドバイ", "メルボルン", "ケアンズ", "ロサンゼルス", "サンフランシスコ",
  "チューリッヒ", "マラケシュ", "ウィーン", "シェムリアップ", "ベルリン", "シアトル",
  "ミュンヘン", "フィレンツェ", "ヴェネツィア", "イスタンブール", "ブダペスト", "カイロ",
  "ケープタウン", "トロント", "ボストン", "シカゴ", "タヒチ", "モルディブ", "ルアンパバーン",
  "セブ", "デリー", "カトマンズ", "ストックホルム", "ヘルシンキ", "ミラノ", "メキシコ",
  "コロンボ", "ムンバイ", "ポルト", "コペンハーゲン",
  "高雄", "マカオ", "マイアミ", "リオ", "マドリード", "セビリア", "ナポリ",
  "ドーハ", "モントリオール", "クラクフ", "オスロ", "パタヤ",
  "ブエノスアイレス", "リマ", "グアム", "サイパン", "フエ", "ビエンチャン", "プノンペン",
  "ワルシャワ", "エディンバラ", "ダブリン", "ニース", "サンディエゴ", "ワシントン",
  "テルアビブ", "フィジー", "サンパウロ", "ジョホールバル",
];

const PLACES = [
  "京都", "大阪", "沖縄", "北海道", "箱根", "軽井沢", "鎌倉", "金沢", "直島",
  "尾道", "屋久島", "石垣", "函館", "別府", "由布院", "高山", "奈良", "長崎", "奄美", "伊豆",
  "ニセコ", "富良野", "小樽", "横浜", "天橋立", "淡路島", "白馬", "那智勝浦", "阿波勝浦",
  "層雲峡", "支笏湖", "八丈島", "恩納", "霧島", "名護", "西表", "紋別", "伊根", "熊野",
];

const PREFECTURES = [
  "北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島", "茨城", "栃木", "群馬",
  "埼玉", "千葉", "東京", "神奈川", "新潟", "富山", "石川", "福井", "山梨", "長野",
  "岐阜", "静岡", "愛知", "三重", "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山",
  "鳥取", "島根", "岡山", "広島", "山口", "徳島", "香川", "愛媛", "高知", "福岡",
  "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄",
];

function has(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}

function parseDays(text: string): number | undefined {
  if (/一泊二日|1泊2日/.test(text)) return 2;
  if (/二泊三日|2泊3日/.test(text)) return 3;
  if (/三泊四日|3泊4日/.test(text)) return 4;
  if (/週末|二連休|2連休/.test(text)) return 2;
  if (/連休|三連休|3連休/.test(text)) return 3;
  if (/一週間|1週間|７日|7日/.test(text)) return 7;
  const m = text.match(/(\d+)\s*日/);
  if (m) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 14) return n;
  }
  return undefined;
}

function parseBudget(text: string): { band?: BudgetBand; yen?: number } {
  const man = text.match(/(\d+(?:\.\d+)?)\s*万/);
  if (man) {
    const yen = Math.round(Number(man[1]) * 10000);
    const band: BudgetBand = yen < 40000 ? "low" : yen < 100000 ? "mid" : "high";
    return { band, yen };
  }
  if (has(text, ["節約", "安く", "安め", "あまりお金", "予算ない", "安い"])) {
    return { band: "low" };
  }
  if (has(text, ["贅沢", "いい宿", "高級", "お金は気にしない", "奮発"])) {
    return { band: "high" };
  }
  if (has(text, ["そこそこ", "普通の予算", "無理しない"])) {
    return { band: "mid" };
  }
  return {};
}

export function readMessage(text: string, traits: Traits, facts: Facts) {
  const nextTraits = { ...traits };
  const nextFacts: Facts = {
    ...facts,
    constraints: [...facts.constraints],
  };

  if (has(text, ["ひとり", "一人", "1人", "静かに", "人混み", "人に気を使う", "ひとりの方が", "一人の方が"])) {
    nudge(nextTraits, "solitude", 0.18);
  }
  if (has(text, ["友達", "みんな", "ワイワイ", "賑やか", "にぎやか", "人と会", "飲み", "誰かと"])) {
    nudge(nextTraits, "solitude", -0.16);
  }
  if (has(text, ["初めて", "知らない", "冒険", "珍しい", "行ったことない", "新しい", "秘境", "まだ見ぬ"])) {
    nudge(nextTraits, "novelty", 0.16);
  }
  if (has(text, ["安心", "いつもの", "慣れて", "近くで", "無難", "失敗したく", "有名なところ"])) {
    nudge(nextTraits, "novelty", -0.12);
  }
  if (has(text, ["ゆっくり", "だらだら", "ぼーっと", "何もしない", "余白", "予定なし", "カフェ", "寝て"])) {
    nudge(nextTraits, "slow", 0.16);
  }
  if (has(text, ["はしご", "たくさん見", "効率", "予定びっしり", "回りたい", "観光スポット", "もったいない"])) {
    nudge(nextTraits, "slow", -0.16);
  }
  if (has(text, ["山", "海", "森", "自然", "空気", "緑", "星", "川", "島", "温泉"])) {
    nudge(nextTraits, "nature", 0.14);
  }
  if (has(text, ["街", "ショップ", "夜景", "便利", "駅近", "都会", "カフェ巡り"])) {
    nudge(nextTraits, "nature", -0.1);
  }
  if (has(text, ["ホテル", "綺麗", "きれい", "楽したい", "疲れ", "荷物少ない"])) {
    nudge(nextTraits, "comfort", 0.12);
  }
  if (has(text, ["キャンプ", "登山", "歩く", "ローカル", "秘境", "野宿", "リュック"])) {
    nudge(nextTraits, "comfort", -0.12);
  }
  if (has(text, ["食べ", "グルメ", "飯", "うまい", "美味", "海鮮", "ラーメン", "酒", "コーヒー"])) {
    nudge(nextTraits, "food", 0.16);
  }
  if (has(text, ["疲れ", "休みたい", "リセット", "癒", "いやされ", "温泉", "寝たい", "充電"])) {
    nudge(nextTraits, "rest", 0.18);
  }
  if (has(text, ["刺激", "イベント", "祭り", "ライブ", "アクティブ"])) {
    nudge(nextTraits, "rest", -0.12);
  }
  if (has(text, ["寺", "神社", "歴史", "美術館", "古い町", "工芸", "建築", "アート"])) {
    nudge(nextTraits, "culture", 0.16);
  }

  const days = parseDays(text);
  if (days) nextFacts.days = days;

  const budget = parseBudget(text);
  if (budget.band) nextFacts.budgetBand = budget.band;
  if (budget.yen) nextFacts.budgetYen = budget.yen;

  for (const row of ORIGINS) {
    if (has(text, row.keys)) {
      nextFacts.origin = row.origin;
      break;
    }
  }

  if (has(text, ["ひとり", "一人", "1人旅", "ソロ"])) nextFacts.companions = "solo";
  if (has(text, ["二人", "2人", "カップル", "パートナー", "夫", "妻"])) nextFacts.companions = "pair";
  if (has(text, ["家族", "友達と", "グループ", "みんなで"])) nextFacts.companions = "group";

  const named = PLACES.find((p) => text.includes(p));
  if (named) nextFacts.namedPlace = named;

  const pref = PREFECTURES.find((p) => text.includes(p));
  if (pref) {
    nextFacts.namedPlace = pref;
    nextFacts.scope = nextFacts.scope === "international" ? "international" : "domestic";
  }

  const overseasNamed = OVERSEAS_PLACES.find((p) => text.includes(p));
  if (overseasNamed) {
    nextFacts.namedPlace = overseasNamed;
    nextFacts.scope = nextFacts.scope === "domestic" ? "domestic" : "international";
  }

  if (has(text, ["海外", "外国", "abroad", "overseas", "パスポート", "ビザ"])) {
    nextFacts.scope = "international";
    nudge(nextTraits, "novelty", 0.14);
  }
  if (has(text, ["国内", "日本だけ", "国内旅行", "国内で", "日本国内"])) {
    nextFacts.scope = "domestic";
  }
  if (has(text, ["どこでも", "国内も海外", "遠く"])) {
    nextFacts.scope = "any";
  }

  if (has(text, ["車ない", "運転しない", "公共交通"])) {
    nextFacts.constraints.push("公共交通のみ");
  }
  if (has(text, ["子供", "子ども", "子連れ"])) {
    nextFacts.constraints.push("子連れ");
  }

  return { traits: nextTraits, facts: nextFacts };
}

export function traitLabels(traits: Traits): string[] {
  const labels: string[] = [];
  if (traits.solitude >= 0.62) labels.push("ひとりの時間");
  if (traits.solitude <= 0.38) labels.push("人といるのが好き");
  if (traits.slow >= 0.62) labels.push("余白が欲しい");
  if (traits.slow <= 0.38) labels.push("動いていたい");
  if (traits.nature >= 0.62) labels.push("空気を変えたい");
  if (traits.nature <= 0.38) labels.push("街のリズム");
  if (traits.food >= 0.62) labels.push("食べて歩く");
  if (traits.rest >= 0.62) labels.push("リセット志向");
  if (traits.novelty >= 0.62) labels.push("未知が好き");
  if (traits.novelty <= 0.38) labels.push("安心できる場所");
  if (traits.culture >= 0.62) labels.push("古いものと美術");
  if (traits.comfort >= 0.62) labels.push("楽に過ごしたい");
  if (traits.comfort <= 0.38) labels.push("少しだけ不便も可");
  return labels.slice(0, 5);
}

export function budgetLabel(facts: Facts): string | undefined {
  if (facts.budgetYen) {
    return `だいたい ${Math.round(facts.budgetYen / 10000)}万円`;
  }
  if (facts.budgetBand === "low") return "あまり使いたくない";
  if (facts.budgetBand === "mid") return "無理しないくらい";
  if (facts.budgetBand === "high") return "宿には出せる";
  return undefined;
}

export function companionLabel(facts: Facts): string | undefined {
  if (facts.companions === "solo") return "ひとり";
  if (facts.companions === "pair") return "ふたり";
  if (facts.companions === "group") return "複数人";
  return undefined;
}

export function scopeLabel(facts: Facts): string | undefined {
  if (facts.scope === "international") return "海外も視野";
  if (facts.scope === "domestic") return "国内中心";
  return undefined;
}

export function signalStrength(traits: Traits): number {
  return (Object.values(traits) as number[]).reduce(
    (sum, v) => sum + Math.abs(v - 0.5),
    0,
  );
}
