import { nextTurn } from "@/lib/engine";
import type { ChatMessage, EngineState } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    messages?: ChatMessage[];
    state?: EngineState;
  };

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const result = await nextTurn(messages, body.state);
  return Response.json(result);
}
