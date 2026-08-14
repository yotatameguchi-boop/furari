import { composeReply, markAsked, shouldPropose, toInsights, advancePhase } from "./conversation";
import { buildProposalAsync } from "./proposal";
import { buildProposal } from "./destinations";
import { emptyFacts, emptyTraits, readMessage } from "./personality";
import type { ChatMessage, ChatResponse, EngineState } from "./types";

export function initialState(): EngineState {
  return {
    traits: emptyTraits(),
    facts: emptyFacts(),
    asked: ["weekend"],
    turn: 0,
    phase: "rapport",
    proposed: false,
  };
}

export async function nextTurn(
  messages: ChatMessage[],
  prev?: EngineState,
): Promise<ChatResponse> {
  const state: EngineState = prev
    ? {
        ...prev,
        traits: { ...prev.traits },
        facts: { ...prev.facts, constraints: [...prev.facts.constraints] },
        asked: [...prev.asked],
      }
    : initialState();

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return {
      reply: "",
      state,
      insights: toInsights(state),
      proposal: null,
    };
  }

  const extracted = readMessage(lastUser.content, state.traits, state.facts);
  state.traits = extracted.traits;
  state.facts = extracted.facts;
  state.turn += 1;
  state.phase = advancePhase(state);

  const proposing = shouldPropose(state, lastUser.content);
  const reply = composeReply(state, lastUser.content, proposing);
  markAsked(state, reply);

  if (proposing) {
    state.proposed = true;
    state.phase = "propose";
    let proposal;
    try {
      proposal = await buildProposalAsync(state.traits, state.facts);
    } catch {
      proposal = buildProposal(state.traits, state.facts);
    }
    return {
      reply,
      state,
      insights: toInsights(state),
      proposal,
    };
  }

  return {
    reply,
    state,
    insights: toInsights(state),
    proposal: null,
  };
}
