import 'katex/dist/katex.min.css';
import './style.css';
import './curriculum.css';
import './game.css';
import katex from 'katex';
import {catalog,curriculumForGrade} from './curriculum/catalog.js';
import {createPractice} from './curriculum/practice.js';
import {renderVisual} from './curriculum/visuals.js';
import {mountPractice} from './curriculum/practice-view.js';
import {playerKey,lastPlayed,makeRound,score,answerRound,revealRound,advanceRound,battleState} from './game/model.js';
import {listRounds,saveRound} from './game/storage.js';
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const app=document.querySelector('#app');
app.innerHTML='<main class="game-page"><nav><a href="./">← Demo</a> · <a href="./curriculum.html">Curriculum</a></nav><h1>Math quest</h1><p class="game-intro">Five questions. Take your time, try an answer, and explore the steps.</p><form id="game-setup"><label>Your name <input id="game-name" name="player" autocomplete="off" maxlength="40" required></label><label>Grade <select id="game-grade" aria-label="Game grade"></select></label><button type="submit" id="game-start" disabled>Play</button></form><p id="save-status" role="status">Opening local progress…</p><p id="game-error" role="alert"></p><div id="game-round"></div></main>';
const $=s=>document.querySelector(s),gradeSelect=$('#game-grade'),nameInput=$('#game-name');
let round,rounds=[],ready=false,memoryOnly=false,busy=false,dispose,feedback='',selectedPlayer='',event='';
const art=name=>`${import.meta.env.BASE_URL}game-art/${name}.svg`;
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
for(const g of catalog){const option=el('option',String(g.grade));option.value=g.grade;gradeSelect.append(option);}gradeSelect.value=curriculumForGrade(new URLSearchParams(location.search).get('grade')).grade;
// Captain Patty (left) fires ketchup at Grumble (right). Hearts show how many questions are still unsolved.
function renderStage(state,shot){
 const stage=el('div',undefined,'game-stage'),image=(name,cls)=>{const img=el('img',undefined,cls);img.src=art(name);img.alt='';img.setAttribute('aria-hidden','true');img.draggable=false;return img;};
 stage.style.setProperty('--misses',state.misses);if(state.done)stage.classList.add(state.won?'is-won':'is-lost');if(shot&&!reduceMotion())stage.classList.add(shot==='hit'?'shot-hit':'shot-miss');
 const hearts=el('div',undefined,'game-hearts');hearts.setAttribute('aria-hidden','true');for(let i=0;i<state.total;i++)hearts.append(el('span',i<state.hearts?'♥':'♡',i<state.hearts?'full':'empty'));
 stage.append(hearts,image('burger-hero','game-hero'),image('zombie','game-zombie'),image('ketchup-shot','game-shot'));
 const summary=el('p',state.done?(state.won?'Captain Patty wins! Grumble is covered in ketchup.':'Grumble got away this time. Try another round!'):`Grumble has ${state.hearts} ${state.hearts===1?'heart':'hearts'} left${state.misses?' and is getting closer':''}.`,'sr-only');summary.setAttribute('role','status');stage.append(summary);
 return stage;
}
function renderHistory(){
 const old=$('#game-history');old?.remove();let key;try{key=playerKey(nameInput.value);}catch{return;}
 const done=rounds.filter(r=>r.profileId===key&&r.status==='complete').slice(0,5);if(!done.length)return;
 const details=el('details',undefined,'game-history');details.id='game-history';details.append(el('summary',`Past rounds (${done.length})`));
 for(const r of done){const state=battleState(r),row=el('div',undefined,'game-history-row');row.append(el('span',`${new Date(r.updatedAt).toLocaleDateString('en-CA')} · Grade ${r.grade}`),el('span',`${score(r)} / ${state.total*10} points · ${state.won?'Won':'Practised'}`));details.append(row);}
 $('.game-page').append(details);
}
function updateStart(){
 let key;try{key=playerKey(nameInput.value);}catch{return;}
 $('#game-start').textContent=rounds.some(r=>r.profileId===key&&r.grade===Number(gradeSelect.value)&&r.status==='active')?'Continue':'Play';
}
nameInput.oninput=()=>{
 let key;try{key=playerKey(nameInput.value);}catch{key='';}
 if(key!==selectedPlayer){round=undefined;feedback='';selectedPlayer=key;renderRound();renderHistory();const previous=lastPlayed(rounds,key);if(previous)gradeSelect.value=previous.grade;}
 updateStart();
};
gradeSelect.onchange=updateStart;
function savedLabel(){ $('#save-status').textContent=memoryOnly?'Playing without saving. Progress will be lost when this page closes.':'Progress saved on this device. No account needed.'; }
async function persist(next){
 const saved=memoryOnly?{...next,updatedAt:Date.now()}:await saveRound(next);
 round=saved;rounds=[saved,...rounds.filter(r=>r.id!==saved.id)];savedLabel();updateStart();renderHistory();
}
async function action(work){if(busy)return;busy=true;$('#game-error').textContent='';document.querySelectorAll('#game-setup button,#game-round button,#game-round input').forEach(b=>b.disabled=true);try{await work();}catch(error){$('#game-error').textContent=error.message;}finally{busy=false;$('#game-start').disabled=!ready;renderRound();}}
function renderRound(){
 dispose?.();dispose=undefined;const host=$('#game-round'),shot=event;event='';host.replaceChildren();if(!round)return;
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
  form.onsubmit=event=>{event.preventDefault();action(async()=>{const next=answerRound(round,template,input.value);await persist(next);event=next.questions[next.index].correct?'hit':'miss';feedback=next.questions[next.index].correct?'Direct hit! You can check the explanation or move on.':'Not quite, and Grumble steps closer. Try again, or use the explanation to learn the method.';});};
 }
 host.append(status);
 const controls=el('div',undefined,'controls'),explain=el('button',finished?'Show explanation':'Explore explanation');explain.type='button';controls.append(explain);
 const explanation=el('div',undefined,'game-explanation');explanation.hidden=!current.assisted;
 const showExplanation=()=>{explanation.hidden=false;dispose=mountPractice(explanation,template,current.values);dispose.showAll();explain.hidden=true;};
 explain.onclick=()=>action(async()=>{await persist(revealRound(round));event='miss';feedback=current.correct?'Correct! Review how the answer checks.':'This question is now a practice example. No points are deducted.';});
 if(finished){const next=el('button',round.index===round.questions.length-1?'Finish round':'Next question');next.type='button';next.onclick=()=>action(async()=>{await persist(advanceRound(round));feedback='';});controls.append(next);}
 host.append(controls,explanation);
 if(current.assisted)showExplanation();
 else if(current.correct)explain.onclick=()=>{showExplanation();};
}
$('#game-setup').onsubmit=event=>{event.preventDefault();action(async()=>{
 const key=playerKey(nameInput.value),name=nameInput.value.trim().replace(/\s+/g,' '),grade=curriculumForGrade(gradeSelect.value);
 if(!memoryOnly)rounds=await listRounds();
 const previous=rounds.find(r=>r.profileId===key&&r.grade===grade.grade&&r.status==='active');
 const next=previous||{...makeRound(grade,'all'),profileId:key,playerName:name};
 await persist({...next,playerName:name});selectedPlayer=key;feedback='';
});};
try{
 rounds=await listRounds();ready=true;$('#save-status').textContent='Saved on this device. Use the same name to continue.';$('#game-start').disabled=false;
}catch(error){
 $('#save-status').textContent='Local saving is unavailable: '+error.message;
 const play=el('button','Play without saving');play.type='button';play.onclick=()=>{memoryOnly=true;ready=true;$('#game-start').disabled=false;play.remove();savedLabel();};$('#save-status').after(play);
}
