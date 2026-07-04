const fmtINR = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

const BLOCK_ORDER = ["A", "B", "C", "D", "E", "F"];

function init() {
  document.getElementById("generatedDate").textContent = SITE_DATA.generated;

  renderGlance();
  renderBlockTable();
  renderBlockTabs();
  renderFooter();
}

function renderGlance() {
  let totalFlats = 0;
  let flatsContributed = 0;
  BLOCK_ORDER.forEach((b) => {
    const bd = SITE_DATA.blocks[b];
    totalFlats += bd.totalFlats;
    flatsContributed += bd.flatsContributed;
  });

  document.getElementById("totalCollected").textContent = fmtINR(SITE_DATA.overallCollected);
  document.getElementById("flatsContributed").textContent = `${flatsContributed} / ${totalFlats}`;
  document.getElementById("totalFlatsAll").textContent = totalFlats;
  document.getElementById("contribPct").textContent =
    ((flatsContributed / totalFlats) * 100).toFixed(1) + "%";
}

function renderBlockTable() {
  const el = document.getElementById("blockTable");
  let rows = "";
  let totalCollected = 0;
  let totalContributed = 0;
  let totalFlats = 0;

  BLOCK_ORDER.forEach((b) => {
    const bd = SITE_DATA.blocks[b];
    totalCollected += bd.totalCollected;
    totalContributed += bd.flatsContributed;
    totalFlats += bd.totalFlats;
    const pct = ((bd.flatsContributed / bd.totalFlats) * 100).toFixed(1);
    rows += `<tr>
      <td>Block ${b}</td>
      <td>${bd.flatsContributed} / ${bd.totalFlats}</td>
      <td>${pct}%</td>
      <td>${fmtINR(bd.totalCollected)}</td>
    </tr>`;
  });

  const unassignedTotal =
    SITE_DATA.unassigned.reduce((s, e) => s + e.amount, 0) +
    SITE_DATA.lumpSums.reduce((s, e) => s + e.amount, 0);
  if (unassignedTotal > 0) {
    totalCollected += unassignedTotal;
    rows += `<tr>
      <td>Unassigned (no flat number)</td>
      <td>—</td>
      <td>—</td>
      <td>${fmtINR(unassignedTotal)}</td>
    </tr>`;
  }

  const overallPct = ((totalContributed / totalFlats) * 100).toFixed(1);

  el.innerHTML = `
    <thead><tr><th>Block</th><th>Flats Contributed</th><th>%</th><th>Collected</th></tr></thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td>Total</td>
        <td>${totalContributed} / ${totalFlats}</td>
        <td>${overallPct}%</td>
        <td>${fmtINR(totalCollected)}</td>
      </tr>
    </tbody>`;
}

function renderBlockTabs() {
  const tabsEl = document.getElementById("blockTabs");
  tabsEl.innerHTML = BLOCK_ORDER.map(
    (b, i) => `<button class="block-tab${i === 0 ? " active" : ""}" data-block="${b}">Block ${b}</button>`
  ).join("");

  tabsEl.querySelectorAll(".block-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      tabsEl.querySelectorAll(".block-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderBlockDetail(btn.dataset.block);
    });
  });

  renderBlockDetail(BLOCK_ORDER[0]);
}

function renderBlockDetail(block) {
  const bd = SITE_DATA.blocks[block];
  const detailEl = document.getElementById("blockDetail");

  const gridCells = bd.flats
    .map((f) => {
      const cls = f.status === "contributed" ? "contributed" : "pending";
      const amt = f.entries.reduce((s, e) => s + e.amount, 0);
      const title =
        f.entries.length > 0
          ? `${fmtINR(amt)}` + (f.entries.length > 1 ? ` (contributed ${f.entries.length}x)` : "")
          : "Pending";
      return `<div class="flat-cell ${cls}" title="${title.replace(/"/g, "&quot;")}">${f.flat.split("-")[1]}</div>`;
    })
    .join("");

  detailEl.innerHTML = `
    <div class="block-summary">
      <div><b>${bd.flatsContributed} / ${bd.totalFlats}</b> flats contributed</div>
      <div><b>${fmtINR(bd.totalCollected)}</b> collected</div>
      <div><b>${((bd.flatsContributed / bd.totalFlats) * 100).toFixed(1)}%</b> completion</div>
    </div>
    <div class="flat-grid">${gridCells}</div>
    <div class="legend-row">
      <span><span class="legend-dot" style="background:#2f7d4f;"></span>Contributed (${bd.flatsContributed})</span>
      <span><span class="legend-dot" style="background:#fbeceb;border:1px solid #f0c6c2;"></span>Pending (${bd.totalFlats - bd.flatsContributed})</span>
    </div>
  `;
}

function renderFooter() {
  let totalFlats = 0;
  let flatsContributed = 0;
  BLOCK_ORDER.forEach((b) => {
    const bd = SITE_DATA.blocks[b];
    totalFlats += bd.totalFlats;
    flatsContributed += bd.flatsContributed;
  });
  document.getElementById(
    "footerTotals"
  ).textContent = `Total Flats: ${totalFlats} · Contributed: ${flatsContributed} (${(
    (flatsContributed / totalFlats) *
    100
  ).toFixed(1)}%) · Collected: ${fmtINR(SITE_DATA.overallCollected)}`;
}

document.addEventListener("DOMContentLoaded", init);
