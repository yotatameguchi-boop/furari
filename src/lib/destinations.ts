import type { DayPlan, Facts, Proposal, Traits, TransportLeg } from "./types";
import type { SpotLinks } from "./spot-links";
import { overseasDestinations } from "./overseas";
import { linksForDestination } from "./spot-links";
import { prefectureDestinations } from "./prefectures";
import { prefectureExtraDestinations } from "./prefecture-extra";
import { prefectureThirdDestinations } from "./prefecture-third";
import { prefectureFourthDestinations } from "./prefecture-fourth";
import { prefectureFifthDestinations } from "./prefecture-fifth";
import { domesticExtraDestinations } from "./domestic-extra";

export type Destination = {
  id: string;
  name: string;
  region: string;
  country?: string;
  lat?: number;
  lon?: number;
  wikipediaTitle?: string;
  links?: SpotLinks;
  hook: string;
  why: string;
  weights: Traits;
  dailyMin: number;
  dailyMax: number;
  minDays: number;
  maxDays: number;
  access: Record<string, { summary: string; legs: TransportLeg[] }>;
  plan: DayPlan[];
  extraDays: DayPlan[];
};

export function destCountry(dest: Destination) {
  return dest.country ?? "日本";
}

const tokyo = (legs: TransportLeg[], summary: string) => ({
  東京: { summary, legs },
});

