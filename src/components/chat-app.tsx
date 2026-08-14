"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { openingMessage, starters } from "@/lib/conversation";
import type { ChatMessage, ChatResponse, EngineState, Insight, Proposal } from "@/lib/types";
import { InsightPanel } from "./insight-panel";
import { ProposalCard } from "./proposal-card";

const emptyInsights: Insight = { labels: [], ready: false };
const initialMessages: ChatMessage[] = [{ role: "assistant", content: openingMessage }];

export function ChatApp() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [state, setState] = useState<EngineState | undefined>(undefined);
  const [insights, setInsights] = useState<Insight>(emptyInsights);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, proposal, busy]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, state }),
      });
      if (!res.ok) throw new Error("返信を作れませんでした");
      const data = (await res.json()) as ChatResponse;
      setState(data.state);
      setInsights(data.insights);
      setProposal(data.proposal);
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  function reset() {
    if (busy) return;
    setMessages(initialMessages);
    setState(undefined);
    setInsights(emptyInsights);
    setProposal(null);
    setDraft("");
    setError(null);
  }

  const showStarters = messages.length === 1 && !busy;
  const canReset = messages.length > 1 || proposal != null || insights.labels.length > 0;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] text-[var(--accent)] uppercase">
            なんとなくから、旅が決まる
          </p>
          <h1 className="font-serif mt-1 text-4xl text-[var(--ink)] sm:text-5xl">ふらり</h1>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <p className="max-w-md text-sm leading-6 text-[var(--muted)] sm:text-right">
            予算も日数も性格も、フォームには書かない。雑談の途中から、行き先と乗り継ぎを探す。
          </p>
          {canReset && (
            <button
              type="button"
              className="reset-btn"
              onClick={reset}
              disabled={busy}
            >
              リセット
            </button>
          )}
        </div>
      </header>

      <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="chat-shell flex min-h-[70vh] flex-col rounded-[1.75rem]">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
            {messages.map((message, i) => (
              <div
                key={`${message.role}-${i}`}
                className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div className={message.role === "user" ? "bubble-user" : "bubble-assist"}>
                  {message.content}
                </div>
              </div>
            ))}

            {proposal && <ProposalCard proposal={proposal} />}

            {busy && (
              <div className="flex justify-start">
                <div className="bubble-assist text-[var(--muted)]">
                  検索中…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {showStarters && (
            <div className="flex flex-wrap gap-2 px-4 pb-2 sm:px-6">
              {starters.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  className="chip chip-btn"
                  onClick={() => void send(starter)}
                >
                  {starter}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className="border-t border-[var(--line)] px-4 py-4 sm:px-6"
          >
            <label className="sr-only" htmlFor="chat-input">
              メッセージ
            </label>
            <div className="flex gap-2">
              <textarea
                id="chat-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(draft);
                  }
                }}
                rows={2}
                placeholder="行き先は書かなくていい。最近の話で。"
                className="composer"
                disabled={busy}
              />
              <button type="submit" className="send-btn" disabled={busy || !draft.trim()}>
                送る
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-[var(--terracotta)]">{error}</p>}
          </form>
        </section>

        <InsightPanel insights={insights} />
      </div>
    </div>
  );
}
