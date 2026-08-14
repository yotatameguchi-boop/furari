export type Role = "user" | "assistant";

export type ChatMessage = {
  role: Role;
  content: string;
};

export type Traits = {
  solitude: number;
  novelty: number;
  slow: number;
  nature: number;
  comfort: number;
  food: number;
  rest: number;
  culture: number;
};

export type BudgetBand = "low" | "mid" | "high";

export type TravelScope = "domestic" | "international" | "any";

export type Facts = {
  days?: number;
  budgetBand?: BudgetBand;
  budgetYen?: number;
  origin?: string;
  companions?: "solo" | "pair" | "group";
  namedPlace?: string;
  scope?: TravelScope;
  constraints: string[];
};

export type Phase = "rapport" | "texture" | "constraints" | "propose";

export type EngineState = {
  traits: Traits;
  facts: Facts;
  asked: string[];
  turn: number;
  phase: Phase;
  proposed: boolean;
};

export type Insight = {
  labels: string[];
  days?: number;
  budgetLabel?: string;
  origin?: string;
  companions?: string;
  scope?: string;
  ready: boolean;
};

export type TransportMode =
  | "shinkansen"
  | "train"
  | "bus"
  | "ferry"
  | "flight"
  | "walk"
  | "taxi"
  | "tram";

export type TransportLeg = {
  from: string;
  to: string;
  mode: TransportMode;
  duration: string;
  note?: string;
  transfer?: boolean;
};

export type DayBeat = {
  time: string;
  place: string;
  detail: string;
};

export type DayPlan = {
  day: number;
  title: string;
  beats: DayBeat[];
};

export type SpotLinks = {
  maps: string;
  wikipedia: string;
  osm?: string;
};

export type ProposalAlternative = {
  id: string;
  name: string;
  why: string;
  links: SpotLinks;
};

export type Proposal = {
  id: string;
  name: string;
  region: string;
  country?: string;
  hook: string;
  why: string;
  personalityRead: string;
  days: number;
  budget: { min: number; max: number; note: string };
  transport: { summary: string; legs: TransportLeg[] };
  plan: DayPlan[];
  links: SpotLinks;
  alternatives: ProposalAlternative[];
  sources: string[];
  candidateCount: number;
};

export type ChatResponse = {
  reply: string;
  state: EngineState;
  insights: Insight;
  proposal: Proposal | null;
};
