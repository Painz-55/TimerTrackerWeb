import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* =========================
FIREBASE CONFIG
========================= */

const firebaseConfig = {
 apiKey: "AIzaSyAdCJ_Ux1YrjQdxSgutu_SvqTQTNIDVLUs",
 authDomain: "timertracker-77df3.firebaseapp.com",
 databaseURL: "https://timertracker-77df3-default-rtdb.firebaseio.com",
 projectId: "timertracker-77df3",
 storageBucket: "timertracker-77df3.firebasestorage.app",
 messagingSenderId: "1071640359296",
 appId: "1:1071640359296:web:c02cd908aca9a8547d1165"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* =========================
LOCAL CONFIG (HOTKEYS)
========================= */

let localData = JSON.parse(localStorage.getItem("timertracker")) || {
 hotkeys:["f5","f6","f7","f8"]
}

/* =========================
GLOBAL CONFIG (TIMERS)
========================= */

let config = {
 timers:[
  {nome:"Timer 1",tempo:8},
  {nome:"Timer 2",tempo:30},
  {nome:"Timer 3",tempo:15},
  {nome:"Timer 4",tempo:60}
 ]
}

let intervals=[null,null,null,null]

/* =========================
SAVE LOCAL HOTKEYS
========================= */

function saveLocal(){
 localStorage.setItem("timertracker",JSON.stringify(localData))
}

/* =========================
SAVE GLOBAL TIMERS
========================= */

function saveGlobal(){
 set(ref(db,"config/timers"),config.timers)
}

/* =========================
LOAD CONFIG FROM FIREBASE
========================= */

function loadConfig(){

 const configRef = ref(db,"config/timers")

 onValue(configRef,(snapshot)=>{

  let data=snapshot.val()

  if(!data) return

  config.timers=data

  createTimers()

 })

}

/* =========================
CREATE TIMER UI
========================= */

function createTimers(){

 let container=document.getElementById("timers")
 container.innerHTML=""

 config.timers.forEach((t,i)=>{

  let div=document.createElement("div")
  div.className="timer"

  let name=document.createElement("span")
  name.textContent=t.nome

  let label=document.createElement("span")
  label.textContent="00:00"

  let progress=document.createElement("div")
  progress.className="progress"

  let bar=document.createElement("div")
  bar.className="bar"

  progress.appendChild(bar)

  let btn=document.createElement("button")
  btn.textContent="Start"

  btn.onclick=()=>toggleTimer(i)

  div.append(name,label,progress,btn)

  container.appendChild(div)

 })

}

/* =========================
START / STOP TIMER
========================= */

function toggleTimer(i){

 let btn=document.querySelectorAll(".timer button")[i]

 if(intervals[i]){

  clearInterval(intervals[i])
  intervals[i]=null

  btn.textContent="Start"

  // remove timer da database
  remove(ref(db,"timers/"+i))

  // reset visual
  let label=document.querySelectorAll(".timer span")[i*2+1]
  let bar=document.querySelectorAll(".bar")[i]

  label.textContent="00:00"
  bar.style.width="0%"

  return

 }

 startTimer(i)

}

/* =========================
START GLOBAL TIMER
========================= */

function startTimer(i){

 let total=config.timers[i].tempo*60

 set(ref(db,"timers/"+i),{
  start:Date.now(),
  tempo:total
 })

}

/* =========================
SYNC TIMERS
========================= */

function syncTimers(){

 config.timers.forEach((t,i)=>{

  const timerRef=ref(db,"timers/"+i)

  onValue(timerRef,(snapshot)=>{

   let data=snapshot.val()

   let label=document.querySelectorAll(".timer span")[i*2+1]
   let bar=document.querySelectorAll(".bar")[i]
   let btn=document.querySelectorAll(".timer button")[i]

   if(!data){

    clearInterval(intervals[i])
    intervals[i]=null

    label.textContent="00:00"
    bar.style.width="0%"

    btn.textContent="Start"

    return

   }

   runTimer(i,data)

  })

 })

}

/* =========================
RUN TIMER
========================= */

function runTimer(i,data){

 let label=document.querySelectorAll(".timer span")[i*2+1]
 let bar=document.querySelectorAll(".bar")[i]
 let btn=document.querySelectorAll(".timer button")[i]

 let total=data.tempo

 clearInterval(intervals[i])

 intervals[i]=setInterval(()=>{

  let elapsed=(Date.now()-data.start)/1000
  let remaining=Math.floor(total-elapsed)

  if(remaining<0) remaining=0

  let m=Math.floor(remaining/60)
  let s=remaining%60

  label.textContent=
  String(m).padStart(2,"0")+":"+
  String(s).padStart(2,"0")

  bar.style.width=((total-remaining)/total*100)+"%"

  btn.textContent="Stop"

  if(remaining<=0){

   clearInterval(intervals[i])
   intervals[i]=null

   btn.textContent="Start"

  }

 },1000)

}

/* =========================
HOTKEYS LOCAL
========================= */

document.addEventListener("keydown",(e)=>{

 let key=e.key.toLowerCase()

 localData.hotkeys.forEach((hk,i)=>{

  if(key===hk){

   document.querySelectorAll(".timer button")[i].click()

  }

 })

})

/* =========================
CONFIG PANEL
========================= */

document.getElementById("configBtn").onclick=()=>{

 let panel=document.getElementById("configPanel")
 panel.classList.toggle("hidden")

 renderConfig()

}

function renderConfig(){

 let div=document.getElementById("configTimers")
 div.innerHTML=""

 config.timers.forEach((t,i)=>{

  let row=document.createElement("div")

  let nome=document.createElement("input")
  nome.value=t.nome

  let tempo=document.createElement("input")
  tempo.value=t.tempo
  tempo.style.width="50px"

  let key=document.createElement("input")
  key.value=localData.hotkeys[i]
  key.style.width="60px"

  row.append(nome,tempo,key)

  div.appendChild(row)

 })

}

/* =========================
SAVE CONFIG
========================= */

document.getElementById("saveConfig").onclick=()=>{

 let rows=document.querySelectorAll("#configTimers div")

 rows.forEach((row,i)=>{

  let inputs=row.querySelectorAll("input")

  config.timers[i].nome=inputs[0].value
  config.timers[i].tempo=parseFloat(inputs[1].value)

  localData.hotkeys[i]=inputs[2].value.toLowerCase()

 })

 saveLocal()
 saveGlobal()

 intervals.forEach((t,i)=>{
  if(t){
   clearInterval(intervals[i])
   intervals[i]=null
  }
 })

 setTimeout(()=>{

  createTimers()
  syncTimers()

 },300)

 alert("Configuração salva")

}

/* =========================
INIT
========================= */

createTimers()
loadConfig()
syncTimers()
