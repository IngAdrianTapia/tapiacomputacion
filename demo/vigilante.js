(function(){
var H=location.hostname||'127.0.0.1',U='http://'+H+':8091',PUB=location.protocol==='https:';
var d=document.createElement('section');d.id='vigilante';
d.style.cssText='font:20px sans-serif;color:#eee;background:#111c;border:2px solid #c9a227;border-radius:12px;padding:14px;margin:12px';
d.innerHTML='<h2 style="margin:0 0 8px;color:#c9a227">Escaneando ahora / Aprendiendo <small id="vg_src"></small></h2><div id="vg_body"></div>'+
'<h3 style="color:#c9a227">Comandos de voz</h3><button id="vg_mic" style="font-size:22px">🎤 Hablar</button> <input id="vg_txt" style="font-size:20px;width:50%" placeholder="o escriba un comando"> <button id="vg_send" style="font-size:20px">Enviar</button>'+
'<div style="font-size:15px;opacity:.7">El micrófono del control de la tele no funciona (va a Bixby/Alexa). Use el celular.</div><ul id="vg_cmds"></ul><h3 style="color:#c9a227">Cambios aplicados</h3><ul id="vg_cam" style="font-size:16px"></ul>';
document.body.appendChild(d);
function sim(){var t=40+8*Math.sin(Date.now()/20000);return{hora:new Date().toISOString(),gpu:{temp_c:+t.toFixed(1),uso_pct:7,watts:4},cpu_pct:12,ram:{pct:52},alertas:[],escaneando:'(simulado) Windows',aprendizaje:{kb:{archivos:120},cola:{archivos:3},ultima_sync:'—'},comandos:[],cambios:[]}}
function e(s){return String(s==null?'—':s).replace(/[<&]/g,function(c){return c=='<'?'&lt;':'&amp;'})}
function pinta(s,real){var g=s.gpu||{},a=s.aprendizaje||{};
document.getElementById('vg_src').textContent=real?'● en vivo':'(simulación)';
document.getElementById('vg_body').innerHTML='Escaneando: '+e(s.escaneando)+'<br>GPU '+e(g.temp_c)+' °C · '+e(g.uso_pct)+'% · '+e(g.watts)+' W · CPU '+e(s.cpu_pct)+'% · RAM '+e((s.ram||{}).pct)+'%<br>Amón Cero: kb '+e((a.kb||{}).archivos)+' archivos · cola '+e((a.cola||{}).archivos)+' · última sync '+e(a.ultima_sync)+(s.alertas&&s.alertas.length?'<div style="color:#f44">⚠ '+s.alertas.map(e).join(' · ')+'</div>':'');
document.getElementById('vg_cmds').innerHTML=(s.comandos||[]).slice().reverse().map(function(c){return '<li>'+e(c.hora)+' — '+e(c.texto)+' <b>['+e(c.estado)+']</b></li>'}).join('');
document.getElementById('vg_cam').innerHTML=(s.cambios||[]).map(function(c){return '<li>'+e(c)+'</li>'}).join('')}
function tick(){if(PUB){pinta(sim(),false);return}fetch(U+'/estado.json',{cache:'no-store'}).then(function(r){return r.json()}).then(function(s){pinta(s.hora?s:sim(),!!s.hora)}).catch(function(){pinta(sim(),false)})}
function cola(t){var q=JSON.parse(localStorage.getItem('comandos')||'[]');q.push({texto:t,t:Date.now()});localStorage.setItem('comandos',JSON.stringify(q));alert('Comando guardado en cola local ('+q.length+')')}
function enviar(t){if(!t)return;if(PUB){cola(t);return}fetch(U+'/api/comando',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({texto:t})}).then(tick).catch(function(){cola(t)})}
document.getElementById('vg_send').onclick=function(){var i=document.getElementById('vg_txt');enviar(i.value);i.value=''};
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
document.getElementById('vg_mic').onclick=function(){if(!SR){alert('Este navegador no tiene dictado; use el celular (Chrome/Safari) en https.');return}var r=new SR();r.lang='es-MX';r.onresult=function(ev){enviar(ev.results[0][0].transcript)};r.start()};
tick();setInterval(tick,2000);})();
