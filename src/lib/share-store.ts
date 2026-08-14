import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import type { Proposal } from "./types";

export type ShareRecord = {
  id: string;
  proposal: Proposal;
  createdAt: number;
};

function shareDir() {
  const base = process.env.VERCEL ? "/tmp" : process.cwd();
  return path.join(base, ".furari-shares");
}

function sharePath(id: string) {
  return path.join(shareDir(), `${id}.json`);
}

export async function saveShare(proposal: Proposal): Promise<ShareRecord> {
  await mkdir(shareDir(), { recursive: true });
  const id = randomBytes(4).toString("hex");
  const record: ShareRecord = { id, proposal, createdAt: Date.now() };
  await writeFile(sharePath(id), JSON.stringify(record), "utf8");
  return record;
}

export async function loadShare(id: string): Promise<ShareRecord | null> {
  if (!/^[a-f0-9]{8}$/.test(id)) return null;
  try {
    const raw = await readFile(sharePath(id), "utf8");
    const parsed = JSON.parse(raw) as ShareRecord;
    if (!parsed?.proposal?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function shareUrl(id: string, request: Request) {
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}/share/${id}`;
}
