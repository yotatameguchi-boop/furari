import type { Insight } from "@/lib/types";

export function InsightPanel({ insights }: { insights: Insight }) {
  const empty =
    insights.labels.length === 0 &&
    !insights.days &&
    !insights.budgetLabel &&
    !insights.origin &&
    !insights.companions &&
    !insights.scope;

  return (
    <aside className="pop-panel flex flex-col gap-5 p-5 lg:p-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.18em] text-[var(--accent)] uppercase">
          輪郭
        </p>
        <h2 className="font-serif mt-1 text-xl text-[var(--ink)]">会話から見えてきたこと</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          行き先は聞かない。話し方と休みの日の感じから、少しずつ輪郭を拾う。
        </p>
      </div>

      {empty ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] bg-white/50 px-4 py-8 text-center text-sm leading-6 text-[var(--muted)]">
          まだ、なんとなくのまま。
          <br />
          それがちょうどいい。
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {insights.labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {insights.labels.map((label) => (
                <span key={label} className="chip">
                  {label}
                </span>
              ))}
            </div>
          )}
          <dl className="grid gap-3 text-sm">
            {insights.days && (
              <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
                <dt className="text-[var(--muted)]">日数の気配</dt>
                <dd className="font-medium">{insights.days}日くらい</dd>
              </div>
            )}
            {insights.budgetLabel && (
              <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
                <dt className="text-[var(--muted)]">お金の感じ</dt>
                <dd className="font-medium">{insights.budgetLabel}</dd>
              </div>
            )}
            {insights.origin && (
              <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
                <dt className="text-[var(--muted)]">起点</dt>
                <dd className="font-medium">{insights.origin}</dd>
              </div>
            )}
            {insights.companions && (
              <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
                <dt className="text-[var(--muted)]">誰と</dt>
                <dd className="font-medium">{insights.companions}</dd>
              </div>
            )}
            {insights.scope && (
              <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
                <dt className="text-[var(--muted)]">行き先の幅</dt>
                <dd className="font-medium">{insights.scope}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <p className="mt-auto text-xs leading-5 text-[var(--muted)]">
        ふらりの検索は、キーワードではなく会話。性格と予算と日数が揃ったところで、旅先と乗り継ぎを組む。
      </p>
    </aside>
  );
}
