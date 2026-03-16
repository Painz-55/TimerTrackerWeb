import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* =========================
FIREBASE
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
LOCAL DATA
========================= */

let localData = JSON.parse(localStorage.getItem("timertracker")) || {
 hotkeys:["f5","f6","f7","f8"]
};

let config = {
 timers:[
  {nome:"Timer 1",tempo:8},
  {nome:"Timer 2",tempo:30},
  {nome:"Timer 3",tempo:15},
  {nome:"Timer 4",tempo:60}
 ]
};

let intervals=[null,null,null,null]

/* timers ativos */
let activeTimers={}

/* =========================
SAVE LOCAL
========================= */

function saveLocal(){
 localStorage.setItem("timertracker",JSON.stringify(localData))
}

/* =========================
SAVE GLOBAL
========================= */

function saveGlobal(){
 set(ref(db,"config/timers"),config.timers)
}

/* =========================
LOAD CONFIG
========================= */

function loadConfig(){

 const configRef = ref(db,"config/timers")

 onValue(configRef,(snapshot)=>{

  const data=snapshot.val()

  if(!data) return

  config.timers=data
  
  intervals.length=config.timers.length

  const currentTimers=document.querySelectorAll(".timer")

  if(currentTimers.length !== config.timers.length){

   createTimers()
   syncTimers()

  }else{

   const timerNames=document.querySelectorAll(".timer span:first-child")

   config.timers.forEach((t,i)=>{
    if(timerNames[i]) timerNames[i].textContent=t.nome
   })

  }

 })

}

/* =========================
CREATE UI
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

  if(!localData.hotkeys[i]){
  localData.hotkeys[i]=""
  }
  
  let btn=document.createElement("button")
  btn.textContent="Start"

  btn.onclick=()=>toggleTimer(i)

  div.append(name,label,progress,btn)

  container.appendChild(div)

 })

}

/* =========================
START / STOP
========================= */

function toggleTimer(i){

 if(intervals[i]){
  stopTimer(i)
 }else{
  startTimer(i)
 }

}

/* =========================
START TIMER
========================= */

function startTimer(i){

 let total=config.timers[i].tempo*60

 set(ref(db,"timers/"+i),{
  start:Date.now(),
  tempo:total
 })

}

/* =========================
STOP TIMER
========================= */

function stopTimer(i){

 clearInterval(intervals[i])
 intervals[i]=null

 delete activeTimers[i]
 updateBigTimer()

 let label=document.querySelectorAll(".timer span")[i*2+1]
 let bar=document.querySelectorAll(".bar")[i]
 let btn=document.querySelectorAll(".timer button")[i]

 label.textContent="00:00"
 bar.style.width="0%"
 btn.textContent="Start"

 set(ref(db,"timers/"+i), null)

}

/* =========================
SYNC TIMERS
========================= */

function syncTimers(){

 config.timers.forEach((t,i)=>{

  const timerRef=ref(db,"timers/"+i)

  onValue(timerRef,(snapshot)=>{

   const data=snapshot.val()

   const label=document.querySelectorAll(".timer span")[i*2+1]
   const bar=document.querySelectorAll(".bar")[i]
   const btn=document.querySelectorAll(".timer button")[i]

   if(data===null){

    clearInterval(intervals[i])
    intervals[i]=null

    delete activeTimers[i]
    updateBigTimer()

    if(label){
     label.textContent="00:00"
     bar.style.width="0%"
     btn.textContent="Start"
    }

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

  activeTimers[i]={
   remaining:remaining,
   label:config.timers[i].nome
  }

  updateBigTimer()

  if(remaining<=0){

   delete activeTimers[i]
   stopTimer(i)

  }

 },1000)

}

/* =========================
BIG TIMER LOGIC
========================= */

function updateBigTimer(){

 let keys=Object.keys(activeTimers)

 if(keys.length===0){

  document.getElementById("bigTimer").textContent="00:00"
  document.getElementById("bigLabel").textContent="No Timer Running"

  return

 }

 let lowest=null
 let index=null

 keys.forEach(k=>{

  if(lowest===null || activeTimers[k].remaining<lowest){

   lowest=activeTimers[k].remaining
   index=k

  }

 })

 let remaining=activeTimers[index].remaining

 let m=Math.floor(remaining/60)
 let s=remaining%60

 document.getElementById("bigTimer").textContent=
  String(m).padStart(2,"0")+":"+
  String(s).padStart(2,"0")

 document.getElementById("bigLabel").textContent=
  activeTimers[index].label

}

/* =========================
HOTKEYS
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
  tempo.style.width="60px"

  let key=document.createElement("input")
  key.value=localData.hotkeys[i]
  key.style.width="60px"

  row.append(nome,tempo,key)

  div.appendChild(row)

 })

}

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

 document.getElementById("configPanel").classList.add("hidden")

}

/* =========================
OBS MODE
========================= */

let obsMode=false

document.getElementById("obsBtn").onclick=()=>{

 obsMode=true

 document.querySelector(".rightPanel").style.display="none"
 document.querySelector(".header").style.display="none"

 document.querySelector(".leftPanel").style.width="100%"

 document.getElementById("exitObs").classList.remove("hidden")

}

document.getElementById("exitObs").onclick=()=>{

 obsMode=false

 document.querySelector(".rightPanel").style.display="block"
 document.querySelector(".header").style.display="flex"

 document.querySelector(".leftPanel").style.width="40%"

 document.getElementById("exitObs").classList.add("hidden")

}

/* =========================
Adicionando/Removendo Timers
========================= */


document.getElementById("addTimer").onclick = ()=>{

 if(config.timers.length >= 8){
  alert("Máximo de 8 timers atingido")
  return
 }

 let index = config.timers.length + 1

 config.timers.push({
  nome:"Timer "+index,
  tempo:10
 })

 localData.hotkeys.push("")

 intervals.push(null)

 saveLocal()
 saveGlobal()

}

/* =========================
Fechar Config Clickando Fora
========================= */

document.addEventListener("click",(e)=>{

 const panel=document.getElementById("configPanel")

 if(panel.classList.contains("hidden")) return

 if(!panel.contains(e.target) && e.target.id !== "configBtn"){

  panel.classList.add("hidden")

 }

})

/* =========================
INIT
========================= */

createTimers()
loadConfig()
syncTimers()
