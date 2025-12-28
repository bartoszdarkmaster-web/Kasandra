/*************************************************
 KASSANDRA v2 – ANALYTICS ENGINE
 OSINT feeds + CEPI scoring + Timeline (B)
*************************************************/

/* ======================
   CONFIG
====================== */

// RSS proxy (CORS-safe)
const RSS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";

// Feeds (Tier 1)
const FEEDS = [
  {
    name: "ISW",
    url: "https://www.understandingwar.org/rss.xml",
    tier: 1,
    domain: "military",
    baseDelta: 0.04
  },
  {
    name: "Reuters Defense",
    url: "https://www.reuters.com/world/defence/rss",
    tier: 1,
    domain: "logistics",
    baseDelta: 0.03
  }
];

// Domain weights (CEPI)
const WEIGHTS = {
  military: 0.35,
  logistics: 0.30,
  medical: 0.20,
  info: 0.15
};

// Snapshot config
const SNAPSHOT_KEY = "kassandra_snapshots";
const MAX_SNAPSHOTS = 120; // ~4 months daily

/* ======================
   STATE
====================== */

let events = [];
let snapshots = loadSnapshots();

/* ======================
   HELPERS
====================== */

function nowISO() {
  return new Date().toISOString();
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/* ======================
   SNAPSHOTS
====================== */

function loadSnapshots() {
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOT_KEY)) || [];
  } catch {
    return [];
  }
}

function saveSnapshot(snapshot) {
  snapshots.push(snapshot);
  if (snapshots.length > MAX_SNAPSHOTS) {
    snapshots.shift();
  }
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshots));
}

/* ======================
   FEED FETCH + NORMALIZE
====================== */

async function fetchFeeds() {
  events = [];

  for (const f of FEEDS) {
    try {
      const res = await fetch(RSS_PROXY + encodeURIComponent(f.url));
      const data = await res.json();

      data.items.slice(0, 6).forEach(item => {
        events.push({
          source: f.name,
          tier: f.tier,
          domain: f.domain,
          title: item.title,
          timestamp: item.pubDate || nowISO(),
          confidence: f.tier === 1 ? 0.8 : 0.6,
          delta: f.baseDelta
        });
      });

    } catch (e) {
      console.warn("Feed error:", f.name, e);
    }
  }
}

/* ======================
   CEPI SCORING
====================== */

function calculateCEPI() {
  let domainTotals = {
    military: 0,
    logistics: 0,
    medical: 0,
    info: 0
  };

  events.forEach(ev => {
    const weight = WEIGHTS[ev.domain] || 0;
    const impact = ev.delta * ev.confidence * weight;
    domainTotals[ev.domain] += impact;
  });

  const cepi =
    domainTotals.military +
    domainTotals.logistics +
    domainTotals.medical +
    domainTotals.info;

  return {
    cepi: clamp(cepi, 0, 1),
    domains: domainTotals,
    confidence: clamp(
      events.reduce((s, e) => s + e.confidence, 0) / Math.max(events.length, 1),
      0,
      1
    )
  };
}

/* ======================
   UPDATE UI (OVERVIEW)
====================== */

function updateOverview(result) {
  const cepiEl = document.getElementById("cepi");
  if (cepiEl) cepiEl.innerText = result.cepi.toFixed(2);

  const timeEl = document.getElementById("time");
  if (timeEl) timeEl.innerText = new Date().toLocaleTimeString();
}

/* ======================
   TIMELINE (B) – CANVAS
====================== */

function drawTimeline(days = 30) {
  const canvas = document.getElementById("timelineCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = 260;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const relevant = snapshots.slice(-days);
  if (relevant.length < 2) return;

  const maxCEPI = 1.0;
  const padding = 30;

  function x(i) {
    return padding + (i / (relevant.length - 1)) * (canvas.width - 2 * padding);
  }

  function y(v) {
    return canvas.height - padding - (v / maxCEPI) * (canvas.height - 2 * padding);
  }

  // --- Stacked areas ---
  const domains = ["military", "logistics", "medical", "info"];
  const colors = {
    military: "#ff4d4d",
    logistics: "#f59e0b",
    medical: "#3b82f6",
    info: "#a855f7"
  };

  let cumulative = Array(relevant.length).fill(0);

  domains.forEach(domain => {
    ctx.beginPath();
    relevant.forEach((s, i) => {
      const v = s.drivers[domain] || 0;
      const cy = cumulative[i] + v;
      ctx.lineTo(x(i), y(cy));
      cumulative[i] = cy;
    });

    for (let i = relevant.length - 1; i >= 0; i--) {
      ctx.lineTo(x(i), y(cumulative[i] - (relevant[i].drivers[domain] || 0)));
    }

    ctx.closePath();
    ctx.fillStyle = colors[domain];
    ctx.globalAlpha = 0.35;
    ctx.fill();
    ctx.globalAlpha = 1;
  });

  // --- CEPI line ---
  ctx.beginPath();
  relevant.forEach((s, i) => {
    ctx.lineTo(x(i), y(s.cepi));
  });
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();
}

/* ======================
   MAIN UPDATE
====================== */

async function updateSystem() {
  await fetchFeeds();
  const result = calculateCEPI();

  updateOverview(result);

  saveSnapshot({
    timestamp: nowISO(),
    cepi: result.cepi,
    drivers: result.domains,
    confidence: result.confidence
  });

  drawTimeline(30);
}

/* ======================
   INIT
====================== */

// Auto-create dummy snapshots if empty (for first run UX)
if (snapshots.length < 5) {
  for (let i = 5; i > 0; i--) {
    saveSnapshot({
      timestamp: new Date(Date.now() - i * 86400000).toISOString(),
      cepi: 0.6 + Math.random() * 0.15,
      drivers: {
        military: 0.2 + Math.random() * 0.05,
        logistics: 0.15 + Math.random() * 0.05,
        medical: 0.1 + Math.random() * 0.03,
        info: 0.08 + Math.random() * 0.02
      },
      confidence: 0.75
    });
  }
}

updateSystem();