export const destinations: Destination[] = [
  {
    id: "naoshima",
    name: "直島",
    region: "香川",
    hook: "予定を捨てて、海とアートのあいだを歩く島。",
    why: "人混みの観光地より、余白と静かな刺激が欲しい人に合う。",
    weights: {
      solitude: 0.82,
      novelty: 0.7,
      slow: 0.85,
      nature: 0.62,
      comfort: 0.55,
      food: 0.48,
      rest: 0.7,
      culture: 0.88,
    },
    dailyMin: 18000,
    dailyMax: 32000,
    minDays: 2,
    maxDays: 4,
    access: {
      東京: {
        summary: "新幹線と港の船を乗り継ぐ。急ぎすぎない移動そのものが旅になる。",
        legs: [
          { from: "東京", to: "岡山", mode: "shinkansen", duration: "約3時間20分", note: "のぞみ。岡山駅で下車" },
          {
            from: "岡山",
            to: "宇野",
            mode: "train",
            duration: "約45分",
            note: "瀬戸大橋線。茶屋町で乗換になる便あり",
            transfer: true,
          },
          { from: "宇野港", to: "宮浦港（直島）", mode: "ferry", duration: "約20分", note: "便が少ないので駅からの接続を先に見る", transfer: true },
        ],
      },
      大阪: {
        summary: "新大阪から岡山は短く、あとは港までの乗り継ぎが本題。",
        legs: [
          { from: "新大阪", to: "岡山", mode: "shinkansen", duration: "約45分" },
          { from: "岡山", to: "宇野", mode: "train", duration: "約45分", transfer: true },
          { from: "宇野港", to: "宮浦港（直島）", mode: "ferry", duration: "約20分", transfer: true },
        ],
      },
    },
    plan: [
      {
        day: 1,
        title: "着いて、海を見るだけ",
        beats: [
          { time: "午前", place: "移動", detail: "岡山までの車窓は、仕事の続きをしない日にする。" },
          { time: "午後", place: "ベネッセハウス周辺", detail: "美術館を全部回らない。屋外作品と海のあいだを歩く。" },
          { time: "夕方", place: "宮浦の港", detail: "船の音だけ聞いて、初日は早めに終わる。" },
        ],
      },
      {
        day: 2,
        title: "家プロジェクトをひとつだけ",
        beats: [
          { time: "午前", place: "本村", detail: "家プロジェクトは欲張らず、気になった建物を2つ。" },
          { time: "午後", place: "地中美術館", detail: "予約枠に合わせて。出たあとはカフェで余韻を残す。" },
          { time: "夜", place: "宿", detail: "島の夜は早い。予定を足さない。" },
        ],
      },
      {
        day: 3,
        title: "帰り際に豊島か、余白",
        beats: [
          { time: "午前", place: "島の東側", detail: "自転車で港と集落をゆっくりつなぐ。" },
          { time: "午後", place: "宇野へ", detail: "便に合わせて島を出る。岡山で下車して駅前で夕食でもいい。" },
        ],
      },
    ],
    extraDays: [
      {
        day: 4,
        title: "豊島に渡る",
        beats: [
          { time: "終日", place: "豊島", detail: "直島よりさらに静か。美術館と田んぼのあいだを歩く一日。" },
        ],
      },
    ],
  },
  {
    id: "onomichi",
    name: "尾道",
    region: "広島",
    hook: "坂と猫と、瀬戸内の光。歩幅が自然と遅くなる町。",
    why: "ひとりで歩いて、写真より空気を持ち帰りたい人向け。",
    weights: {
      solitude: 0.78,
      novelty: 0.58,
      slow: 0.8,
      nature: 0.55,
      comfort: 0.5,
      food: 0.62,
      rest: 0.65,
      culture: 0.7,
    },
    dailyMin: 14000,
    dailyMax: 26000,
    minDays: 2,
    maxDays: 4,
    access: {
      ...tokyo(
        [
          { from: "東京", to: "福山", mode: "shinkansen", duration: "約3時間30分", note: "のぞみ。福山下車が乗り継ぎ少ない" },
          { from: "福山", to: "尾道", mode: "train", duration: "約20分", note: "山陽本線", transfer: true },
        ],
        "福山で降りて在来線に乗り換えると、尾道駅まで迷いにくい。",
      ),
      大阪: {
        summary: "新大阪から福山は約1時間。あとは山陽本線。",
        legs: [
          { from: "新大阪", to: "福山", mode: "shinkansen", duration: "約1時間10分" },
          { from: "福山", to: "尾道", mode: "train", duration: "約20分", transfer: true },
        ],
      },
    },
    plan: [
      {
        day: 1,
        title: "坂の上まで、一度だけ",
        beats: [
          { time: "午後", place: "尾道駅〜旧市街", detail: "荷物は宿に置いて、坂道を空身で。" },
          { time: "夕方", place: "千光寺公園", detail: "ロープウェイでも歩いてもいい。瀬戸内を上から見る。" },
          { time: "夜", place: "本通り", detail: "ラーメンか小さな居酒屋で、一日を短く閉じる。" },
        ],
      },
      {
        day: 2,
        title: "しまなみは欲張らない",
        beats: [
          { time: "午前", place: "向島", detail: "自転車を借りて、本州側から橋を1本だけ渡る。" },
          { time: "午後", place: "海岸通り", detail: "カフェに長く座る。次の島へ行かない勇気がテーマ。" },
          { time: "夕方", place: "文学のこみち", detail: "人が減った時間に、もう一度坂を歩く。" },
        ],
      },
      {
        day: 3,
        title: "朝の港で終わる",
        beats: [
          { time: "朝", place: "尾道水道", detail: "船の往来を見てから駅へ。急がない帰路にする。" },
        ],
      },
    ],
    extraDays: [
      {
        day: 4,
        title: "因島まで伸ばす",
        beats: [
          { time: "終日", place: "しまなみ海道", detail: "体力がある日だけ。無理なら尾道で本屋と喫茶。" },
        ],
      },
    ],
  },
  {
    id: "beppu",
    name: "別府",
    region: "大分",
    hook: "湯気が日常になっている町で、何もしない練習をする。",
    why: "疲れが先に来ている人、予定で自分を追い込みたくない人に。",
    weights: {
      solitude: 0.6,
      novelty: 0.45,
      slow: 0.9,
      nature: 0.58,
      comfort: 0.78,
      food: 0.55,
      rest: 0.95,
      culture: 0.4,
    },
    dailyMin: 16000,
    dailyMax: 30000,
    minDays: 2,
    maxDays: 4,
    access: {
      東京: {
        summary: "飛行機が最短。到着後は空港バス一本で湯の町に落ちる。",
        legs: [
          { from: "羽田", to: "大分", mode: "flight", duration: "約1時間45分" },
          { from: "大分空港", to: "別府駅・鉄輪", mode: "bus", duration: "約45–55分", note: "空港バス。鉄輪で降りる選択もあり", transfer: true },
        ],
      },
      大阪: {
        summary: "伊丹から大分へ。新幹線経由より体が楽。",
        legs: [
          { from: "伊丹", to: "大分", mode: "flight", duration: "約1時間" },
          { from: "大分空港", to: "別府", mode: "bus", duration: "約50分", transfer: true },
        ],
      },
      福岡: {
        summary: "博多から特急で別府まで座っていける。",
        legs: [
          { from: "博多", to: "別府", mode: "train", duration: "約2時間", note: "ソニック。乗換なし" },
        ],
      },
    },
    plan: [
      {
        day: 1,
        title: "着いたら湯",
        beats: [
          { time: "午後", place: "鉄輪", detail: "地獄めぐりは全部やらなくていい。蒸気を見るだけで十分。" },
          { time: "夕方", place: "宿の湯", detail: "外に出ない勇気。食事のあとは早く寝る。" },
        ],
      },
      {
        day: 2,
        title: "別府と由布院、片方だけ",
        beats: [
          { time: "午前", place: "浜脇か海地獄周辺", detail: "散歩は短く。湯治場の生活音を聞く。" },
          { time: "午後", place: "由布院", detail: "行くなら滞在は3時間まで。買い物で埋めない。" },
          { time: "夜", place: "別府", detail: "同じ湯に入り直す。変化より反復。" },
        ],
      },
      {
        day: 3,
        title: "朝湯して帰る",
        beats: [
          { time: "朝", place: "共同湯", detail: "チェックアウト前にもう一度。空港バスの時刻だけ見る。" },
        ],
      },
    ],
    extraDays: [
      {
        day: 4,
        title: "湯布院に泊まり直す",
        beats: [
          { time: "終日", place: "由布院", detail: "別府の湯気に飽きたら、盆地の静けさへ移る。" },
        ],
      },
    ],
  },
  {
    id: "kanazawa",
    name: "金沢",
    region: "石川",
    hook: "食べて、古い町を歩いて、用事のない時間を残す北陸。",
    why: "街が好きだけど、東京の延長は嫌な人。食と工芸が自然に重なる。",
    weights: {
      solitude: 0.48,
      novelty: 0.5,
      slow: 0.55,
      nature: 0.35,
      comfort: 0.7,
      food: 0.9,
      rest: 0.5,
      culture: 0.8,
    },
    dailyMin: 18000,
    dailyMax: 35000,
    minDays: 2,
    maxDays: 4,
    access: {
      東京: {
        summary: "北陸新幹線は乗換が少ない。金沢駅ごとが目的地になる。",
        legs: [
          { from: "東京", to: "金沢", mode: "shinkansen", duration: "約2時間30分", note: "かがやき。乗換なし" },
        ],
      },
      大阪: {
        summary: "特急サンダーバードで座ったまま。",
        legs: [
          { from: "大阪", to: "金沢", mode: "train", duration: "約2時間30分", note: "サンダーバード。乗換なし" },
        ],
      },
    },
    plan: [
      {
        day: 1,
        title: "近江町から始める",
        beats: [
          { time: "午後", place: "近江町市場", detail: "観光コースより、その日の魚を見て昼を決める。" },
          { time: "夕方", place: "ひがし茶屋街", detail: "人が多い時間は避けて、端の通りを歩く。" },
          { time: "夜", place: "片町か駅西", detail: "金沢カレーでも寿司でも、店は1軒でいい。" },
        ],
      },
      {
        day: 2,
        title: "兼六園は朝だけ",
        beats: [
          { time: "朝", place: "兼六園・金沢城", detail: "開園直後。昼前には出る。" },
          { time: "午後", place: "長町", detail: "武士の家並みを短く。21世紀美術館は気になった展示だけ。" },
          { time: "夕方", place: "主計町", detail: "川沿いをゆっくり戻る。" },
        ],
      },
      {
        day: 3,
        title: "工芸か、海へ",
        beats: [
          { time: "午前", place: "工芸店か鈴木大拙館", detail: "買うより見る。静かな館をひとつ。" },
          { time: "午後", place: "帰路", detail: "かがやきの指定席を早めに取る。" },
        ],
      },
    ],
    extraDays: [
      {
        day: 4,
        title: "和倉か福井へ伸ばさない",
        beats: [
          { time: "終日", place: "金沢の内側", detail: "遠出より、同じ喫茶に入り直す日。" },
        ],
      },
    ],
  },
  {
    id: "yakushima",
    name: "屋久島",
    region: "鹿児島",
    hook: "雨と森が主導権を握る島。予定表より天気を信じる。",
    why: "刺激が欲しいけど、街の刺激ではない人。歩く覚悟がある人。",
    weights: {
      solitude: 0.7,
      novelty: 0.88,
      slow: 0.55,
      nature: 0.98,
      comfort: 0.28,
      food: 0.4,
      rest: 0.5,
      culture: 0.35,
    },
    dailyMin: 20000,
    dailyMax: 36000,
    minDays: 3,
    maxDays: 5,
    access: {
      東京: {
        summary: "空路が現実的。鹿児島空港からの乗継を最初に固定する。",
        legs: [
          { from: "羽田", to: "鹿児島", mode: "flight", duration: "約1時間50分" },
          {
            from: "鹿児島空港",
            to: "屋久島",
            mode: "flight",
            duration: "約35分",
            note: "乗継は最低90分見る。欠航に備えて余裕日を1日",
            transfer: true,
          },
        ],
      },
      大阪: {
        summary: "伊丹〜鹿児島〜屋久島。船はロマンがあるが時間を食う。",
        legs: [
          { from: "伊丹", to: "鹿児島", mode: "flight", duration: "約1時間10分" },
          { from: "鹿児島空港", to: "屋久島", mode: "flight", duration: "約35分", transfer: true },
        ],
      },
      福岡: {
        summary: "福岡から鹿児島へ鉄道か空路、そこから島へ。",
        legs: [
          { from: "博多", to: "鹿児島中央", mode: "shinkansen", duration: "約1時間20分", note: "みずほ・さくら" },
          { from: "鹿児島空港or港", to: "屋久島", mode: "flight", duration: "約35分", note: "高速船の日もある", transfer: true },
        ],
      },
    },
    plan: [
      {
        day: 1,
        title: "島の速度に合わせる",
        beats: [
          { time: "午後", place: "宮之浦", detail: "レンタカーかバス。初日は滝の近くまでで十分。" },
          { time: "夕方", place: "宿", detail: "翌日の天気と入山の可否だけ確認する。" },
        ],
      },
      {
        day: 2,
        title: "森へ。欲張らない",
        beats: [
          { time: "早朝", place: "ヤクスギランドか白谷雲水峡", detail: "縄文杉は体力と日数がある人だけ。無理なら雲水峡。" },
          { time: "午後", place: "下降", detail: "雨なら途中で戻る。達成より膝を残す。" },
        ],
      },
      {
        day: 3,
        title: "海側で休む",
        beats: [
          { time: "午前", place: "永田か一湊", detail: "砂浜を歩く。ウミガメの季節なら遠くから見る。" },
          { time: "午後", place: "帰路の余裕", detail: "欠航に備えて最終便より前の便を取る。" },
        ],
      },
    ],
    extraDays: [
      {
        day: 4,
        title: "縄文杉に行ける日",
        beats: [
          { time: "終日", place: "荒川登山口", detail: "バス予約必須。往復が本体なので、他の予定は消す。" },
        ],
      },
    ],
  },
  {
    id: "hakodate",
    name: "函館",
    region: "北海道",
    hook: "坂の夜景と、朝の市場。街なのに、空気が違う。",
    why: "食べ歩きが好きで、ある程度の都市機能も欲しい人。",
    weights: {
      solitude: 0.45,
      novelty: 0.55,
      slow: 0.5,
      nature: 0.48,
      comfort: 0.72,
      food: 0.92,
      rest: 0.48,
      culture: 0.58,
    },
    dailyMin: 17000,
    dailyMax: 32000,
    minDays: 2,
    maxDays: 4,
    access: {
      東京: {
        summary: "新幹線なら乗換なし。飛行機なら函館空港からバス一本。",
        legs: [
          { from: "東京", to: "新函館北斗", mode: "shinkansen", duration: "約4時間", note: "はやぶさ。新函館北斗で乗換" },
          { from: "新函館北斗", to: "函館", mode: "train", duration: "約15分", note: "はこだてライナー", transfer: true },
        ],
      },
      札幌: {
        summary: "特急で函館まで。乗換を減らすなら直通を取る。",
        legs: [
          { from: "札幌", to: "函館", mode: "train", duration: "約3時間30分", note: "特急北斗" },
        ],
      },
      大阪: {
        summary: "空路が素直。伊丹・関空から函館。",
        legs: [
          { from: "伊丹", to: "函館", mode: "flight", duration: "約1時間45分" },
          { from: "函館空港", to: "函館駅", mode: "bus", duration: "約20分", transfer: true },
        ],
      },
    },
    plan: [
      {
        day: 1,
        title: "夜景は、一度でいい",
        beats: [
          { time: "午後", place: "西部地区", detail: "坂を上り下りして、洋館を外から見る。" },
          { time: "夕方", place: "ロープウェイ", detail: "日没前後。混むので時間をずらす。" },
          { time: "夜", place: "大門", detail: "塩ラーメンか海鮮、どちらか一方。" },
        ],
      },
      {
        day: 2,
        title: "朝は市場、昼は海",
        beats: [
          { time: "朝", place: "朝市", detail: "全部食べない。朝食を一皿決める。" },
          { time: "午後", place: "トラピスチヌか湯の川", detail: "街に飽きたら湯の川で止まる。" },
        ],
      },
      {
        day: 3,
        title: "帰りの車窓",
        beats: [
          { time: "午前", place: "元町", detail: "教会前の坂をもう一度。土産は少なく。" },
        ],
      },
    ],
    extraDays: [
      {
        day: 4,
        title: "大沼か、湯の川に泊まり直す",
        beats: [
          { time: "終日", place: "大沼", detail: "函館の延長で自然が欲しくなったときの逃げ道。" },
        ],
      },
    ],
  },
  {
    id: "sado",
    name: "佐渡",
    region: "新潟",
    hook: "本州から船で切れる島。観光密度が低く、時間が余る。",
    why: "まだあまり言われていない場所、少しの不便を楽しめる人。",
    weights: {
      solitude: 0.85,
      novelty: 0.9,
      slow: 0.75,
      nature: 0.85,
      comfort: 0.35,
      food: 0.6,
      rest: 0.62,
      culture: 0.55,
    },
    dailyMin: 16000,
    dailyMax: 28000,
    minDays: 3,
    maxDays: 5,
    access: {
      東京: {
        summary: "新幹線とジェットフォイル。船の時刻が計画の骨格になる。",
        legs: [
          { from: "東京", to: "新潟", mode: "shinkansen", duration: "約2時間10分", note: "とき" },
          { from: "新潟駅", to: "新潟港", mode: "bus", duration: "約15分", transfer: true },
          { from: "新潟港", to: "両津", mode: "ferry", duration: "約65分", note: "ジェットフォイル。欠航あり", transfer: true },
        ],
      },
      大阪: {
        summary: "空路で新潟へ入り、港へつなぐ。",
        legs: [
          { from: "伊丹", to: "新潟", mode: "flight", duration: "約1時間10分" },
          { from: "新潟空港", to: "新潟港", mode: "bus", duration: "約40分", transfer: true },
          { from: "新潟港", to: "両津", mode: "ferry", duration: "約65分", transfer: true },
        ],
      },
    },
    plan: [
      {
        day: 1,
        title: "両津に落ちる",
        beats: [
          { time: "午後", place: "両津", detail: "車かバス。初日は港町の半径で足りる。" },
          { time: "夕方", place: "宿", detail: "翌日の沿岸の天気を見る。" },
        ],
      },
      {
        day: 2,
        title: "海と田んぼのあいだ",
        beats: [
          { time: "午前", place: "小木か相川", detail: "片側だけ。島を一周しようとしない。" },
          { time: "午後", place: "たらい舟か金山", detail: "興味のある方をひとつ。両方は詰め込まない。" },
        ],
      },
      {
        day: 3,
        title: "船に間に合わせる",
        beats: [
          { time: "午前", place: "港", detail: "最終便より一本前。新潟駅までのバスも見る。" },
        ],
      },
    ],
    extraDays: [
      {
        day: 4,
        title: "能の里を歩く",
        beats: [
          { time: "終日", place: "宿根木", detail: "小さな集落に滞在時間を渡す。" },
        ],
      },
    ],
  },
  {
    id: "ishigaki",
    name: "石垣・竹富",
    region: "沖縄",
    hook: "なんとなく南へ行きたい、を具体にする島。",
    why: "リセットしたいのに、予定表を埋めがちな人を海がほどく。",
    weights: {
      solitude: 0.55,
      novelty: 0.65,
      slow: 0.88,
      nature: 0.9,
      comfort: 0.7,
      food: 0.58,
      rest: 0.88,
      culture: 0.4,
    },
    dailyMin: 22000,
    dailyMax: 42000,
    minDays: 3,
    maxDays: 6,
    access: {
      東京: {
        summary: "直行便が基本。竹富へは石垣港からの船が本体。",
        legs: [
          { from: "羽田", to: "石垣", mode: "flight", duration: "約3時間" },
          { from: "石垣空港", to: "石垣港", mode: "bus", duration: "約40分", transfer: true },
          { from: "石垣港", to: "竹富島", mode: "ferry", duration: "約15分", note: "日帰りも可。便は夕方で終わる", transfer: true },
        ],
      },
      大阪: {
        summary: "関空・伊丹から石垣。乗継が発生する便は避ける。",
        legs: [
          { from: "関西", to: "石垣", mode: "flight", duration: "約2時間30分" },
          { from: "石垣空港", to: "市街・港", mode: "bus", duration: "約40分", transfer: true },
        ],
      },
      福岡: {
        summary: "福岡から石垣へ。直行がある日を選ぶ。",
        legs: [
          { from: "福岡", to: "石垣", mode: "flight", duration: "約2時間10分" },
        ],
      },
    },
    plan: [
      {
        day: 1,
        title: "海を見ない日にしない",
        beats: [
          { time: "午後", place: "石垣市街", detail: "レンタカーは翌日。初日は港と夕日だけ。" },
        ],
      },
      {
        day: 2,
        title: "竹富は歩く",
        beats: [
          { time: "午前", place: "竹富島", detail: "水牛車に乗らなくても成立する。集落を一周。" },
          { time: "午後", place: "石垣へ戻る", detail: "ビーチは一本に決める。はしごしない。" },
        ],
      },
      {
        day: 3,
        title: "北部か、何もしない",
        beats: [
          { time: "終日", place: "川平湾周辺", detail: "グラスボートは任意。岸から見て満足していい。" },
        ],
      },
    ],
    extraDays: [
      {
        day: 4,
        title: "西表は、本気の日",
        beats: [
          { time: "終日", place: "西表島", detail: "マングローブ。体力があるときだけ渡る。" },
        ],
      },
    ],
  },
  {
    id: "takayama",
    name: "飛騨高山",
    region: "岐阜",
    hook: "朝市と古い町並み。冬も夏も、空気が先に来る。",
    why: "安心感と日本の古い風景が欲しい人。移動は少し手間でも報われる。",
    weights: {
      solitude: 0.58,
      novelty: 0.42,
      slow: 0.72,
      nature: 0.68,
      comfort: 0.62,
      food: 0.7,
      rest: 0.6,
      culture: 0.75,
    },
    dailyMin: 15000,
    dailyMax: 28000,
    minDays: 2,
    maxDays: 4,
    access: {
      東京: {
        summary: "名古屋経由が定石。高山本線の車窓がすでに山旅。",
        legs: [
          { from: "東京", to: "名古屋", mode: "shinkansen", duration: "約1時間40分", note: "のぞみ" },
          { from: "名古屋", to: "高山", mode: "train", duration: "約2時間20分", note: "特急ひだ。乗換は名古屋駅構内", transfer: true },
        ],
      },
      大阪: {
        summary: "大阪から名古屋へ出て、ひだに乗る。",
        legs: [
          { from: "新大阪", to: "名古屋", mode: "shinkansen", duration: "約50分" },
          { from: "名古屋", to: "高山", mode: "train", duration: "約2時間20分", note: "特急ひだ", transfer: true },
        ],
      },
      名古屋: {
        summary: "ひだに座れば着く。",
        legs: [{ from: "名古屋", to: "高山", mode: "train", duration: "約2時間20分" }],
      },
    },
    plan: [
      {
        day: 1,
        title: "三町をゆっくり",
        beats: [
          { time: "午後", place: "古い町並", detail: "朝市は翌日に残す。まず縦の通りを歩く。" },
          { time: "夜", place: "居酒屋", detail: "朴葉みそと酒。店は一軒。" },
        ],
      },
      {
        day: 2,
        title: "朝市、そのあと白川郷は任意",
        beats: [
          { time: "朝", place: "宮川朝市", detail: "買うより見る。朝食を済ませる。" },
          { time: "午後", place: "高山の内側", detail: "白川郷は日数と体力があるときだけバス往復。" },
        ],
      },
      {
        day: 3,
        title: "ひだで下りる",
        beats: [
          { time: "午前", place: "飛騨の里か温泉", detail: "開村時間を見て、無理なら温泉だけ。" },
        ],
      },
    ],
    extraDays: [
      {
        day: 4,
        title: "白川郷に泊まる",
        beats: [
          { time: "終日", place: "白川郷", detail: "日帰りより一夜。人が帰ったあとの集落が本体。" },
        ],
      },
    ],
  },
  {
    id: "shimoda",
    name: "下田・南伊豆",
    region: "静岡",
    hook: "遠くに行かなくても、東京の週末が旅になる海。",
    why: "日数が短い、予算を抑えたい、でも日常の延長は嫌な人。",
    weights: {
      solitude: 0.62,
      novelty: 0.35,
      slow: 0.78,
      nature: 0.8,
      comfort: 0.6,
      food: 0.55,
      rest: 0.82,
      culture: 0.35,
    },
    dailyMin: 12000,
    dailyMax: 24000,
    minDays: 2,
    maxDays: 3,
    access: {
      東京: {
        summary: "特急踊り子か、新幹線＋伊豆急。乗換を許容するかどうかで便を選ぶ。",
        legs: [
          { from: "東京", to: "伊豆急下田", mode: "train", duration: "約2時間45分", note: "特急踊り子。乗換なし便を優先" },
        ],
      },
      大阪: {
        summary: "距離のわりに時間がかかる。日数が短いなら別候補の方がいい。",
        legs: [
          { from: "新大阪", to: "熱海", mode: "shinkansen", duration: "約2時間20分" },
          { from: "熱海", to: "伊豆急下田", mode: "train", duration: "約1時間15分", note: "踊り子か伊豆急", transfer: true },
        ],
      },
    },
    plan: [
      {
        day: 1,
        title: "海に落ちる",
        beats: [
          { time: "午後", place: "下田港", detail: "ペリーロードを短く歩いて、海を見る。" },
          { time: "夕方", place: "白浜か須崎", detail: "宿が海沿いなら、外に出ない。" },
        ],
      },
      {
        day: 2,
        title: "爪木崎か、何もしない",
        beats: [
          { time: "午前", place: "爪木崎", detail: "季節の花と海岸。歩く距離は短く。" },
          { time: "午後", place: "帰路", detail: "踊り子の指定席を取る。熱海で降りて風呂、は任意。" },
        ],
      },
    ],
    extraDays: [
      {
        day: 3,
        title: "石廊崎まで",
        beats: [
          { time: "終日", place: "南伊豆", detail: "バスの本数が少ないので、時刻表が計画。" },
        ],
      },
    ],
  },
  {
    id: "kakunodate",
    name: "角館・田沢湖",
    region: "秋田",
    hook: "武家屋敷と湖。人が少なく、季節がはっきりしている。",
    why: "有名地の混雑を避けたい、静かな北国が頭の片隅にある人。",
    weights: {
      solitude: 0.8,
      novelty: 0.7,
      slow: 0.8,
      nature: 0.78,
      comfort: 0.5,
      food: 0.55,
      rest: 0.7,
      culture: 0.72,
    },
    dailyMin: 14000,
    dailyMax: 26000,
    minDays: 2,
    maxDays: 4,
    access: {
      東京: {
        summary: "秋田新幹線こまち。角館で降りられるのが強い。",
        legs: [
          { from: "東京", to: "角館", mode: "shinkansen", duration: "約3時間10分", note: "こまち。乗換なし" },
        ],
      },
      大阪: {
        summary: "東京経由か空路秋田。空路なら田沢湖までバスと鉄道の乗り継ぎ。",
        legs: [
          { from: "伊丹", to: "秋田", mode: "flight", duration: "約1時間20分" },
          { from: "秋田", to: "角館", mode: "train", duration: "約1時間10分", note: "田沢湖線", transfer: true },
        ],
      },
    },
    plan: [
      {
        day: 1,
        title: "武家屋敷は夕方",
        beats: [
          { time: "午後", place: "角館", detail: "桜の季節以外でも成立する。通りを往復するだけ。" },
          { time: "夜", place: "宿", detail: "きりたんぽは一度でいい。" },
        ],
      },
      {
        day: 2,
        title: "湖まで伸ばす",
        beats: [
          { time: "午前", place: "田沢湖", detail: "こまちかバス。一周はしない。岸に座る。" },
          { time: "午後", place: "玉川温泉か帰路", detail: "湯が好きなら玉川。移動が多い日にしない。" },
        ],
      },
    ],
    extraDays: [
      {
        day: 3,
        title: "乳頭温泉に泊まる",
        beats: [
          { time: "終日", place: "田沢湖高原", detail: "角館の延長として一番効く。" },
        ],
      },
    ],
  },
  {
    id: "kurashiki",
    name: "倉敷",
    region: "岡山",
    hook: "白壁の倉と、用水。半日で見終える町を、あえて一晩置く。",
    why: "アートと古い町並みが好きで、大きな移動はしたくない人。",
    weights: {
      solitude: 0.65,
      novelty: 0.48,
      slow: 0.82,
      nature: 0.35,
      comfort: 0.68,
      food: 0.58,
      rest: 0.6,
      culture: 0.85,
    },
    dailyMin: 14000,
    dailyMax: 26000,
    minDays: 2,
    maxDays: 3,
    access: {
      東京: {
        summary: "岡山まで新幹線、在来線で倉敷。乗換は1回。",
        legs: [
          { from: "東京", to: "岡山", mode: "shinkansen", duration: "約3時間20分" },
          { from: "岡山", to: "倉敷", mode: "train", duration: "約15分", note: "山陽本線。快速あり", transfer: true },
        ],
      },
      大阪: {
        summary: "新大阪から岡山は短く、倉敷まで滑らか。",
        legs: [
          { from: "新大阪", to: "岡山", mode: "shinkansen", duration: "約45分" },
          { from: "岡山", to: "倉敷", mode: "train", duration: "約15分", transfer: true },
        ],
      },
    },
    plan: [
      {
        day: 1,
        title: "美観地区を夜まで",
        beats: [
          { time: "午後", place: "美観地区", detail: "大原美術館は時間を決めて入る。" },
          { time: "夜", place: "倉敷川", detail: "人が減ってからもう一周。これが本体。" },
        ],
      },
      {
        day: 2,
        title: "児島か、岡山城",
        beats: [
          { time: "午前", place: "児島", detail: "ジーンズの町。興味がなければ美観地区の喫茶。" },
          { time: "午後", place: "帰路", detail: "岡山駅で降りて駅前で昼、でもいい。" },
        ],
      },
    ],
    extraDays: [
      {
        day: 3,
        title: "直島に接続する",
        beats: [
          { time: "終日", place: "宇野経由", detail: "倉敷と直島は相性がいい。日数があるなら島へ。" },
        ],
      },
    ],
  },
];

