let config = JSON.parse(localStorage.getItem("timertracker")) || {
 hotkeys:["f5","f6","f7","f8"],
 timers:[
  {nome:"Timer 1",tempo:8},
  {nome:"Timer 2",tempo:30},
  {nome:"Timer 3",tempo:15},
  {nome:"Timer 4",tempo:60}
 ]
}

let intervals=[null,null,null,null]

function save(){
 localStorage.setItem("timertracker",JSON.stringify(config))
}

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

  btn.onclick=()=>toggleTimer(i,label,bar,btn)

  div.append(name,label,progress,btn)

  container.appendChild(div)

 })

}

function toggleTimer(i,label,bar,btn){

 if(intervals[i]){

  clearInterval(intervals[i])
  intervals[i]=null

  btn.textContent="Start"
  label.textContent="00:00"
  bar.style.width="0%"

 }else{

  startTimer(i,label,bar,btn)

 }

}

function startTimer(i,label,bar,btn){

 let total=config.timers[i].tempo*60
 let remaining=total

 btn.textContent="Stop"

 intervals[i]=setInterval(()=>{

  remaining--

  let m=Math.floor(remaining/60)
  let s=remaining%60

  label.textContent=
  String(m).padStart(2,"0")+":"+
  String(s).padStart(2,"0")

  bar.style.width=((total-remaining)/total*100)+"%"

  if(remaining<=0){

   clearInterval(intervals[i])
   intervals[i]=null

   btn.textContent="Start"

   alert("Timer terminou")

  }

 },1000)

}

document.addEventListener("keydown",(e)=>{

 let key=e.key.toLowerCase()

 config.hotkeys.forEach((hk,i)=>{

  if(key===hk){

   document.querySelectorAll(".timer button")[i].click()

  }

 })

})

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
  key.value=config.hotkeys[i]
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
  config.hotkeys[i]=inputs[2].value.toLowerCase()

 })

 save()

 createTimers()

 alert("Configuração salva")

}

createTimers()
