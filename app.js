<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">
<title>TimerTracker</title>

<link rel="stylesheet" href="style.css">

</head>

<body>

<div class="topbar">

<h1>TimerTracker</h1>

<div class="topButtons">
<button id="obsBtn">OBS</button>
<button id="exitObsBtn" class="hidden">Exit OBS</button>
<button id="configBtn">⚙</button>
</div>

</div>


<div class="dashboard">

<!-- TIMER GRANDE -->

<div class="leftPanel">

<div id="bigTimer">

<div id="bigTimerName">No Active Timer</div>
<div id="bigTimerTime">00:00</div>

<div class="bigProgress">
<div id="bigBar"></div>
</div>

</div>

</div>


<!-- TIMERS -->

<div class="rightPanel">

<div id="timers"></div>

</div>

</div>


<!-- CONFIG -->

<div id="configPanel" class="hidden">

<h2>Configurações</h2>

<div id="configTimers"></div>

<button id="saveConfig">Salvar</button>

</div>


<script type="module" src="app.js"></script>

</body>
</html>
