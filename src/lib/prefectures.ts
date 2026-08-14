import { buildDomesticCatalog, type DomesticSpot } from "./spot-builder";

/** 47都道府県 × 代表観光地 */
const SPOTS: DomesticSpot[] = [
  { prefecture: "北海道", name: "札幌", lat: 43.0618, lon: 141.3545, hook: "大通公園と市場。北国の街を歩く余白。", why: "遠出感がありつつ、国内でまとまった都市。", tags: "街 食べ歩き 市場" },
  { prefecture: "青森", name: "弘前", lat: 40.6031, lon: 140.4643, hook: "桜の城と、りんごの町。", why: "季節の移ろいがはっきりする北の小さな城下町。", tags: "城 古い町 自然" },
  { prefecture: "岩手", name: "平泉", lat: 38.9876, lon: 141.1132, hook: "中尊寺の金色と、奥州の静けさ。", why: "歴史と自然が短い距離で共存する。", tags: "寺 歴史 世界遺産" },
  { prefecture: "宮城", name: "松島", lat: 38.37, lon: 141.07, hook: "島々の影が海面に落ちる朝。", why: "日本三景のひとつ。動かずに見ていい。", tags: "海 島 自然" },
  { prefecture: "秋田", name: "田沢湖", lat: 39.7328, lon: 140.6636, hook: "深い青の湖と、周囲の山。", why: "人混みより、水と空気を見たい人。", tags: "湖 自然 温泉" },
  { prefecture: "山形", name: "银山温泉", lat: 38.5703, lon: 140.5306, hook: "雪の中の木造温泉街。", why: "休息と非日常が、短い距離で来る。", tags: "温泉 古い町 雪" },
  { prefecture: "福島", name: "会津若松", lat: 37.4948, lon: 139.9296, hook: "赤べこと鶴ヶ城。歴史の厚み。", why: "東北の奥に、しっかりした町文化がある。", tags: "城 歴史 町" },
  { prefecture: "茨城", name: "大洗", lat: 36.3148, lon: 140.5745, hook: "海の見える水族館と、港の空気。", why: "東京から近いのに、海の匂いが変わる。", tags: "海 港 自然" },
  { prefecture: "栃木", name: "日光", lat: 36.7581, lon: 139.5985, hook: "杉並木と社寺。深呼吸の旅。", why: "文化と自然を、日帰り圏外で味わえる。", tags: "寺 神社 自然 歴史" },
  { prefecture: "群馬", name: "草津温泉", lat: 36.621, lon: 138.596, hook: "湯畑の硫黄の匂い。", why: "休息優先。予定より湯。", tags: "温泉 休息" },
  { prefecture: "埼玉", name: "秩父", lat: 35.9923, lon: 139.0838, hook: "山と寺社。都心のすぐ裏側。", why: "近場で山の空気が欲しい人。", tags: "山 寺 自然" },
  { prefecture: "千葉", name: "鴨川", lat: 35.1158, lon: 140.099, hook: "太平洋の海岸と、ゆるいリゾート。", why: "海辺でだらけたい週末向け。", tags: "海 リゾート 休息" },
  { prefecture: "東京", name: "奥多摩", lat: 35.808, lon: 139.096, hook: "都内だけど、川と山。", why: "遠出せず、緑の密度を上げたい人。", tags: "山 川 自然" },
  { prefecture: "神奈川", name: "鎌倉", lat: 35.319, lon: 139.546, hook: "寺と海と、歩ける距離。", why: "歴史散歩と海風を同じ日に。", tags: "寺 海 古い町" },
  { prefecture: "新潟", name: "越後湯沢", lat: 36.936, lon: 138.812, hook: "雪と温泉と、米。", why: "冬でも、休息の理由がはっきりしている。", tags: "温泉 雪 自然" },
  { prefecture: "富山", name: "立山黒部", lat: 36.575, lon: 137.631, hook: "標高差が景色を作る。", why: "自然のスケールで頭を空にしたい人。", tags: "山 自然 国立公園" },
  { prefecture: "石川", name: "輪島", lat: 37.386, lon: 136.899, hook: "朝市と能登の海。", why: "金沢より静かな北陸の港。", tags: "海 市場 食べ歩き" },
  { prefecture: "福井", name: "東尋坊", lat: 36.255, lon: 136.108, hook: "断崖と日本海。風が先に来る。", why: "何もしない場所として優秀。", tags: "海 断崖 自然" },
  { prefecture: "山梨", name: "河口湖", lat: 35.517, lon: 138.751, hook: "富士の姿が、天気次第で変わる。", why: "定番だけど、富士を正面から見たい。", tags: "湖 山 自然" },
  { prefecture: "長野", name: "軽井沢", lat: 36.342, lon: 138.634, hook: "高原の木漏れ日。", why: "夏でも、秋でも、歩幅が遅くなる。", tags: "高原 自然 町" },
  { prefecture: "岐阜", name: "白川郷", lat: 36.255, lon: 136.906, hook: "合掌造りと、雪の静けさ。", why: "写真より、朝の生活音。", tags: "世界遺産 古い町 雪" },
  { prefecture: "静岡", name: "熱海", lat: 35.096, lon: 139.071, hook: "海と温泉。江の島より静か。", why: "短い日数で、湯と海。", tags: "温泉 海 休息" },
  { prefecture: "愛知", name: "名古屋", lat: 35.181, lon: 136.906, hook: "味噌と街。拠点として優秀。", why: "食と都市機能。周辺へ伸ばしやすい。", tags: "街 食べ歩き グルメ" },
  { prefecture: "三重", name: "伊勢", lat: 34.486, lon: 136.709, hook: "神宮と、おはらい町。", why: "国内の「原点」に近い旅。", tags: "神社 歴史 古い町" },
  { prefecture: "滋賀", name: "彦根", lat: 35.274, lon: 136.252, hook: "琵琶湖と城。近畿のど真ん中。", why: "京都ほど混まない、湖の旅。", tags: "城 湖 歴史" },
  { prefecture: "京都", name: "京都", lat: 35.011, lon: 135.768, hook: "寺社と路地。歩くほど深い。", why: "文化と食。定番の中の定番。", tags: "寺 神社 歴史 食べ歩き" },
  { prefecture: "大阪", name: "大阪", lat: 34.693, lon: 135.502, hook: "食べて、笑って、歩く。", why: "人混みも含めて、エネルギーが欲しい人。", tags: "街 グルメ 食べ歩き" },
  { prefecture: "兵庫", name: "神戸", lat: 34.69, lon: 135.195, hook: "港と異人館。夜の灯り。", why: "異国情緒を、国内で。", tags: "港 街 夜景" },
  { prefecture: "奈良", name: "奈良", lat: 34.685, lon: 135.805, hook: "鹿と古寺。時間がゆっくり。", why: "短距離で、古い日本。", tags: "寺 神社 歴史 自然" },
  { prefecture: "和歌山", name: "白浜", lat: 33.626, lon: 135.941, hook: "南の白い砂浜。", why: "関西から、海のリゾート。", tags: "海 温泉 リゾート" },
  { prefecture: "鳥取", name: "鳥取砂丘", lat: 35.54, lon: 134.228, hook: "砂漠のような風景。意外性。", why: "知られすぎていない、国内の空白。", tags: "砂丘 自然 秘境" },
  { prefecture: "島根", name: "出雲", lat: 35.367, lon: 132.754, hook: "出雲大社と、神話の土地。", why: "静かな西日本。人より神話。", tags: "神社 歴史 町" },
  { prefecture: "岡山", name: "岡山", lat: 34.655, lon: 133.919, hook: "後楽園と、晴れの国。", why: "瀬戸内の入口。倉敷へも伸ばせる。", tags: "庭園 歴史 街" },
  { prefecture: "広島", name: "宮島", lat: 34.296, lon: 132.32, hook: "海上の鳥居。潮の満ち引き。", why: "瀬戸内の象徴。写真より潮の音。", tags: "神社 島 海" },
  { prefecture: "山口", name: "萩", lat: 34.408, lon: 131.398, hook: "城下町と、日本海。", why: "歴史好きの、静かな西の端。", tags: "古い町 城 歴史" },
  { prefecture: "徳島", name: "鳴門", lat: 34.237, lon: 134.652, hook: "渦潮と、阿波の入口。", why: "自然の動きを、短時間で見れる。", tags: "海 自然" },
  { prefecture: "香川", name: "小豆島", lat: 34.481, lon: 134.233, hook: "オリーブと、瀬戸内の島。", why: "直島より静かな島旅。", tags: "島 海 自然" },
  { prefecture: "愛媛", name: "道後温泉", lat: 33.852, lon: 132.786, hook: "日本最古級の湯。", why: "休息と、少しのレトロ。", tags: "温泉 休息 歴史" },
  { prefecture: "高知", name: "四万十", lat: 33.009, lon: 132.933, hook: "清流と、緑の深さ。", why: "最後の清流。自然優先。", tags: "川 自然 秘境" },
  { prefecture: "福岡", name: "太宰府", lat: 33.522, lon: 130.535, hook: "天満宮と、博多の近さ。", why: "九州の玄関。食も近い。", tags: "神社 歴史 グルメ" },
  { prefecture: "佐賀", name: "嬉野", lat: 33.111, lon: 130.061, hook: "滑走泉の温泉町。", why: "小さな温泉街で、湯に集中。", tags: "温泉 町 休息" },
  { prefecture: "長崎", name: "長崎", lat: 32.75, lon: 129.868, hook: "坂と港。異国情緒の混ざり。", why: "国内だけど、海外に近い空気。", tags: "港 歴史 街 夜景" },
  { prefecture: "熊本", name: "阿蘇", lat: 32.884, lon: 131.084, hook: "カルデラと、草原。", why: "スケールの大きい自然。", tags: "山 自然 国立公園" },
  { prefecture: "大分", name: "由布院", lat: 33.263, lon: 131.354, hook: "盆地の温泉と、朝霧。", why: "別府より、静かな湯。", tags: "温泉 自然 休息" },
  { prefecture: "宮崎", name: "高千穂", lat: 32.711, lon: 131.312, hook: "峡谷と、神話。", why: "九州の秘境。夜神楽の季節は別次元。", tags: "峡谷 自然 秘境 歴史" },
  { prefecture: "鹿児島", name: "桜島", lat: 31.593, lon: 130.658, hook: "活火山と、海。", why: "島と火山。日常が非日常。", tags: "火山 海 自然" },
  { prefecture: "沖縄", name: "那覇", lat: 26.212, lon: 127.679, hook: "首里城と、南の空。", why: "国内だけど、完全に別の空気。", tags: "海 歴史 リゾート" },
];

export const prefectureDestinations = buildDomesticCatalog(SPOTS, "pref");

export const prefectureNames = SPOTS.map((s) => s.prefecture);

export function spotByPrefecture(name: string) {
  return SPOTS.find((s) => s.prefecture === name || s.name === name);
}
