# ふらり

行き先も目的も、最初には聞かない旅のアプリです。

雑談から性格・日数・予算の気配を拾い、合いそうな旅先と乗り継ぎ、日程を提案します。PDFにあった要件——具体的な話から始めない、なんとなくから計画する——をそのまま中心にしています。

## 動かし方

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開く。

## 使い方

1. 「最近の休み」みたいな話から始める
2. 行き先・日程のフォームは出さない
3. 会話の輪郭が足りたら、複数APIから集めた候補の中から旅先・予算感・乗換・日ごとの計画が出る

## 参照API（APIキー不要）

- **Nominatim / Overpass** — OpenStreetMap の地名・観光スポット
- **Wikipedia** — 旅先の概要
- **Wikidata** — 観光地・温泉の構造化データ
- **Open-Meteo** — 地名の位置確認

## 置き場所

| 役割 | 場所 |
| --- | --- |
| 会話と提案の流れ | `src/lib/engine.ts` |
| 性格の読み取り | `src/lib/personality.ts` |
| 国内（詳細） | `src/lib/destinations.ts` — 12か所 |
| 47都道府県 | `src/lib/prefectures.ts` — 各1か所 |
| 都道府県第2候補 | `src/lib/prefecture-extra.ts` — 47か所 |
| 都道府県第3候補 | `src/lib/prefecture-third.ts` — 47か所 |
| 都道府県第4候補 | `src/lib/prefecture-fourth.ts` — 47か所 |
| 国内追加 | `src/lib/domestic-extra.ts` — 110か所 |
| 海外 | `src/lib/overseas.ts` — 76か所 |
| 外部API | `src/lib/discover.ts` — 検索時に最大 **200件** 追加（生候補500件まで取得） |
| 画面 | `src/components/chat-app.tsx` |

**手元データ合計：約380か所**（同名はマージ時に1件に）＋ API で最大200件追加。

上限は `src/lib/discover.ts` の `DISCOVERY_LIMITS` で一括調整できます。
