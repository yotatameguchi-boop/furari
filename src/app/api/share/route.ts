import { networkInterfaces } from "os";
import { encodeProposalShare } from "@/lib/share-codec";
import type { Proposal } from "@/lib/types";

function requestOrigin(request: Request) {
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

function lanOrigin(port = "3000") {
  const nets = networkInterfaces();
  for (const entries of Object.values(nets)) {
    for (const net of entries ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        return `http://${net.address}:${port}`;
      }
    }
  }
  return null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { proposal?: Proposal };
  const proposal = body.proposal;

  if (!proposal?.id || !proposal?.name || !proposal?.links) {
    return Response.json({ error: "提案データが不正です" }, { status: 400 });
  }

  const token = encodeProposalShare(proposal);
  const origin = requestOrigin(request);
  const host = request.headers.get("host") ?? "localhost:3000";
  const port = host.includes(":") ? host.split(":")[1] : "3000";
  const path = `/share?p=${encodeURIComponent(token)}`;
  const lan = lanOrigin(port);
  const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
  const publicOrigin = isLocalhost && lan ? lan : origin;

  return Response.json({
    token,
    path,
    url: `${publicOrigin}${path}`,
    isLocalhost,
    offlineReady: true,
  });
}
