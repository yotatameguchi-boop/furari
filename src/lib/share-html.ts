import type { Proposal } from "./types";

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const modeLabel: Record<string, string> = {
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

function linkRow(links: Proposal["links"]) {
  const chips = [
    `<a class="chip" href="${escapeHtml(links.maps)}" target="_blank" rel="noopener noreferrer">Google マップ</a>`,
    `<a class="chip" href="${escapeHtml(links.wikipedia)}" target="_blank" rel="noopener noreferrer">Wikipedia</a>`,
  ];
  if (links.osm) {
    chips.push(
      `<a class="chip" href="${escapeHtml(links.osm)}" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>`,
    );
  }
  return `<div class="chips">${chips.join("")}</div>`;
}

export function buildStandaloneShareHtml(proposal: Proposal) {
  const planHtml = proposal.plan
    .map(
      (day) => `
      <section class="day">
        <p class="day-label">${day.day}日目</p>
        <h3>${escapeHtml(day.title)}</h3>
        <ul>
          ${day.beats
            .map(
              (beat) => `
            <li>
              <span class="time">${escapeHtml(beat.time)}</span>
              <strong>${escapeHtml(beat.place)}</strong>
              <span class="detail">${escapeHtml(beat.detail)}</span>
            </li>`,
            )
            .join("")}
        </ul>
      </section>`,
    )
    .join("");

  const legsHtml = proposal.transport.legs
    .map(
      (leg) => `
      <li>
        <strong>${escapeHtml(leg.from)} → ${escapeHtml(leg.to)}</strong>
        <span class="meta">${modeLabel[leg.mode] ?? leg.mode} · ${escapeHtml(leg.duration)}${leg.transfer ? " · 乗換" : ""}</span>
        ${leg.note ? `<span class="note">${escapeHtml(leg.note)}</span>` : ""}
      </li>`,
    )
    .join("");

  const altsHtml =
    proposal.alternatives.length > 0
      ? `
      <section>
        <h2>もし違ったら</h2>
        <ul class="alts">
          ${proposal.alternatives
            .map(
              (alt) => `
            <li>
              <strong>${escapeHtml(alt.name)}</strong>
              <span class="detail">${escapeHtml(alt.why)}</span>
              ${linkRow(alt.links)}
            </li>`,
            )
            .join("")}
        </ul>
      </section>`
      : "";

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(proposal.name)} — ふらり</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #1e3340;
      --muted: #5f737c;
      --line: #d8e4ea;
      --teal: #5a9fb0;
      --teal-deep: #3d7f90;
      --paper: #f3f8fb;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Hiragino Sans", "Noto Sans JP", sans-serif;
      color: var(--ink);
      background: linear-gradient(180deg, #eef6f9 0%, #f8fbfd 100%);
      line-height: 1.7;
    }
    main {
      max-width: 42rem;
      margin: 0 auto;
      padding: 2rem 1rem 3rem;
    }
    .badge {
      font-size: 0.7rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--teal);
      font-weight: 600;
    }
    h1 {
      font-family: Georgia, "Noto Serif JP", serif;
      font-size: clamp(1.9rem, 5vw, 2.4rem);
      line-height: 1.2;
      margin: 0.5rem 0 0;
    }
    h2 {
      font-family: Georgia, "Noto Serif JP", serif;
      font-size: 1.15rem;
      margin: 2rem 0 0.75rem;
    }
    .hook { color: var(--muted); margin: 0.75rem 0 0; }
    .card {
      margin-top: 1.5rem;
      border: 1px solid var(--line);
      border-radius: 1.25rem;
      background: rgba(255,255,255,0.96);
      padding: 1.25rem;
      box-shadow: 0 10px 28px rgba(36, 72, 90, 0.05);
    }
    .read {
      margin-top: 1rem;
      padding: 0.85rem 1rem;
      border-radius: 1rem;
      background: var(--paper);
      font-size: 0.92rem;
    }
    .chips, .meta-row { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.75rem; }
    .chip, .pill {
      display: inline-flex;
      align-items: center;
      border-radius: 9999px;
      border: 1px solid #b9d6df;
      background: white;
      padding: 0.25rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--teal-deep);
      text-decoration: none;
    }
    .day {
      margin-top: 1rem;
      padding: 1rem;
      border: 1px solid var(--line);
      border-radius: 1rem;
      background: rgba(255,255,255,0.75);
    }
    .day-label { font-size: 0.75rem; color: var(--teal); font-weight: 600; margin: 0; }
    .day h3 { margin: 0.25rem 0 0.75rem; font-family: Georgia, "Noto Serif JP", serif; }
    ul { margin: 0; padding-left: 1.1rem; }
    li { margin: 0.55rem 0; }
    .time { color: var(--muted); margin-right: 0.35rem; }
    .detail { display: block; color: var(--ink); opacity: 0.85; }
    .meta, .note { display: block; font-size: 0.82rem; color: var(--muted); }
    .footer {
      margin-top: 2rem;
      font-size: 0.82rem;
      color: var(--muted);
      text-align: center;
    }
    .alts { padding: 0; list-style: none; }
    .alts li { margin: 0.75rem 0; padding: 0.75rem; border: 1px solid var(--line); border-radius: 0.75rem; }
  </style>
</head>
<body>
  <main>
    <p class="badge">ふらり · 共有された旅の提案</p>
    <h1>${escapeHtml(proposal.name)}</h1>
    <p class="hook">${escapeHtml(proposal.hook)}</p>
    <article class="card">
      ${linkRow(proposal.links)}
      <p class="read">${escapeHtml(proposal.personalityRead)}</p>
      <div class="meta-row">
        <span class="pill">${proposal.days}日</span>
        <span class="pill">${yen(proposal.budget.min)} – ${yen(proposal.budget.max)}</span>
        <span class="pill">${escapeHtml(proposal.region)}</span>
      </div>
      <p class="detail">${escapeHtml(proposal.budget.note)}</p>
      <h2>乗り継ぎ</h2>
      <p class="detail">${escapeHtml(proposal.transport.summary)}</p>
      <ul>${legsHtml}</ul>
      <h2>計画</h2>
      ${planHtml}
      ${altsHtml}
    </article>
    <p class="footer">このファイルはふらりで作成されました。サーバー不要で開けます。</p>
  </main>
</body>
</html>`;
}

export function downloadStandaloneShareHtml(proposal: Proposal) {
  const html = buildStandaloneShareHtml(proposal);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeName = proposal.name.replace(/[\\/:*?"<>|]/g, "").trim() || "proposal";
  anchor.href = url;
  anchor.download = `furari-${safeName}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}
