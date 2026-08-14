"use client";

import { useState } from "react";
import type { Proposal } from "@/lib/types";
import { downloadStandaloneShareHtml } from "@/lib/share-html";

type Props = {
  proposal: Proposal;
};

type ShareResponse = {
  url: string;
  isLocalhost: boolean;
  offlineReady: boolean;
};

export function ShareButton({ proposal }: Props) {
  const [status, setStatus] = useState<"idle" | "busy" | "copied" | "shared" | "error">("idle");
  const [share, setShare] = useState<ShareResponse | null>(null);

  async function createShareLink() {
    setStatus("busy");
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal }),
      });
      if (!res.ok) throw new Error("share failed");
      const data = (await res.json()) as ShareResponse;
      setShare(data);

      downloadStandaloneShareHtml(proposal);

      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: `ふらり — ${proposal.name}`,
            text: proposal.hook,
            url: data.url,
          });
          setStatus("shared");
          return;
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            setStatus("idle");
            return;
          }
        }
      }

      await navigator.clipboard.writeText(data.url);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  async function copyUrl() {
    if (!share?.url) return;
    await navigator.clipboard.writeText(share.url);
    setStatus("copied");
  }

  function saveHtml() {
    downloadStandaloneShareHtml(proposal);
    setStatus("copied");
  }

  const label =
    status === "busy"
      ? "作成中…"
      : status === "copied"
        ? "保存・コピーした"
        : status === "shared"
          ? "共有した"
          : status === "error"
            ? "失敗した。もう一度"
            : "共有する";

  return (
    <div className="mt-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="share-btn"
          onClick={() => void createShareLink()}
          disabled={status === "busy"}
        >
          {label}
        </button>
        {share && status !== "busy" && (
          <>
            <button type="button" className="link-chip" onClick={() => void copyUrl()}>
              リンクをコピー
            </button>
            <button type="button" className="link-chip" onClick={saveHtml}>
              HTMLを保存
            </button>
          </>
        )}
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs leading-5 text-[var(--muted)]">
        {share?.isLocalhost ? (
          <p>
            <strong className="text-[var(--ink)]">開発中の共有</strong>
            ：<code className="text-[var(--teal-deep)]">localhost</code>{" "}
            のリンクは相手の端末では開けません。自動保存した{" "}
            <strong className="text-[var(--ink)]">HTMLファイル</strong>
            を送るのが確実です。同じWi-Fiなら下のLANリンクも使えます（開発サーバー起動中のみ）。
          </p>
        ) : (
          <p>
            <strong className="text-[var(--ink)]">HTMLファイル</strong>
            も一緒に保存されます。サーバーがなくても開けるので、メールやLINEで送るときに便利です。
          </p>
        )}
      </div>

      {share?.url && status !== "busy" && (
        <input
          readOnly
          value={share.url}
          aria-label="共有リンク"
          className="share-url w-full"
          onFocus={(e) => e.currentTarget.select()}
        />
      )}
    </div>
  );
}
