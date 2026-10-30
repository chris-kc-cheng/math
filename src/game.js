import {mountMoles} from './game/moles.js';
import {setActionBusy} from './game/controls.js';
import {calculatorPlan,setCalculatorContext,clearCalculatorContext} from './calculator/plans.js';
import 'katex/dist/katex.min.css';
import {pageNav} from './nav.js';
import './style.css';
import './curriculum.css';
import './game.css';
import katex from 'katex';
import {catalog,curriculumForGrade} from './curriculum/catalog.js';
import {createPractice} from './curriculum/practice.js';
import {renderVisual} from './curriculum/visuals.js';
import {mountPractice} from './curriculum/practice-view.js';
import {playerKey,lastPlayed,makeRound,topicOptions,findNode,roundTopics,topicKey,score,answerAndExplainRound,revealRound,advanceRound,battleState,progressTree,overallProgress,STAT_WINDOW} from './game/model.js';
import {setMathText} from './math-text.js';
import {mountGradePicker} from './grade-picker.js';
import {listRounds,saveRound} from './game/storage.js';
import {chooseProfile,activeProfile} from './game/profile.js';
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const app=document.querySelector('#app');
app.innerHTML='<main class="game-page">'+pageNav('game')+'<div class="game-head"><h1>Practice</h1><div class="game-tools"><button id="game-quit" type="button" class="playback-icon" hidden aria-label="Quit game. You can resume later." title="Quit game (resume later)"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4H5v16h5"/><path d="M15 8l4 4-4 4"/><path d="M19 12H9"/></svg></button><span class="info-tip"><span class="info-icon" tabindex="0" role="img" aria-label="About saving">i</span><span id="save-status" role="status" class="info-bubble">Opening local progress…</span></span></div></div><div class="setup-gate"><form id="game-setup"><p class="game-player">Playing as <strong id="player-label"></strong></p><div id="game-grade-host" class="game-grade"></div><select id="game-grade" aria-label="Game grade" hidden></select><label>Game <select id="game-mode"><option value="moles">Whack-a-Math</option><option value="classic">Captain Patty</option></select></label><label>Questions <input id="game-count" name="count" type="number" min="1" max="50" step="1" value="5" required aria-label="Number of questions" title="1–50 questions"></label><section id="topic-panel" class="topic-panel" aria-label="Topics and progress"><div class="topic-head"><h2>Topics</h2><span id="topic-summary" class="topic-summary">All topics</span></div><p id="topic-legend" class="stat-legend"></p><div id="topic-list" class="topic-list"></div></section><button type="submit" id="game-start" disabled>Play</button></form><div id="player-prompt" class="player-prompt" role="status"><strong>Choose or create a player to begin</strong><span>Use the player button at the top right.</span><button type="button" id="choose-player">Choose a player</button></div></div><p id="game-error" role="alert"></p><div id="game-round"></div></main>';
const $=s=>document.querySelector(s),gradeSelect=$('#game-grade'),countInput=$('#game-count');
let playerName='',round,rounds=[],step='player',ready=false,memoryOnly=false,busy=false,dispose,feedback='',selectedPlayer='',pendingShot='';
const art=name=>`${import.meta.env.BASE_URL}game-art/${name}.svg`;
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
for(const g of catalog){const option=el('option',String(g.grade));option.value=g.grade;gradeSelect.append(option);}gradeSelect.value=curriculumForGrade(new URLSearchParams(location.search).get('grade')).grade;
// The grade picker is the visible control; the hidden select stays the single source of truth, and assigning its value updates the picker.
const gradePicker=mountGradePicker($('#game-grade-host'),{grades:catalog.map(g=>g.grade),value:gradeSelect.value,onChange:value=>{gradeSelect.value=value;gradeSelect.dispatchEvent(new Event('change'));},collapsible:true,triggerLabel:grade=>`Grade ${grade}`});
{const base=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value');Object.defineProperty(gradeSelect,'value',{get(){return base.get.call(this);},set(next){base.set.call(this,next);gradePicker.set(base.get.call(this));}});}
// Captain Patty (left) fires ketchup at Grumble (right). Hearts show how many questions are still unsolved.
function renderStage(state,shot){
 const stage=el('div',undefined,'game-stage'),image=(name,cls)=>{const img=el('img',undefined,cls);img.src=art(name);img.alt='';img.setAttribute('aria-hidden','true');img.draggable=false;return img;};
 stage.style.setProperty('--misses',state.misses);if(state.crying)stage.classList.add('is-crying');if(state.done)stage.classList.add(state.won?'is-won':'is-lost');if(shot&&!reduceMotion())stage.classList.add(shot==='hit'?'shot-hit':'shot-miss');
 const hearts=el('div',undefined,'game-hearts');hearts.setAttribute('aria-hidden','true');if(state.total>5)hearts.append(el('span',`♥ ${state.hearts} / ${state.total}`));else for(let i=0;i<state.total;i++)hearts.append(el('span',i<state.hearts?'♥':'♡',i<state.hearts?'full':'empty'));
 const lives=el('div',undefined,'game-lives');lives.setAttribute('aria-hidden','true');for(let i=0;i<state.maxLives;i++)lives.append(el('span',i<state.lives?'♥':'♡',i<state.lives?'full':'empty'));
 const hero=el('div',undefined,'game-hero');hero.append(image('burger-hero',''),el('span',undefined,'tear tear-l'),el('span',undefined,'tear tear-r'));
 stage.append(hearts,lives,hero,image('zombie','game-zombie'),image('ketchup-shot','game-shot'),el('div',undefined,'game-splat'));
 const summary=el('p',state.done?(state.won?'Captain Patty wins! Grumble is covered in ketchup.':'Grumble got away this time. Try another round!'):`Grumble has ${state.hearts} ${state.hearts===1?'heart':'hearts'} left${state.misses?' and is getting closer':''}. Captain Patty has ${state.lives} ${state.lives===1?'life':'lives'} left${state.crying?' and is crying, but he is fine':''}.`,'sr-only');summary.setAttribute('role','status');stage.append(summary);
 return stage;
}
function renderHistory(){
 const old=$('#game-history');old?.remove();let key;try{key=playerKey(playerName);}catch{return;}
 const done=rounds.filter(r=>r.profileId===key&&r.status==='complete').slice(0,5);if(!done.length)return;
 const details=el('details',undefined,'game-history');details.id='game-history';details.append(el('summary',`Past rounds (${done.length})`));
 for(const r of done){const state=battleState(r),row=el('div',undefined,'game-history-row');row.append(el('span',`${new Date(r.updatedAt).toLocaleDateString('en-CA')} · Grade ${r.grade}`),el('span',`${score(r)} / ${state.total*10} points · ${state.won?'Won':'Practised'}`));details.append(row);}
 $('.game-page').append(details);
}
// Each topic row carries its colour-coded progress (never colour alone: the row also states the percentage).
const statLabel={good:'Strong',fair:'Getting there',weak:'Needs practice',none:'Not tried yet'};
function topicStats(grade){
 let key;try{key=playerKey(playerName);}catch{return new Map();}
 const map=new Map(),walk=n=>{map.set(n.id,n);n.children?.forEach(walk);};progressTree(grade,rounds,key).forEach(walk);map.set('all',overallProgress(grade,rounds,key));return map;
}
function statParts(node){
 const status=node?.status||'none',dot=el('span',undefined,'stat-dot '+status);dot.setAttribute('role','img');dot.setAttribute('aria-label',statLabel[status]);
 return [dot,el('small',node?.stat?`${Math.round(node.stat.rate*100)}% of last ${node.stat.attempts}`:'Not tried yet','topic-stat')];
}
// Topics: pick any mix of whole strands and single topics. Nothing ticked means every topic.
const topicList=$('#topic-list'),topicCache=new Map();let chosen=new Set();
const chosenTopics=()=>{const all=topicCache.get(Number(gradeSelect.value))||[],ids=all.filter(o=>o.level==='topic').map(o=>o.id);return ids.length&&ids.every(id=>chosen.has(id))?[]:ids.filter(id=>chosen.has(id));};
function topicLabel(grade,ids){
 if(!ids.length)return 'All topics';
 const names=ids.map(id=>findNode(grade.curriculum,id)?.title.replace(/^[A-F]\d+ · /,'')).filter(Boolean);
 return names.length<=2?names.join(', '):`${names.length} topics`;
}
function renderTopics(){
 const grade=curriculumForGrade(gradeSelect.value),options=topicCache.get(grade.grade),selected=chosenTopics();topicList.replaceChildren();
 const stats=topicStats(grade),box=(label,checked,onchange,cls,node)=>{const row=el('label',undefined,cls||'topic-row'),input=document.createElement('input');input.type='checkbox';input.checked=checked;input.onchange=()=>onchange(input.checked);const[dot,note]=statParts(node);row.append(dot,input,el('span',label,'topic-name'),note);return {row,input};};
 const all=box('All topics',!selected.length,on=>{if(on)chosen.clear();updateStart();},'topic-row topic-all',stats.get('all'));topicList.append(all.row);
 let group;
 for(const option of options){
  if(option.level==='strand'){
   const mine=el('div',undefined,'topic-group'),kids=options.filter(o=>o.level==='topic'&&o.strand===option.title);group=mine;topicList.append(mine);
   const full=kids.every(k=>selected.includes(k.id)),some=kids.some(k=>selected.includes(k.id)),head=box(option.title,Boolean(selected.length)&&full,on=>{if(!selected.length)chosen=new Set();for(const k of kids)on?chosen.add(k.id):chosen.delete(k.id);updateStart();},'topic-row topic-strand',stats.get(option.id));
   head.input.indeterminate=Boolean(selected.length)&&some&&!full;mine.append(head.row);}
  else{const row=box(option.title,selected.includes(option.id),on=>{if(!selected.length&&on)chosen=new Set();on?chosen.add(option.id):chosen.delete(option.id);updateStart();},'topic-row topic-leaf',stats.get(option.id));group.append(row.row);}
 }
 $('#topic-summary').textContent=topicLabel(grade,selected);
 const legend=$('#topic-legend');legend.replaceChildren(el('span',`Based on your last ${STAT_WINDOW} questions in each topic:`));for(const status of ['good','fair','weak','none']){const item=el('span',undefined,'stat-key');item.append(el('span',undefined,'stat-dot '+status),statLabel[status]);legend.append(item);}
}
function fillTopics(wanted=[]){
 const grade=curriculumForGrade(gradeSelect.value);if(!topicCache.has(grade.grade))topicCache.set(grade.grade,topicOptions(grade));
 const known=new Set(topicCache.get(grade.grade).map(o=>o.id));chosen=new Set();
 for(const id of wanted){if(known.has(id)){const opt=topicCache.get(grade.grade).find(o=>o.id===id);if(opt.level==='topic')chosen.add(id);else topicCache.get(grade.grade).filter(o=>o.strand===opt.title).forEach(o=>chosen.add(o.id));}}
 renderTopics();
}
function setStep(next){
 step=next;const page=document.querySelector('.game-page');page.classList.toggle('step-player',next==='player');page.classList.toggle('step-topics',next==='topics');$('#game-setup').inert=next==='player';
 if(next==='topics'){$('#player-label').textContent=playerName.trim().replace(/\s+/g,' ');updateStart();}
}
const sameRound=(r,key)=>r.profileId===key&&r.grade===Number(gradeSelect.value)&&topicKey(roundTopics(r))===topicKey(chosenTopics())&&r.questions.length===Number(countInput.value)&&r.status==='active';
function updateStart(){
 if(topicCache.has(Number(gradeSelect.value)))renderTopics();
 let key;try{key=playerKey(playerName);}catch{return;}
 $('#game-start').textContent=rounds.some(r=>sameRound(r,key))?'Continue':'Play';
 $('#game-start').disabled=!ready||!countInput.validity.valid;
}
function setPlayer(name){
 playerName=name;let key;try{key=playerKey(name);}catch{key='';}
 if(key!==selectedPlayer){round=undefined;feedback='';selectedPlayer=key;renderRound();renderHistory();const previous=lastPlayed(rounds,key);if(previous){gradeSelect.value=previous.grade;countInput.value=String(previous.questions.length);fillTopics(roundTopics(previous));}}
 updateStart();
}
gradeSelect.onchange=()=>{fillTopics([]);updateStart();};
countInput.oninput=updateStart;
// The player badge in the corner switches players without leaving the page, unless a round is in progress.
document.addEventListener('math-profile-change',event=>{if(round?.status==='active')return;if(event.detail){setPlayer(event.detail.name);setStep('topics');}else{setPlayer('');round=undefined;feedback='';renderRound();setStep('player');}});
$('#choose-player').onclick=()=>document.querySelector('.profile-button')?.click();
fillTopics([]);setStep('player');
function savedLabel(){ $('#save-status').textContent=memoryOnly?'Playing without saving. Progress will be lost when this page closes.':'Progress saved on this device. No account needed.'; }
async function persist(next){
 const saved=memoryOnly?{...next,updatedAt:Date.now()}:await saveRound(next);
 if(!memoryOnly)document.dispatchEvent(new CustomEvent('math-rounds-changed'));
 round=saved;rounds=[saved,...rounds.filter(r=>r.id!==saved.id)];savedLabel();updateStart();renderHistory();
}
async function action(work){if(busy)return;busy=true;$('#game-error').textContent='';setActionBusy(document,true,{ready,countValid:countInput.validity.valid});try{await work();}catch(error){$('#game-error').textContent=error.message;}finally{busy=false;setActionBusy(document,false,{ready,countValid:countInput.validity.valid});renderRound();}}
function renderRound(){
 dispose?.();dispose=undefined;const host=$('#game-round'),shot=pendingShot;pendingShot='';host.replaceChildren();
 document.querySelector('.game-page').classList.toggle('in-game',Boolean(round));$('#game-quit').hidden=!round;if(!round){clearCalculatorContext();return;}
 if(round.status==='complete'){
  if($('#game-mode').value==='moles'){
   const field=el('section',undefined,'mole-field'),again=el('button','Play again','mole-next'),leave=el('button','Back to topics','mole-next');
   field.append(el('h1','Meadow complete!'),el('p',`${round.questions.filter(q=>q.correct).length} / ${round.questions.length} correct · ${score(round)} points`,'mole-caption'),again,leave);
   again.onclick=()=>$('#game-setup').requestSubmit();leave.onclick=()=>{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});$('#game-quit').click();};host.append(field);return;
  }

  const state=battleState(round),again=el('button','Play again');again.type='button';again.onclick=()=>$('#game-setup').requestSubmit();host.append(renderStage(state,shot),el('h2',state.won?'You win!':'Nice effort!'),el('p',`${score(round)} / ${state.total*10} points`,'game-score'),el('p',`${state.hits} solved · ${round.questions.filter(q=>q.assisted).length} explored with explanations`),el('p','Play again for new questions, or quit to change the grade or topics.'),again);
  return;
 }
 const grade=curriculumForGrade(round.grade),picked=roundTopics(round),current=round.questions[round.index],template=grade.questions.find(q=>q.id===current.templateId);
 if(!template){host.append(el('p','This saved question is no longer available. Start a new round above.'));return;}
 let lesson;try{lesson=createPractice(template,current.values);}catch{host.append(el('p','This saved question cannot be opened with the current library. Start a new round above.'));return;}
 if($('#game-mode').value==='moles'){
  clearCalculatorContext();
  let disposeLesson;
  const disposeField=mountMoles(host,{round,template,lesson,
   onQuit:()=>$('#game-quit').click(),
   onAnswer:entry=>action(async()=>{await persist(answerAndExplainRound(round,template,entry));}),
   onNext:()=>action(async()=>{await persist(advanceRound(round));feedback='';}),
   explain:panel=>{disposeLesson=mountPractice(panel,template,current.values);disposeLesson.showAll();}
  });dispose=()=>{disposeLesson?.();disposeField();};return;
 }
 setCalculatorContext(calculatorPlan({template,lesson}));
 const top=el('div',undefined,'game-progress');top.append(el('span',`${round.playerName} · Grade ${round.grade}${picked.length?' · '+topicLabel(grade,picked):''} · Question ${round.index+1} of ${round.questions.length}`),el('span',`${score(round)} points`));const progress=el('progress');progress.max=round.questions.length;progress.value=round.index;progress.setAttribute('aria-label','Questions completed');host.append(top,progress,renderStage(battleState(round),shot),el('h2',template.title));
 if(lesson.prompt)host.append(setMathText(el('p',undefined,'practice-prompt'),lesson.prompt));
 if(lesson.formula){const formula=el('div',undefined,'math');katex.render(lesson.formula,formula,{displayMode:true,throwOnError:true,trust:false});host.append(formula);}if(lesson.visual)renderVisual(host,lesson.visual);
 const finished=current.correct||current.assisted,status=el('p',feedback||(current.correct?'Correct!':current.assisted?(current.attempts?'Not quite. Let’s work through the solution together.':'Explore the explanation, then continue.'):current.attempts?'Keep trying, or explore the explanation.':''),'game-feedback');status.setAttribute('role','status');
 if(current.correct||current.assisted&&current.attempts){const correct=current.correct;status.classList.add(correct?'is-correct':'is-incorrect');status.prepend(el('span',correct?'✓':'✕','feedback-symbol'));}
 if(!finished){
  const form=el('form',undefined,'game-answer'),label=el('label','Your answer'),input=el('input');input.name='answer';input.type='text';input.inputMode='text';input.maxLength=80;input.autocomplete='off';input.required=true;input.value=current.entry;input.setAttribute('aria-describedby','answer-format');label.append(input);const check=el('button','Check answer');check.type='submit';const format=el('p','Whole number, decimal, or fraction (for example, 3/4). Omit units.','game-format');format.id='answer-format';form.append(label,check);host.append(form,format);
  form.onsubmit=event=>{event.preventDefault();action(async()=>{const next=answerAndExplainRound(round,template,input.value);await persist(next);pendingShot=next.questions[next.index].correct?'hit':'miss';feedback=next.questions[next.index].correct?'Correct! Direct hit. Here’s how it works.':'Not quite. Let’s work through the solution together.';});};
 }
 host.append(status);
 const controls=el('div',undefined,'controls'),explain=el('button',finished?'Show explanation':'Explore explanation');explain.type='button';controls.append(explain);
 const explanation=el('div',undefined,'game-explanation');explanation.hidden=!finished;
 const showExplanation=()=>{explanation.hidden=false;dispose=mountPractice(explanation,template,current.values);dispose.showAll();explain.hidden=true;};
 explain.onclick=()=>action(async()=>{await persist(revealRound(round));pendingShot='miss';feedback=current.correct?'Correct! Review how the answer checks.':'This question is now a practice example. No points are deducted.';});
 if(finished){const next=el('button',round.index===round.questions.length-1?'Finish round':'Next question');next.type='button';next.onclick=()=>action(async()=>{await persist(advanceRound(round));feedback='';});controls.append(next);}
 host.append(explanation,controls);
 if(finished)showExplanation();
}
$('#game-quit').onclick=()=>{if(busy)return;round=undefined;feedback='';renderRound();updateStart();};
$('#game-setup').onsubmit=event=>{event.preventDefault();action(async()=>{
 const key=playerKey(playerName),name=playerName.trim().replace(/\s+/g,' '),grade=curriculumForGrade(gradeSelect.value);
 if(!memoryOnly)rounds=await listRounds();
 const previous=rounds.find(r=>sameRound(r,key));
 const next=previous||{...makeRound(grade,chosenTopics(),Math.random,crypto.randomUUID(),Number(countInput.value)),profileId:key,playerName:name};
 await persist({...next,playerName:name});chooseProfile({id:key,name});selectedPlayer=key;feedback='';
});};
try{
 rounds=await listRounds();ready=true;$('#save-status').textContent='Saved on this device.';$('#game-start').disabled=false;
 // A signed-in player goes straight to the settings; Guest is asked to choose a player from the badge.
 const signedIn=activeProfile(rounds);if(signedIn){setPlayer(signedIn.name);setStep('topics');}
}catch(error){
 $('#save-status').textContent='Local saving is unavailable: '+error.message;$('.info-tip').classList.add('is-warning');
 const play=el('button','Play without saving');play.type='button';play.onclick=()=>{memoryOnly=true;ready=true;$('#game-start').disabled=false;play.remove();savedLabel();};$('.info-tip').after(play);
}
