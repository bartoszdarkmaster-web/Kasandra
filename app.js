const reasonsData = [
  { text: "Koncentracja wojsk (satellite)", impact: "+0.12" },
  { text: "Rozbudowa magazynów paliw", impact: "+0.08" },
  { text: "Szpitale polowe – nowe lokalizacje", impact: "+0.06" },
  { text: "Brak mobilizacji powszechnej", impact: "-0.04" }
];

function updateSystem() {
  document.getElementById("time").innerText =
    new Date().toLocaleTimeString();
}

const reasonsList = document.getElementById("reasons");
reasonsData.forEach(r => {
  const li = document.createElement("li");
  li.innerText = `${r.text} (${r.impact})`;
  reasonsList.appendChild(li);
});

// MAPA
const map = L.map('map').setView([50, 30], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// Punkty zdarzeń
const points = [
  { lat: 50.45, lon: 30.52, label: "Koncentracja wojsk" },
  { lat: 53.9, lon: 27.56, label: "Zaplecze logistyczne" },
  { lat: 55.75, lon: 37.61, label: "Centrum dowodzenia" }
];

points.forEach(p => {
  L.circleMarker([p.lat, p.lon], {
    radius: 8,
    color: "#ff4d4d",
    fillOpacity: 0.8
  }).addTo(map).bindPopup(p.label);
});

// Auto update
updateSystem();
