import { gunzipSync, gzipSync } from "zlib";
import type { Proposal } from "./types";

type SharePayload = {
  v: 1;
  proposal: Proposal;
};

export function encodeProposalShare(proposal: Proposal): string {
  const payload: SharePayload = { v: 1, proposal };
  const compressed = gzipSync(Buffer.from(JSON.stringify(payload), "utf8"));
  return compressed.toString("base64url");
}

export function decodeProposalShare(token: string): Proposal | null {
  try {
    const raw = token.trim();
    if (!raw) return null;
    const compressed = Buffer.from(raw, "base64url");
    const json = gunzipSync(compressed).toString("utf8");
    const parsed = JSON.parse(json) as SharePayload;
    if (parsed.v !== 1 || !parsed.proposal?.name || !parsed.proposal?.links) {
      return null;
    }
    return parsed.proposal;
  } catch {
    return null;
  }
}

export function buildSharePath(token: string) {
  return `/share?p=${encodeURIComponent(token)}`;
}
