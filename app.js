
const D=window.APP_DATA;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const state=JSON.parse(localStorage.getItem('riadStudyState')||'{}');
state.answers=state.answers||{}; state.chapterDone=state.chapterDone||{};
function save(){localStorage.setItem('riadStudyState',JSON.stringify(state)); renderMetrics();}
function nav(id){$$('.page').forEach(x=>x.classList.remove('active')); $('#'+id).classList.add('active'); $$('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===id)); window.scrollTo(0,0)}
$$('.nav button').forEach(b=>b.onclick=()=>nav(b.dataset.page));

function openPdf(sourceId,page){
  const s=D.sources.find(x=>x.id===sourceId); if(!s)return;
  $('#pdfTitle').textContent=s.title+(page?` – Seite ${page}`:'');
  $('#pdfFrame').src=s.file+(page?`#page=${page}`:'');
  $('#pdfModal').classList.add('show');
}
$('#pdfClose').onclick=()=>{$('#pdfModal').classList.remove('show'); $('#pdfFrame').src='about:blank'};
$('#pdfModal').addEventListener('click',e=>{if(e.target.id==='pdfModal')$('#pdfClose').click()});

function renderMetrics(){
  const vals=Object.values(state.answers);
  const attempted=vals.length, correct=vals.filter(x=>x.status==='correct').length, wrong=vals.filter(x=>x.status==='wrong').length;
  const doneCh=Object.values(state.chapterDone).filter(Boolean).length;
  $('#mAttempt').textContent=attempted; $('#mCorrect').textContent=correct; $('#mWrong').textContent=wrong; $('#mChapters').textContent=doneCh;
  const pct=D.exercises.length?Math.round((correct/D.exercises.length)*100):0;
  $('#overallBar').style.width=Math.min(100,pct)+'%'; $('#overallPct').textContent=pct+'%';
}
function renderSemesters(){
  $('#semesterGrid').innerHTML=D.semesters.map(s=>`<div class="card semester"><div class="num">SEMESTER ${s.n}</div><h3>${s.n===1?'Aktueller Schwerpunkt':'Ausbildungsplan'}</h3><ul>${s.topics.map(t=>`<li>${t}</li>`).join('')}</ul></div>`).join('');
}
function renderSources(){
  $('#sourceGrid').innerHTML=D.sources.map(s=>`<div class="card source-card">
    <img src="${s.cover}" alt="">
    <div><h3>${s.title}</h3><p>${s.year}</p><p><span class="badge">${s.kind}</span><span class="badge">${s.tag}</span></p>
    <div class="row mt"><button class="btn primary" onclick="openPdf('${s.id}')">Öffnen</button></div></div></div>`).join('');
}
function norm(x){return (x||'').toString().trim().toLowerCase().replace(/,/g,'.').replace(/\s+/g,' ')}
function checkExercise(id){
  const e=D.exercises.find(x=>x.id===id), input=$(`#input-${id}`), res=$(`#result-${id}`);
  let val=input?input.value:'', ok=false;
  if(e.kind==='numeric'){
    const n=parseFloat(norm(val).replace(/[^\d.\-]/g,''));
    ok=Number.isFinite(n) && Math.abs(n-e.answer)<= (e.tolerance??0.01);
  }else if(e.kind==='text'){
    const n=norm(val);
    ok=(e.aliases||[]).some(a=>n.includes(norm(a))) || (e.answer && n===norm(e.answer));
  }
  state.answers[id]={value:val,status:ok?'correct':'wrong',time:Date.now()}; save();
  res.textContent=ok?'Richtig ✓':'Noch nicht richtig ✕ – versuche es nochmals oder öffne die Lösung.';
  res.className='result show '+(ok?'ok':'bad');
}
function manualMark(id,status){
  state.answers[id]={value:'',status,time:Date.now()}; save();
  const res=$(`#result-${id}`); res.textContent=status==='correct'?'Als richtig markiert ✓':'Als falsch / nochmals üben markiert ✕'; res.className='result show '+(status==='correct'?'ok':'bad');
}
function toggleSolution(id){$(`#solution-${id}`).classList.toggle('show')}
function renderExercises(list=D.exercises){
  $('#exerciseList').innerHTML=list.map(e=>{
    const prev=state.answers[e.id];
    const source=D.sources.find(s=>s.id===e.source);
    return `<div class="card exercise" data-topic="${e.topic}">
      <div class="meta"><span class="badge">S${e.semester}</span><span class="badge">${e.topic}</span>${source?source.title:''} · S. ${e.page}</div>
      <h3>${e.title}</h3><div class="prompt">${e.prompt}</div>
      ${e.kind==='numeric'||e.kind==='text'?`<div class="answer-row"><input id="input-${e.id}" value="${prev?.value||''}" placeholder="Deine Antwort…"><button class="btn primary" onclick="checkExercise('${e.id}')">Prüfen</button></div>`:
      `<div class="row mt"><button class="btn good" onclick="manualMark('${e.id}','correct')">Richtig</button><button class="btn danger" onclick="manualMark('${e.id}','wrong')">Falsch / üben</button></div>`}
      <div id="result-${e.id}" class="result ${prev?'show '+(prev.status==='correct'?'ok':'bad'):''}">${prev?(prev.status==='correct'?'Richtig ✓':'Nochmals üben ✕'):''}</div>
      <div class="row mt"><button class="btn" onclick="toggleSolution('${e.id}')">Lösung</button><button class="btn" onclick="openPdf('${e.source}',${e.page})">Quelle öffnen</button></div>
      <div id="solution-${e.id}" class="solution"><strong>Lösung / Musterweg</strong><br>${e.solution}</div>
    </div>`
  }).join('');
}
function buildExerciseFilters(){
  const topics=['Alle',...new Set(D.exercises.map(e=>e.topic))];
  $('#exerciseFilters').innerHTML=topics.map((t,i)=>`<button class="btn ${i===0?'active':''}" data-topic="${t}">${t}</button>`).join('');
  $$('#exerciseFilters button').forEach(b=>b.onclick=()=>{
    $$('#exerciseFilters button').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    const t=b.dataset.topic; renderExercises(t==='Alle'?D.exercises:D.exercises.filter(e=>e.topic===t));
  });
}
function renderMath(){
  $('#mathChapters').innerHTML=D.mathChapters.map((c,i)=>`<div class="card chapter ${state.chapterDone[i]?'done':''}">
    <div class="label">${c.group}</div><h3>${c.title}</h3><p>Übungen/Lehrtext: PDF-Seiten ${c.pages}<br>Lösungsbereich: ${c.solutionPages}</p>
    <div class="row">
      <button class="btn primary" onclick="openPdf('math',${parseInt(c.pages)})">Kapitel öffnen</button>
      <button class="btn" onclick="openPdf('math',${parseInt(c.solutionPages)})">Lösungen</button>
      <button class="btn ${state.chapterDone[i]?'good':''}" onclick="toggleChapter(${i})">${state.chapterDone[i]?'Gelernt ✓':'Als gelernt markieren'}</button>
    </div></div>`).join('');
}
function toggleChapter(i){state.chapterDone[i]=!state.chapterDone[i];save();renderMath()}
function renderVideos(){
  $('#videoGrid').innerHTML=D.videos.map(v=>`<div class="card video-wrap">
    <iframe class="video-frame" src="https://www.youtube-nocookie.com/embed/${v.youtube}" title="${v.title}" allowfullscreen></iframe>
    <div><div class="label">QR-VIDEO</div><h3>${v.title}</h3><p class="sub">${v.source}<br>${v.pages}</p>
    <div class="row mt"><a class="btn primary" target="_blank" href="https://www.youtube.com/watch?v=${v.youtube}">Auf YouTube öffnen</a><button class="btn" onclick="openPdf('pb1b',8)">QR-Seite öffnen</button></div></div></div>`).join('');
}
$('#searchInput').addEventListener('input',e=>{
  const q=norm(e.target.value);
  renderExercises(!q?D.exercises:D.exercises.filter(x=>norm(x.title+' '+x.prompt+' '+x.topic).includes(q)));
});
window.openPdf=openPdf;window.checkExercise=checkExercise;window.manualMark=manualMark;window.toggleSolution=toggleSolution;window.toggleChapter=toggleChapter;

renderMetrics(); renderSemesters(); renderSources(); buildExerciseFilters(); renderExercises(); renderMath(); renderVideos();