function originAccess(dest: Destination, origin: string) {
  return dest.access[origin] ?? dest.access["東京"] ?? Object.values(dest.access)[0];
}

function fitDays(dest: Destination, days: number) {
  if (days < dest.minDays) return 0.55;
  if (days > dest.maxDays) return 0.75;
  return 1;
}

function fitBudget(dest: Destination, facts: Facts, days: number) {
  const mid = ((dest.dailyMin + dest.dailyMax) / 2) * days;
  if (!facts.budgetBand && !facts.budgetYen) return 0.85;
  const yen = facts.budgetYen;
  if (yen) {
    const ratio = yen / mid;
    if (ratio < 0.55) return 0.35;
    if (ratio > 1.8) return 0.8;
    return 1 - Math.abs(1 - ratio) * 0.4;
  }
  if (facts.budgetBand === "low") return dest.dailyMin <= 17000 ? 1 : 0.45;
  if (facts.budgetBand === "high") return dest.dailyMax >= 28000 ? 1 : 0.7;
  return 0.85;
}

function traitScore(dest: Destination, traits: Traits) {
  const keys = Object.keys(traits) as (keyof Traits)[];
  let sum = 0;
  let weight = 0;
  for (const key of keys) {
    const w = Math.abs(traits[key] - 0.5) * 2;
    const closeness = 1 - Math.abs(dest.weights[key] - traits[key]);
    sum += closeness * (0.4 + w);
    weight += 0.4 + w;
  }
  return sum / weight;
}

