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
import {playerKey,lastPlayed,makeRound,score,answerRound,revealRound,advanceRound,battleState,progressTree,STAT_WINDOW} from './game/model.js';
import {listRounds,saveRound} from './game/storage.js';
import {chooseProfile} from './game/profile.js';
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const app=document.querySelector('#app');
app.innerHTML='<main class="game-page">'+pageNav('game')+'<div class="game-head"><h1>Math quest</h1><div class="game-tools"><button id="game-quit" type="button" class="playback-icon" hidden aria-label="Quit game. You can resume later." title="Quit game (resume later)"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4H5v16h5"/><path d="M15 8l4 4-4 4"/><path d="M19 12H9"/></svg></button><span class="info-tip"><span class="info-icon" tabindex="0" role="img" aria-label="About saving">i</span><span id="save-status" role="status" class="info-bubble">Opening local progress…</span></span></div></div><p class="game-intro">Five questions. Take your time, try an answer, and explore the steps.</p><form id="game-setup"><div id="profile-picker" class="profile-picker" role="group" aria-label="Previous players" hidden><span class="profile-label">Previous players</span><div id="game-profiles" class="profile-badges"></div></div><label>Your name <input id="game-name" name="player" autocomplete="off" maxlength="40" required></label><label>Grade <select id="game-grade" aria-label="Game grade"></select></label><button type="submit" id="game-start" disabled>Play</button></form><section id="game-stats" class="game-stats" aria-label="Progress by topic" hidden></section><p id="game-error" role="alert"></p><div id="game-round"></div></main>';
const $=s=>document.querySelector(s),gradeSelect=$('#game-grade'),nameInput=$('#game-name');
let round,rounds=[],ready=false,memoryOnly=false,busy=false,dispose,feedback='',selectedPlayer='',pendingShot='';
const art=name=>`${import.meta.env.BASE_URL}game-art/${name}.svg`;
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
for(const g of catalog){const option=el('option',String(g.grade));option.value=g.grade;gradeSelect.append(option);}gradeSelect.value=curriculumForGrade(new URLSearchParams(location.search).get('grade')).grade;
// Captain Patty (left) fires ketchup at Grumble (right). Hearts show how many questions are still unsolved.
function renderStage(state,shot){
 const stage=el('div',undefined,'game-stage'),image=(name,cls)=>{const img=el('img',undefined,cls);img.src=art(name);img.alt='';img.setAttribute('aria-hidden','true');img.draggable=false;return img;};
 stage.style.setProperty('--misses',state.misses);if(state.crying)stage.classList.add('is-crying');if(state.done)stage.classList.add(state.won?'is-won':'is-lost');if(shot&&!reduceMotion())stage.classList.add(shot==='hit'?'shot-hit':'shot-miss');
 const hearts=el('div',undefined,'game-hearts');hearts.setAttribute('aria-hidden','true');for(let i=0;i<state.total;i++)hearts.append(el('span',i<state.hearts?'♥':'♡',i<state.hearts?'full':'empty'));
 const lives=el('div',undefined,'game-lives');lives.setAttribute('aria-hidden','true');for(let i=0;i<state.maxLives;i++)lives.append(el('span',i<state.lives?'♥':'♡',i<state.lives?'full':'empty'));
 const hero=el('div',undefined,'game-hero');hero.append(image('burger-hero',''),el('span',undefined,'tear tear-l'),el('span',undefined,'tear tear-r'));
 stage.append(hearts,lives,hero,image('zombie','game-zombie'),image('ketchup-shot','game-shot'),el('div',undefined,'game-splat'));
 const summary=el('p',state.done?(state.won?'Captain Patty wins! Grumble is covered in ketchup.':'Grumble got away this time. Try another round!'):`Grumble has ${state.hearts} ${state.hearts===1?'heart':'hearts'} left${state.misses?' and is getting closer':''}. Captain Patty has ${state.lives} ${state.lives===1?'life':'lives'} left${state.crying?' and is crying, but he is fine':''}.`,'sr-only');summary.setAttribute('role','status');stage.append(summary);
 return stage;
}
// Players who already have rounds on this device can be picked instead of retyping the name.
function renderProfiles(){
 const picker=$('#profile-picker'),list=$('#game-profiles'),seen=new Map();
 for(const r of rounds)if(!seen.has(r.profileId))seen.set(r.profileId,r.playerName); // rounds are newest first
 list.replaceChildren();picker.hidden=!seen.size;
 for(const [id,name] of seen){
  const badge=el('button',undefined,'profile-badge');badge.type='button';badge.dataset.profile=id;badge.append(el('span',name));
  badge.onclick=()=>{nameInput.value=name;nameInput.dispatchEvent(new Event('input'));$('#game-setup').requestSubmit();};list.append(badge);
 }
 markProfile();
}
function markProfile(){
 let key='';try{key=playerKey(nameInput.value);}catch{}
 document.querySelectorAll('.profile-badge').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.profile===key)));
}
function renderHistory(){
 const old=$('#game-history');old?.remove();let key;try{key=playerKey(nameInput.value);}catch{return;}
 const done=rounds.filter(r=>r.profileId===key&&r.status==='complete').slice(0,5);if(!done.length)return;
 const details=el('details',undefined,'game-history');details.id='game-history';details.append(el('summary',`Past rounds (${done.length})`));
 for(const r of done){const state=battleState(r),row=el('div',undefined,'game-history-row');row.append(el('span',`${new Date(r.updatedAt).toLocaleDateString('en-CA')} · Grade ${r.grade}`),el('span',`${score(r)} / ${state.total*10} points · ${state.won?'Won':'Practised'}`));details.append(row);}
 $('.game-page').append(details);
}
// Colour-coded progress per topic (never colour alone: each row also states the percentage).
const statLabel={good:'Strong',fair:'Getting there',weak:'Needs practice',none:'Not tried yet'};
function statRow(node){
 const row=el('span',undefined,'stat-row'),dot=el('span',undefined,'stat-dot '+node.status);dot.setAttribute('role','img');dot.setAttribute('aria-label',statLabel[node.status]);
 row.append(dot,el('span',node.title,'stat-title'),el('small',node.stat?`${Math.round(node.stat.rate*100)}% of last ${node.stat.attempts}`:'Not tried yet','stat-note'));return row;
}
function statNode(node){
 if(!node.children){const item=el('li',undefined,'stat-leaf');item.append(statRow(node));return item;}
 const details=el('details',undefined,'stat-group');details.dataset.level=node.level;const summary=el('summary');summary.append(statRow(node));details.append(summary);
 const list=el('ul');for(const child of node.children)list.append(child.children?(()=>{const wrap=el('li');wrap.append(statNode(child));return wrap;})():statNode(child));details.append(list);return details;
}
function renderStats(){
 const host=$('#game-stats');host.replaceChildren();let key;try{key=playerKey(nameInput.value);}catch{host.hidden=true;return;}
 const tree=rounds.some(r=>r.profileId===key)?progressTree(curriculumForGrade(gradeSelect.value),rounds,key):[];host.hidden=!tree.length;if(!tree.length)return;
 const legend=el('p',undefined,'stat-legend');for(const status of ['good','fair','weak','none']){const item=el('span',undefined,'stat-key');item.append(el('span',undefined,'stat-dot '+status),statLabel[status]);legend.append(item);}
 const list=el('div',undefined,'stat-tree');for(const strand of tree)list.append(statNode(strand));
 host.append(el('h2',`How you're doing · Grade ${gradeSelect.value}`),el('p',`Based on your last ${STAT_WINDOW} questions in each topic. Strong is 80% or more, Getting there is 50–79%.`,'stat-help'),legend,list);
}
function updateStart(){
 renderStats();
 let key;try{key=playerKey(nameInput.value);}catch{return;}
 $('#game-start').textContent=rounds.some(r=>r.profileId===key&&r.grade===Number(gradeSelect.value)&&r.status==='active')?'Continue':'Play';
}
nameInput.oninput=()=>{
 let key;try{key=playerKey(nameInput.value);}catch{key='';}
 if(key!==selectedPlayer){round=undefined;feedback='';selectedPlayer=key;renderRound();renderHistory();const previous=lastPlayed(rounds,key);if(previous)gradeSelect.value=previous.grade;}
 updateStart();markProfile();
};
gradeSelect.onchange=updateStart;
function savedLabel(){ $('#save-status').textContent=memoryOnly?'Playing without saving. Progress will be lost when this page closes.':'Progress saved on this device. No account needed.'; }
async function persist(next){
 const saved=memoryOnly?{...next,updatedAt:Date.now()}:await saveRound(next);
 round=saved;rounds=[saved,...rounds.filter(r=>r.id!==saved.id)];savedLabel();updateStart();renderHistory();renderProfiles();
}
async function action(work){if(busy)return;busy=true;$('#game-error').textContent='';document.querySelectorAll('#game-setup button,#game-quit,#game-round button,#game-round input').forEach(b=>b.disabled=true);try{await work();}catch(error){$('#game-error').textContent=error.message;}finally{busy=false;$('#game-quit').disabled=false;$('#game-start').disabled=!ready;renderRound();}}
function renderRound(){
 dispose?.();dispose=undefined;const host=$('#game-round'),shot=pendingShot;pendingShot='';host.replaceChildren();
 document.querySelector('.game-page').classList.toggle('in-game',Boolean(round));$('#game-quit').hidden=!round;if(!round)return;
 if(round.status==='complete'){
  const state=battleState(round),again=el('button','Play again');again.type='button';again.onclick=()=>$('#game-setup').requestSubmit();host.append(renderStage(state,shot),el('h2',state.won?'You win!':'Nice effort!'),el('p',`${score(round)} / ${state.total*10} points`,'game-score'),el('p',`${state.hits} solved · ${round.questions.filter(q=>q.assisted).length} explored with explanations`),el('p','Pick a grade above, then play again for new questions.'),again);
  return;
 }
 const grade=curriculumForGrade(round.grade),current=round.questions[round.index],template=grade.questions.find(q=>q.id===current.templateId);
 if(!template){host.append(el('p','This saved question is no longer available. Start a new round above.'));return;}
 let lesson;try{lesson=createPractice(template,current.values);}catch{host.append(el('p','This saved question cannot be opened with the current library. Start a new round above.'));return;}
 const top=el('div',undefined,'game-progress');top.append(el('span',`${round.playerName} · Grade ${round.grade} · Question ${round.index+1} of ${round.questions.length}`),el('span',`${score(round)} points`));const progress=el('progress');progress.max=round.questions.length;progress.value=round.index;progress.setAttribute('aria-label','Questions completed');host.append(top,progress,renderStage(battleState(round),shot),el('h2',template.title));
 if(lesson.prompt)host.append(el('p',lesson.prompt,'practice-prompt'));
 if(lesson.formula){const formula=el('div',undefined,'math');katex.render(lesson.formula,formula,{displayMode:true,throwOnError:true,trust:false});host.append(formula);}if(lesson.visual)renderVisual(host,lesson.visual);
 const finished=current.correct||current.assisted,status=el('p',feedback||(current.correct?'Correct!':current.assisted?'Explore the explanation, then continue.':current.attempts?'Keep trying, or explore the explanation.':''),'game-feedback');status.setAttribute('role','status');
 if(!finished){
  const form=el('form',undefined,'game-answer'),label=el('label','Your answer'),input=el('input');input.name='answer';input.type='text';input.inputMode='text';input.maxLength=80;input.autocomplete='off';input.required=true;input.value=current.entry;input.setAttribute('aria-describedby','answer-format');label.append(input);const check=el('button','Check answer');check.type='submit';const format=el('p','Whole number, decimal, or fraction (for example, 3/4). Omit units.','game-format');format.id='answer-format';form.append(label,check);host.append(form,format);
  form.onsubmit=event=>{event.preventDefault();action(async()=>{const next=answerRound(round,template,input.value);await persist(next);pendingShot=next.questions[next.index].correct?'hit':'miss';feedback=next.questions[next.index].correct?'Direct hit! You can check the explanation or move on.':'Not quite, and Grumble steps closer. Try again, or use the explanation to learn the method.';});};
 }
 host.append(status);
 const controls=el('div',undefined,'controls'),explain=el('button',finished?'Show explanation':'Explore explanation');explain.type='button';controls.append(explain);
 const explanation=el('div',undefined,'game-explanation');explanation.hidden=!current.assisted;
 const showExplanation=()=>{explanation.hidden=false;dispose=mountPractice(explanation,template,current.values);dispose.showAll();explain.hidden=true;};
 explain.onclick=()=>action(async()=>{await persist(revealRound(round));pendingShot='miss';feedback=current.correct?'Correct! Review how the answer checks.':'This question is now a practice example. No points are deducted.';});
 if(finished){const next=el('button',round.index===round.questions.length-1?'Finish round':'Next question');next.type='button';next.onclick=()=>action(async()=>{await persist(advanceRound(round));feedback='';});controls.append(next);}
 host.append(controls,explanation);
 if(current.assisted)showExplanation();
 else if(current.correct)explain.onclick=()=>{showExplanation();};
}
$('#game-quit').onclick=()=>{if(busy)return;round=undefined;feedback='';renderRound();updateStart();markProfile();nameInput.focus();};
$('#game-setup').onsubmit=event=>{event.preventDefault();action(async()=>{
 const key=playerKey(nameInput.value),name=nameInput.value.trim().replace(/\s+/g,' '),grade=curriculumForGrade(gradeSelect.value);
 if(!memoryOnly)rounds=await listRounds();
 const previous=rounds.find(r=>r.profileId===key&&r.grade===grade.grade&&r.status==='active');
 const next=previous||{...makeRound(grade,'all'),profileId:key,playerName:name};
 await persist({...next,playerName:name});chooseProfile({id:key,name});selectedPlayer=key;feedback='';
});};
try{
 rounds=await listRounds();ready=true;renderProfiles();renderStats();$('#save-status').textContent='Saved on this device. Use the same name to continue.';$('#game-start').disabled=false;
}catch(error){
 $('#save-status').textContent='Local saving is unavailable: '+error.message;$('.info-tip').classList.add('is-warning');
 const play=el('button','Play without saving');play.type='button';play.onclick=()=>{memoryOnly=true;ready=true;$('#game-start').disabled=false;play.remove();savedLabel();};$('.info-tip').after(play);
}
