import type { Proposal, SpotLinks, TransportMode } from "@/lib/types";
import { beatMapsUrl } from "@/lib/spot-links";
import { ShareButton } from "./share-button";

const modeLabel: Record<TransportMode, string> = {
  shinkansen: "新幹線",
  train: "電車",
  bus: "バス",
  ferry: "船",
  flight: "飛行機",
  walk: "徒歩",
  taxi: "タクシー",
  tram: "路面電車",
};

function yen(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}

function SpotLinkRow({ links, compact }: { links: SpotLinks; compact?: boolean }) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-4"}`}>
      <a
        href={links.maps}
        target="_blank"
        rel="noopener noreferrer"
        className="link-chip"
      >
        Google マップ
      </a>
      <a
        href={links.wikipedia}
        target="_blank"
        rel="noopener noreferrer"
        className="link-chip"
      >
        Wikipedia
      </a>
      {links.osm && (
        <a
          href={links.osm}
          target="_blank"
          rel="noopener noreferrer"
          className="link-chip"
        >
          OpenStreetMap
        </a>
      )}
    </div>
  );
}

export function ProposalCard({
  proposal,
  showShare = true,
}: {
  proposal: Proposal;
  showShare?: boolean;
}) {
  return (
    <article className="proposal">
      <p className="text-[11px] font-medium tracking-[0.2em] text-[var(--accent)] uppercase">
        提案 · {proposal.region}
      </p>
      <h2 className="font-serif mt-2 text-3xl leading-tight text-[var(--ink)] sm:text-4xl">
        {proposal.name}
      </h2>
      <p className="mt-3 text-base leading-7 text-[var(--muted)]">{proposal.hook}</p>

      {showShare && <ShareButton proposal={proposal} />}

      <SpotLinkRow links={proposal.links} />

      <p className="mt-5 rounded-2xl bg-[var(--paper)] px-4 py-3 text-sm leading-7 text-[var(--ink)]">
        {proposal.personalityRead}
      </p>

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        <span className="chip">{proposal.days}日</span>
        <span className="chip">
          {yen(proposal.budget.min)} – {yen(proposal.budget.max)}
        </span>
        <span className="chip">{proposal.region}</span>
        <span className="chip">{proposal.candidateCount}候補から選定</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{proposal.budget.note}</p>
      {proposal.sources.length > 0 && (
        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
          参照: {proposal.sources.join(" · ")}
        </p>
      )}

      <section className="mt-8">
        <h3 className="font-serif text-lg">乗り継ぎ</h3>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{proposal.transport.summary}</p>
        <ol className="mt-4 space-y-0">
          {proposal.transport.legs.map((leg, i) => (
            <li key={`${leg.from}-${leg.to}-${i}`} className="leg">
              <div className="leg-rail" aria-hidden>
                <span className="leg-dot" />
                {i < proposal.transport.legs.length - 1 && <span className="leg-line" />}
              </div>
              <div className="pb-5">
                <p className="text-sm font-medium">
                  {leg.from}
                  <span className="mx-2 text-[var(--muted)]">→</span>
                  {leg.to}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {modeLabel[leg.mode]} · {leg.duration}
                  {leg.transfer ? " · 乗換" : ""}
                </p>
                {leg.note && <p className="mt-1 text-xs leading-5 text-[var(--ink)]/80">{leg.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-2">
        <h3 className="font-serif text-lg">計画</h3>
        <div className="mt-4 space-y-5">
          {proposal.plan.map((day) => (
            <div key={day.day} className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
              <p className="text-xs font-medium tracking-wide text-[var(--teal)]">
                {day.day}日目
              </p>
              <h4 className="font-serif mt-1 text-lg">{day.title}</h4>
              <ul className="mt-3 space-y-3">
                {day.beats.map((beat) => (
                  <li key={`${day.day}-${beat.time}-${beat.place}`} className="text-sm leading-6">
                    <span className="text-[var(--muted)]">{beat.time}</span>
                    {beat.place === "移動" ? (
                      <span className="mx-2 font-medium">{beat.place}</span>
                    ) : (
                      <a
                        href={beatMapsUrl(beat.place, proposal.region, proposal.country)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-2 font-medium text-[var(--teal-deep)] underline decoration-[var(--teal-light)] underline-offset-2 hover:text-[var(--teal)]"
                      >
                        {beat.place}
                      </a>
                    )}
                    <span className="block text-[var(--ink)]/85 sm:inline sm:before:content-['—_']">
                      {beat.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {proposal.alternatives.length > 0 && (
        <section className="mt-8">
          <h3 className="font-serif text-lg">もし違ったら</h3>
          <ul className="mt-3 space-y-2">
            {proposal.alternatives.map((alt) => (
              <li
                key={alt.id}
                className="rounded-xl border border-[var(--line)] px-3 py-2 text-sm leading-6"
              >
                <span className="font-medium">{alt.name}</span>
                <span className="mt-0.5 block text-[var(--muted)]">{alt.why}</span>
                <SpotLinkRow links={alt.links} compact />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
