import { budgetLabel, companionLabel, scopeLabel, signalStrength, traitLabels } from "./personality";
import type { EngineState, Facts, Insight, Phase, Traits } from "./types";

type Topic = {
  id: string;
  phase: Phase;
  question: string;
  when?: (traits: Traits, facts: Facts) => boolean;
};

const topics: Topic[] = [
  {
    id: "weekend",
    phase: "rapport",
    question: "休みの日って、だいたい何して過ごしてる？",
  },
  {
    id: "energy",
    phase: "rapport",
    question: "人といると充電される方？ それとも、ひとりに戻った瞬間に楽になる方？",
  },
  {
    id: "tired",
    phase: "rapport",
    question: "最近いちばん多かった感情、なんとなくでいいんだけど、疲れてる感じ？ 退屈？ そわそわ？",
  },
  {
    id: "relief",
    phase: "texture",
    question: "このあいだ「あ、ちょっと戻った」って思った瞬間、あった？ 場所でも、食べ物でも、何でも。",
  },
  {
    id: "pace",
    phase: "texture",
    question: "もし数日だけ日常から外れるとしたら、予定で埋めた方が安心？ それとも、空白が多い方がいい？",
  },
  {
    id: "air",
    phase: "texture",
    question: "今、体が欲してる空気ってどんな感じ？ 海の塩気、山の冷気、古い町の木の匂い、街の夜、とか。",
  },
  {
    id: "food",
    phase: "texture",
    question: "旅の記憶って、景色より先に「あれ食べた」が残るタイプ？ それとも、場所の雰囲気の方？",
  },
  {
    id: "walk",
    phase: "texture",
    question: "一日中歩くの、好き？ それとも、途中で長く座れる場所がないと息が詰まる？",
  },
  {
    id: "days",
    phase: "constraints",
    question: "行き先はまだ置いといて。現実的に、何日くらいなら日常を空けられそう？",
    when: (_traits, facts) => !facts.days,
  },
  {
    id: "money",
    phase: "constraints",
    question: "お金の話、雑に聞くね。旅ってつい使いすぎる方？ それとも、先に上限を決める方？",
    when: (_traits, facts) => !facts.budgetBand && !facts.budgetYen,
  },
  {
    id: "origin",
    phase: "constraints",
    question: "今、どこ起点で動く感じ？ 東京とか大阪とか、ざっくりでいい。",
    when: (_traits, facts) => !facts.origin,
  },
];

export const openingMessage =
  "最近、なんか心がざらつく日、続いてない？ 行き先とか目的とか、今は決めなくていい。最近の休みの話、ちょっと聞かせて。";

export const starters = [
  "最近ちょっと疲れてる",
  "休みの日はだいたい家",
  "人と会うのは好き",
  "まだ行き先、決まってない",
];

function wantsProposal(text: string) {
  return /提案|計画|行き先|どこがいい|決めて|教えて|プラン/.test(text);
}

function namedPlaceDeflect(place: string) {
  return `${place}、頭に浮かぶんだね。でも今は地名より、最近どんな空気を求めてるかの方が大事かも。`;
}

function reflect(text: string, traits: Traits, facts: Facts): string {
  if (facts.namedPlace && /行きたい|行こう|にする/.test(text)) {
    return namedPlaceDeflect(facts.namedPlace);
  }
  if (/疲れ|しんど|眠い|休/.test(text)) {
    return "無理して予定を詰める旅は、今は合わなそうだね。";
  }
  if (/家|ひきこも|何もしない|だらだら/.test(text)) {
    return "家が好きな人ほど、遠くより“空気が変わる場所”の方が効くことがある。";
  }
  if (/食べ|美味|グルメ|飯/.test(text)) {
    return "旅の軸、たぶん景色より先に食べた記憶になりそう。";
  }
  if (/ひとり|一人|人混み/.test(text)) {
    return "人に気を遣わない時間、欲しがってる感じがする。";
  }
  if (/友達|みんな|ワイワイ|人と/.test(text)) {
    return "完全にひとり、というより、誰かの気配がある方が心地いいのかも。";
  }
  if (/海|山|森|自然/.test(text)) {
    return "建物の密度より、空気が先に変わる方がよさそう。";
  }
  if (/わからない|なんとなく|決まってない|特にない/.test(text)) {
    return "決まってないままでいいよ。なんとなくの方が、正確なことある。";
  }
  if (traits.slow >= 0.62) {
    return "話してる感じ、余白がある場所の方が呼吸できそう。";
  }
  if (traits.rest >= 0.62) {
    return "今は新しい自分を探す、より先に、神経系を戻す順番かも。";
  }
  return "うん、その感じ、拾っておくね。";
}

function nextTopic(state: EngineState): Topic | undefined {
  const asked = new Set(state.asked);
  const order: Phase[] =
    state.phase === "rapport"
      ? ["rapport", "texture", "constraints"]
      : state.phase === "texture"
        ? ["texture", "constraints", "rapport"]
        : ["constraints", "texture", "rapport"];

  for (const phase of order) {
    const found = topics.find(
      (t) =>
        t.phase === phase &&
        !asked.has(t.id) &&
        (!t.when || t.when(state.traits, state.facts)),
    );
    if (found) return found;
  }
  return topics.find((t) => !asked.has(t.id) && (!t.when || t.when(state.traits, state.facts)));
}

export function shouldPropose(state: EngineState, lastUser: string) {
  if (wantsProposal(lastUser)) return true;
  if (state.proposed) return true;
  const strength = signalStrength(state.traits);
  if (state.turn >= 4 && strength >= 0.55) return true;
  if (state.turn >= 5 && (state.facts.days || state.facts.budgetBand)) return true;
  if (state.turn >= 6) return true;
  return false;
}

export function advancePhase(state: EngineState): Phase {
  if (state.turn >= 4) return "constraints";
  if (state.turn >= 2) return "texture";
  return "rapport";
}

export function composeReply(state: EngineState, lastUser: string, proposing: boolean) {
  const reflection = reflect(lastUser, state.traits, state.facts);
  if (proposing) {
    if (state.proposed) {
      return `${reflection} 今の話を足して、組み直したよ。`;
    }
    return `${reflection} 話してるうちに、だいたい見えてきた。行き先を先に決めるんじゃなくて、今の空気に合いそうな場所から組んだよ。`;
  }
  const topic = nextTopic(state);
  if (!topic) {
    return `${reflection} もう少しで形にできそう。いまの話の延長で、提案してもいい？`;
  }
  return `${reflection} ${topic.question}`;
}

export function markAsked(state: EngineState, reply: string) {
  const hit = topics.find((t) => reply.includes(t.question));
  if (hit && !state.asked.includes(hit.id)) {
    state.asked = [...state.asked, hit.id];
  }
}

export function toInsights(state: EngineState): Insight {
  return {
    labels: traitLabels(state.traits),
    days: state.facts.days,
    budgetLabel: budgetLabel(state.facts),
    origin: state.facts.origin,
    companions: companionLabel(state.facts),
    scope: scopeLabel(state.facts),
    ready: state.proposed,
  };
}
