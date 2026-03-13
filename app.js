let config = JSON.parse(localStorage.getItem("timertracker")) || {
 hotkeys:["f5","f6","f7","f8"],
 timers:[
  {nome:"Timer 1",tempo:0},
  {nome:"Timer 2",tempo:0},
  {nome:"Timer 3",tempo:0},
  {nome:"Timer 4",tempo:0}
 ]
}

function save(){
 localStorage.setItem("timertracker",JSON.stringify(config))
}

function createTimers(){

 let container = document.getElementById("timers")
 container.innerHTML=""

 config.timers.forEach((t,i)=>{

  let div = document.createElement("div")
  div.className="timer"

  let name = document.createElement("input")
  name.value=t.nome

  let tempo = document.createElement("input")
  tempo.value=t.tempo
  tempo.style.width="50px"

  let label = document.createElement("span")
  label.textContent="00:00"

  let progress = document.createElement("div")
  progress.className="progress"

  let bar = document.createElement("div")
  bar.className="bar"

  progress.appendChild(bar)

  let btn = document.createElement("button")
  btn.textContent="Start"

  btn.onclick=()=>startTimer(i,label,bar,tempo.value)

  div.append(name,tempo,label,progress,btn)

  container.appendChild(div)

 })

}

function startTimer(i,label,bar,min){

 let total=min*60
 let remaining=total

 let interval=setInterval(()=>{

  remaining--

  let m=Math.floor(remaining/60)
  let s=remaining%60

  label.textContent=
   String(m).padStart(2,"0")+":"+
   String(s).padStart(2,"0")

  bar.style.width=((total-remaining)/total*100)+"%"

  if(remaining<=0){

   clearInterval(interval)
   alert("Timer terminou")

  }

 },1000)

}

document.addEventListener("keydown",(e)=>{

 let key=e.key.toLowerCase()

 config.hotkeys.forEach((hk,i)=>{

  if(key===hk){
   document.querySelectorAll("button")[i].click()
  }

 })

})

createTimers()