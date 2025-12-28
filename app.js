/* =======================
   TAB NAVIGATION
======================= */
function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));

  document.getElementById(id).classList.add("active");
  event.target.classList.add("active");

  if (id === "map" && window.map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }
}

/* =======================
   UPDATE TIME
======================= */
function update() {
  document.getElementById("time").innerText =
    new Date().toLocaleTimeString();
}

/* =======================
   MAP INITIALIZATION
======================= */
const map = L.map("mapContainer").setView([40, 20], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

/* ===== MAP POINTS ===== */
const mapPoints = [
  { lat: 52, lon: 27, label: "Logistics surge – Eastern Europe" },
  { lat: 55, lon: 37, label: "Command & control node" },
  { lat: 35, lon: 36, label: "Force posture shift – Middle East" }
];

mapPoints.forEach(p => {
  L.circleMarker([p.lat, p.lon], {
    radius: 8,
    color: "#ff4d4d",
    fillOpacity: 0.8
  }).addTo(map).bindPopup(p.label);
});

/* =======================
   LANGUAGE SYSTEM (PL / EN)
======================= */
let currentLang = localStorage.getItem("lang") || "pl";
let translations = {};

async function loadLang(lang) {
  try {
    const res = await fetch(`lang/${lang}.json`);
    translations = await res.json();

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (translations[key]) {
        el.innerText = translations[key];
      }
    });

    localStorage.setItem("lang", lang);
    currentLang = lang;
  } catch (e) {
    console.warn("Language load error:", e);
  }
}

function setLang(lang) {
  loadLang(lang);
}

/* =======================
   INIT
======================= */
update();
loadLang(currentLang);

setTimeout(() => {
  map.invalidateSize();
}, 400);