export function rankDestinations(
  traits: Traits,
  facts: Facts,
  days: number,
  pool: Destination[] = destinations,
) {
  const origin = facts.origin ?? "東京";
  const scored = pool.map((dest) => {
    let score =
      traitScore(dest, traits) * 1.35 +
      fitDays(dest, days) * 0.35 +
      fitBudget(dest, facts, days) * 0.3;

    const country = destCountry(dest);
    const scope = facts.scope ?? "any";
    if (scope === "international" && country === "日本") score -= 0.4;
    if (scope === "domestic" && country !== "日本") score -= 0.4;
    if (scope !== "domestic" && traits.novelty >= 0.62 && country !== "日本") score += 0.1;
    if (facts.namedPlace && dest.name.includes(facts.namedPlace)) score += 0.12;
    if (facts.namedPlace && dest.region.includes(facts.namedPlace)) score += 0.14;
    if (facts.namedPlace && destCountry(dest) === "日本" && dest.region === facts.namedPlace) {
      score += 0.18;
    }
    if (facts.namedPlace === "沖縄" && dest.id === "ishigaki") score += 0.1;
    if (facts.namedPlace === "北海道" && dest.id === "hakodate") score += 0.08;
    if (origin === "大阪" && dest.id === "shimoda") score -= 0.18;
    if (days <= 2 && dest.id === "yakushima") score -= 0.25;
    if (days <= 2 && dest.id === "sado") score -= 0.2;
    if (days <= 2 && dest.id === "ishigaki") score -= 0.22;

    return { dest, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function scalePlan(dest: Destination, days: number): DayPlan[] {
  const base = dest.plan.map((d) => ({ ...d, beats: [...d.beats] }));
  if (days <= 2) return base.slice(0, 2).map((d, i) => ({ ...d, day: i + 1 }));
  const extras = dest.extraDays.map((d, i) => ({ ...d, day: base.length + i + 1 }));
  const merged = [...base, ...extras];
  if (days <= merged.length) {
    return merged.slice(0, days).map((d, i) => ({ ...d, day: i + 1 }));
  }
  const rest: DayPlan[] = [];
  for (let i = merged.length; i < days; i++) {
    rest.push({
      day: i + 1,
      title: "余白の日",
      beats: [
        {
          time: "終日",
          place: dest.name,
          detail: "新しい場所を足さない。昨日よかった場所にもう一度行く。",
        },
      ],
    });
  }
  return [...merged, ...rest];
}

export { scalePlan };

function personalityReadLegacy(traits: Traits): string {
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

/** @deprecated use buildProposalAsync from proposal.ts */
export function buildProposal(traits: Traits, facts: Facts): Proposal {
  const days = facts.days ?? (traits.slow >= 0.6 ? 3 : 2);
  const byName = new Map<string, Destination>();
  for (const d of [
    ...destinations,
    ...prefectureDestinations,
    ...prefectureExtraDestinations,
    ...prefectureThirdDestinations,
    ...prefectureFourthDestinations,
    ...prefectureFifthDestinations,
    ...domesticExtraDestinations,
    ...overseasDestinations,
  ]) {
    if (!byName.has(d.name)) byName.set(d.name, d);
  }
  const pool = [...byName.values()];
  const ranked = rankDestinations(traits, facts, days, pool);
  const best = ranked[0].dest;
  const alts = ranked.slice(1, 3).map((row) => ({
    id: row.dest.id,
    name: row.dest.name,
    why: row.dest.hook,
    links: linksForDestination(row.dest),
  }));
  const access = originAccess(best, facts.origin ?? "東京");
  const plan = scalePlan(best, days);
  const min = best.dailyMin * days;
  const max = best.dailyMax * days;
  const note =
    facts.budgetBand === "low"
      ? "宿は小さめ、移動は公共交通。食事は市場と一軒で足る。"
      : facts.budgetBand === "high"
        ? "宿に寄せる。移動の疲れを、部屋で回収する想定。"
        : "移動と宿に半分、食べと入場に半分、くらいが無理ない。";

  return {
    id: best.id,
    name: best.name,
    region: best.region,
    country: best.country,
    hook: best.hook,
    why: best.why,
    personalityRead: personalityReadLegacy(traits),
    days,
    budget: { min, max, note },
    transport: access,
    plan,
    links: linksForDestination(best),
    alternatives: alts,
    sources: ["手元の旅データ"],
    candidateCount: pool.length,
  };
}
