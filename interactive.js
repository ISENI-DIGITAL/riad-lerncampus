
(() => {
  const video = document.getElementById('peVideo');
  if (!video) return;

  const steps = [
    {id:1,start:0,end:2.7,title:'Rohrenden ausrichten',text:'Die PE-Rohre werden fluchtend in der Spannvorrichtung positioniert. Die Stirnflächen müssen für das Fügen sauber und planparallel vorbereitet sein.',points:['Rohrenden axial und fluchtend ausrichten','Fügeflächen sauber halten','Spannvorrichtung stabil einstellen'],cross:'Die Rohrenden sind vor dem Fügen noch getrennt.'},
    {id:2,start:2.7,end:5.4,title:'Heizplatte einsetzen und erwärmen',text:'Die Heizplatte wird zwischen die Rohrenden geführt. Die Fügeflächen werden gleichmässig erwärmt, bis der thermoplastische Kunststoff im Fügebereich weich wird.',points:['Heizplatte berührt beide Fügeflächen gleichmässig','PE wird nur im vorgesehenen Fügebereich erwärmt','Keine offene Flamme, keine Funken'],cross:'Die Randzonen der Fügeflächen werden erwärmt und weich.'},
    {id:3,start:5.4,end:6.7,title:'Heizplatte entfernen',text:'Nach dem Erwärmen wird die Heizplatte zügig entfernt. Die weichen Fügeflächen dürfen dabei nicht verschmutzt oder unnötig berührt werden.',points:['Heizplatte sauber aus dem Fügebereich entfernen','Erwärmte Flächen nicht verunreinigen','Rohre für das Fügen in Position halten'],cross:'Die erwärmten Fügeflächen liegen frei und bleiben getrennt.'},
    {id:4,start:6.7,end:8.8,title:'Rohrenden kontrolliert fügen',text:'Die erwärmten Rohrenden werden axial zusammengeführt. Der kontrollierte Fügedruck verbindet die plastifizierten PE-Zonen miteinander.',points:['Rohrenden axial zusammenführen','Kontrollierten Druck aufbauen','Nicht gegeneinander verdrehen'],cross:'Die plastifizierten Zonen werden zusammengeführt und bilden eine gemeinsame Fügeschicht.'},
    {id:5,start:8.8,end:10,title:'Schweisswulst kontrollieren',text:'Am Fügebereich entsteht eine gleichmässige Schweisswulst. Die Verbindung bleibt während der erforderlichen Abkühlphase fixiert und wird anschliessend nach den Vorgaben des Systems kontrolliert.',points:['Gleichmässige Wulst als sichtbares Merkmal prüfen','Verbindung während des Abkühlens nicht belasten','System- und Herstellervorgaben für die Beurteilung verwenden'],cross:'Nach dem Fügen ist der Querschnitt stoffschlüssig verbunden; aussen ist die Schweisswulst sichtbar.'}
  ];

  const $ = (id) => document.getElementById(id);
  const play=$('pePlay'), prev=$('pePrev'), next=$('peNext'), restart=$('peRestart'), scrub=$('peScrubber');
  const tabs=$('peStepTabs'), title=$('peStepTitle'), copy=$('peStepText'), keypoints=$('peKeypoints');
  const overlayTitle=$('peStepOverlayTitle'), overlayNum=$('peStepNumber'), time=$('peTime');
  const cross=$('crossSection'), crossText=$('crossText'), crossToggle=$('crossToggle'), hotspotToggle=$('showHotspots'), pop=$('hotspotPop');
  let current=0, autoplayStep=false, hotspots=false;
  const stateKey='riadInteractivePEv1';
  const st=JSON.parse(localStorage.getItem(stateKey)||'{"seen":[],"quizBest":0,"sequenceDone":false}');
  st.seen=Array.isArray(st.seen)?st.seen:[];
  const save=()=>localStorage.setItem(stateKey,JSON.stringify(st));

  function buildTabs(){
    tabs.innerHTML=steps.map((s,i)=>`<button class="pe-step-tab ${i===current?'active':''} ${st.seen.includes(s.id)?'seen':''}" data-i="${i}"><b>${i+1}. ${s.title}</b>${s.start.toFixed(1)}–${s.end.toFixed(1)} s</button>`).join('');
    tabs.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>goStep(Number(b.dataset.i),true)));
  }
  function stepForTime(t){return Math.min(steps.length-1,Math.max(0,steps.findIndex(s=>t>=s.start && t<s.end)===-1?steps.length-1:steps.findIndex(s=>t>=s.start && t<s.end)))}
  function updateCross(i){
    cross.classList.remove('hot','joined');
    if(i===1||i===2) cross.classList.add('hot');
    if(i>=3) cross.classList.add('joined');
    crossText.textContent=steps[i].cross;
  }
  function renderStep(i){
    current=i; const s=steps[i];
    title.textContent=s.title; copy.textContent=s.text; overlayTitle.textContent=s.title; overlayNum.textContent=`Schritt ${i+1}/5`;
    keypoints.innerHTML=s.points.map(p=>`<div class="keypoint">${p}</div>`).join('');
    updateCross(i); buildTabs(); renderProgress(); updateHotspotText();
  }
  function markSeen(i){
    const id=steps[i].id; if(!st.seen.includes(id)){st.seen.push(id);save();buildTabs();renderProgress();}
  }
  function goStep(i,playStep=false){
    i=Math.max(0,Math.min(steps.length-1,i)); renderStep(i); video.currentTime=steps[i].start+0.02; markSeen(i);
    autoplayStep=playStep; if(playStep){video.play().catch(()=>{});} else {video.pause();}
  }
  function renderProgress(){
    const pct=Math.round((st.seen.length/steps.length)*100); $('peProgressText').textContent=`${st.seen.length} von 5 Schritten angesehen${st.quizBest===3?' · Wissenstest bestanden':''}`; $('peProgressBar').style.width=pct+'%';
  }
  video.addEventListener('loadedmetadata',()=>{scrub.max=video.duration||10; time.textContent=`0.0 / ${(video.duration||10).toFixed(1)} s`;});
  video.addEventListener('timeupdate',()=>{
    const d=video.duration||10, t=video.currentTime; scrub.value=t; time.textContent=`${t.toFixed(1)} / ${d.toFixed(1)} s`;
    const i=stepForTime(t); if(i!==current) renderStep(i); markSeen(i);
    if(autoplayStep && t>=steps[current].end-.04){video.pause();autoplayStep=false;video.currentTime=Math.max(steps[current].start,steps[current].end-.05);}
  });
  video.addEventListener('play',()=>play.textContent='❚❚ Pause'); video.addEventListener('pause',()=>play.textContent='▶ Start');
  play.addEventListener('click',()=>{autoplayStep=false; video.paused?video.play():video.pause();});
  prev.addEventListener('click',()=>goStep(current-1,true)); next.addEventListener('click',()=>goStep(current+1,true)); restart.addEventListener('click',()=>goStep(0,false));
  scrub.addEventListener('input',()=>{autoplayStep=false;video.currentTime=Number(scrub.value);});
  crossToggle.addEventListener('click',()=>{cross.hidden=!cross.hidden;crossToggle.textContent=cross.hidden?'Querschnitt einblenden':'Querschnitt ausblenden';});

  const hsText={
    0:{left:'Linkes PE-Rohr: Das Rohrende wird in der Spannvorrichtung ausgerichtet.',center:'Fügebereich: Hier treffen die beiden vorbereiteten Stirnflächen später aufeinander.',right:'Rechtes PE-Rohr: Auch dieses Rohrende muss fluchtend zur gemeinsamen Achse liegen.'},
    1:{left:'PE-Fügefläche: Sie wird durch Kontakt mit der Heizplatte gleichmässig erwärmt.',center:'Heizplatte: Sie überträgt Wärme auf beide PE-Stirnflächen. Keine offene Flamme.',right:'PE-Fügefläche: Beide Seiten werden gleichzeitig erwärmt.'},
    2:{left:'Erwärmte Fügefläche: Jetzt sauber und frei von Verunreinigungen halten.',center:'Umstellphase: Die Heizplatte ist entfernt, die Rohrenden werden zum Fügen vorbereitet.',right:'Erwärmte Fügefläche: Nicht berühren und nicht verschmutzen.'},
    3:{left:'Spannvorrichtung: Sie führt die Rohre axial zusammen.',center:'Fügezone: Die plastifizierten PE-Flächen verbinden sich unter kontrolliertem Druck.',right:'Spannvorrichtung: Die Rohrachsen bleiben beim Fügen ausgerichtet.'},
    4:{left:'Rohr: Während des Abkühlens darf die Verbindung nicht unnötig belastet werden.',center:'Schweisswulst: Die sichtbare Wulst entsteht beim Fügen der plastifizierten Rohrenden.',right:'Rohr: Die Verbindung bleibt bis zur ausreichenden Abkühlung fixiert.'}
  };
  function updateHotspotText(){if(!hotspots){pop.hidden=true;return;} pop.hidden=false;pop.textContent='Tippe auf einen markierten Bereich.';}
  hotspotToggle.addEventListener('click',()=>{hotspots=!hotspots;document.querySelectorAll('#peStage .hotspot').forEach(h=>h.classList.toggle('show',hotspots));hotspotToggle.textContent=hotspots?'Bauteile ausblenden':'Bauteile anzeigen';updateHotspotText();});
  document.querySelectorAll('#peStage .hotspot').forEach(h=>h.addEventListener('click',()=>{pop.hidden=false;pop.textContent=hsText[current][h.dataset.hotspot];}));

  const seq=[steps[2],steps[0],steps[4],steps[1],steps[3]], picked=[];
  function renderSequence(){
    $('sequenceBank').innerHTML=seq.map(s=>`<button class="sequence-chip ${picked.includes(s.id)?'used':''}" data-id="${s.id}">${s.title}</button>`).join('');
    $('sequenceAnswer').innerHTML=picked.length?picked.map((id,i)=>`<span class="picked">${i+1}. ${steps[id-1].title}</span>`).join(''):'<span>Noch keine Auswahl</span>';
    $('sequenceBank').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{picked.push(Number(b.dataset.id));renderSequence();}));
  }
  $('sequenceReset').addEventListener('click',()=>{picked.length=0;renderSequence();const r=$('sequenceResult');r.className='result';r.textContent='';});
  $('sequenceCheck').addEventListener('click',()=>{const ok=picked.length===5&&picked.every((x,i)=>x===i+1);const r=$('sequenceResult');r.className='result show '+(ok?'ok':'bad');r.textContent=ok?'Richtig ✓ – der Ablauf stimmt.':'Noch nicht richtig. Prüfe die Reihenfolge und versuche es nochmals.';if(ok){st.sequenceDone=true;save();}});

  const quiz=[
    {q:'Was folgt in der Animation direkt nach dem Erwärmen der Rohrenden?',a:1,o:['Die Rohre werden sofort verdreht','Die Heizplatte wird entfernt','Die Schweisswulst wird abgeschliffen']},
    {q:'Wie werden die erwärmten PE-Rohrenden gefügt?',a:2,o:['Mit offener Flamme','Durch seitliches Verschieben','Axial und mit kontrolliertem Druck']},
    {q:'Welches sichtbare Merkmal entsteht am Fügebereich?',a:0,o:['Eine Schweisswulst','Eine Schraubverbindung','Eine Lötnaht']}
  ];
  function renderQuiz(){
    $('peQuiz').innerHTML=quiz.map((q,qi)=>`<div class="quiz-question"><strong>${qi+1}. ${q.q}</strong><div class="quiz-options">${q.o.map((o,oi)=>`<label class="quiz-option"><input type="radio" name="peq${qi}" value="${oi}"><span>${o}</span></label>`).join('')}</div></div>`).join('');
  }
  $('peQuizCheck').addEventListener('click',()=>{let score=0;quiz.forEach((q,i)=>{const el=document.querySelector(`input[name="peq${i}"]:checked`);if(el&&Number(el.value)===q.a)score++;});st.quizBest=Math.max(st.quizBest||0,score);save();renderProgress();const r=$('peQuizResult');r.className='result show '+(score===3?'ok':'bad');r.textContent=score===3?'3/3 richtig ✓ – Modulwissen sitzt.':`${score}/3 richtig. Gehe bei Bedarf nochmals durch die einzelnen Schritte.`;});
  $('peQuizReset').addEventListener('click',()=>{renderQuiz();const r=$('peQuizResult');r.className='result';r.textContent='';});

  renderStep(0); renderProgress(); renderSequence(); renderQuiz();
})();
