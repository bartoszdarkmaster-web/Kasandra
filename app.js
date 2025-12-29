/* ===== MODE ===== */
let MODE=localStorage.getItem("mode")||"analysis";
function setMode(m){
  MODE=m;localStorage.setItem("mode",m);
  document.body.className=m+"-only";
  ["analysis","explain","briefing"].forEach(x=>{
    document.getElementById("mode-"+x)?.classList.toggle("active",x===m);
  });
}

/* ===== TABS ===== */
function showTab(id){
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  event.target.classList.add("active");
}

/* ===== REGIONS ===== */
let REGION=localStorage.getItem("region")||"GLOBAL";
const REGION_DATA={
  GLOBAL:{cepi:0.75,drivers:["Logistics ↑","Military ↑","Medical ↑"],center:[40,20],zoom:2},
  EUROPE:{cepi:0.82,drivers:["Logistics ↑","Medical ↑"],center:[52,20],zoom:4},
  MIDDLE_EAST:{cepi:0.68,drivers:["Military ↑","Info ↑"],center:[32,36],zoom:4},
  INDO_PACIFIC:{cepi:0.55,drivers:["Naval posture ↑"],center:[15,120],zoom:3}
};

function setRegion(r){
  REGION=r;
  localStorage.setItem("region",r);
  updateSystem();
}

/* ===== SNAPSHOTS (OFFLINE) ===== */
const SNAP_KEY="kassandra_snapshots";
let snapshots=JSON.parse(localStorage.getItem(SNAP_KEY)||"[]");

function saveSnapshot(val){
  snapshots.push({t:Date.now(),v:val});
  if(snapshots.length>60) snapshots.shift();
  localStorage.setItem(SNAP_KEY,JSON.stringify(snapshots));
}

/* ===== CORE UPDATE ===== */
function updateSystem(){
  const d=REGION_DATA[REGION];
  document.getElementById("cepi").innerText=d.cepi.toFixed(2);
  document.getElementById("regionLabel").innerText=REGION;
  document.getElementById("time").innerText=new Date().toLocaleTimeString();
  document.getElementById("statusLabel").innerText=d.cepi>0.8?"HIGH":d.cepi>0.6?"MODERATE":"LOW";

  const ul=document.getElementById("driverList");
  ul.innerHTML="";
  d.drivers.forEach(x=>{
    const li=document.createElement("li");li.innerText=x;ul.appendChild(li);
  });

  saveSnapshot(d.cepi);
  updateScenarios(d.cepi);
  drawTimeline();
  focusMap(d.center,d.zoom);
}

/* ===== SCENARIOS ===== */
function updateScenarios(c){
  document.getElementById("kinetic-pct").innerText=Math.round(c*30)+"%";
  document.getElementById("hybrid-pct").innerText=Math.round(c*50)+"%";
  document.getElementById("deescalation-pct").innerText=100-Math.round(c*80)+"%";
}

/* ===== MAP ===== */
const map=L.map("mapContainer").setView([40,20],2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

function focusMap(center,zoom){
  map.setView(center,zoom);
}

/* ===== TIMELINE ===== */
function drawTimeline(){
  const c=document.getElementById("timelineCanvas");
  const ctx=c.getContext("2d");
  c.width=c.offsetWidth;c.height=120;
  ctx.clearRect(0,0,c.width,c.height);
  ctx.beginPath();
  snapshots.forEach((s,i)=>{
    const x=i*(c.width/(snapshots.length-1||1));
    const y=c.height-(s.v*c.height);
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  });
  ctx.strokeStyle="#f59e0b";ctx.stroke();
}

/* INIT */
document.getElementById("regionSelect").value=REGION;
setMode(MODE);
updateSystem();
