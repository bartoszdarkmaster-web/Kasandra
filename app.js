let MODE = localStorage.getItem("mode") || "analysis";

function setMode(m){
  MODE=m;
  localStorage.setItem("mode",m);
  document.body.className = m+"-only";
  document.getElementById("mode-analysis").classList.toggle("active",m==="analysis");
  document.getElementById("mode-explain").classList.toggle("active",m==="explain");
}

function showTab(id){
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  event.target.classList.add("active");
}

function toggleDriver(btn){
  btn.closest(".driver").classList.toggle("open");
  populateEvents(btn.closest(".driver"));
}

let events = [
  {source:"Reuters",title:"Fuel depot expansion reported"},
  {source:"ISW",title:"Increased troop rotation observed"},
  {source:"Reuters",title:"Medical logistics readiness raised"}
];

function populateEvents(card){
  const ul = card.querySelector(".events");
  ul.innerHTML="";
  events.forEach(e=>{
    const li=document.createElement("li");
    li.innerText=`${e.source}: ${e.title}`;
    ul.appendChild(li);
  });
}

let snapshots=[];

function updateSystem(){
  const cepi = (0.6+Math.random()*0.2).toFixed(2);
  document.getElementById("cepi").innerText=cepi;
  document.getElementById("time").innerText=new Date().toLocaleTimeString();

  snapshots.push({cepi:parseFloat(cepi)});
  if(snapshots.length>2){
    const d=(snapshots.at(-1).cepi-snapshots.at(-2).cepi).toFixed(2);
    document.getElementById("timelineNotes").innerText =
      d>0 ? `CEPI wzrósł o ${d}` :
      d<0 ? `CEPI spadł o ${Math.abs(d)}` :
      "CEPI stabilny";
  }

  updateScenarios();
}

function updateScenarios(){
  const k = Math.round(20+Math.random()*20);
  const h = Math.round(40+Math.random()*20);
  const d = 100-k-h;

  document.getElementById("kinetic-pct").innerText=k+"%";
  document.getElementById("hybrid-pct").innerText=h+"%";
  document.getElementById("deescalation-pct").innerText=d+"%";

  document.getElementById("kinetic-why").innerText="Logistics + military posture elevated.";
  document.getElementById("hybrid-why").innerText="Pressure without mobilization.";
  document.getElementById("deescalation-why").innerText="Stabilization signals present.";
}

/* MAP */
const map=L.map("mapContainer").setView([40,20],2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
[
  [52,27,"Logistics"],
  [55,37,"Command"],
  [35,36,"Posture"]
].forEach(p=>{
  L.circleMarker([p[0],p[1]],{radius:8,color:"#ff4d4d"})
   .addTo(map).bindPopup(p[2]);
});

setMode(MODE);
updateSystem();
