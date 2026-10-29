import katex from 'katex';
import 'katex/dist/katex.min.css';
import './style.css';
import {solve} from './solver.js';
import {renderEquation} from './equation-view.js';
import {longDivision} from './long-division.js';
import {longMultiplication} from './long-multiplication.js';
import {renderLongMultiplication} from './long-multiplication-view.js';
import {renderLongDivision} from './long-division-view.js';
import {log,mountDebug,placeDebug} from './debug.js';

const app=document.querySelector('#app');
app.innerHTML=`<main class="landing"><nav><a href="./curriculum.html">Grade 5 curriculum</a> · <a href="./skills.html">Math skills & captions</a></nav><div class="app-brand"><img src="/monkey-logo.png" width="64" height="64" alt="Baby monkey with number blocks"><span>Little Math Lab</span></div><h1>Demo</h1><div class="formula-choices" aria-label="Choose a formula"><button data-formula="2 + 3 × 4" aria-pressed="true"></button><button data-formula="1/2 + 2/3" aria-pressed="false"></button><button data-long-division="156 ÷ 12" aria-pressed="false">156 ÷ 12</button><button data-long-division="784 ÷ 7" aria-pressed="false">784 ÷ 7</button><button data-long-division="125 ÷ 4" aria-pressed="false">125 ÷ 4</button><button data-long-multiplication="23 × 14" aria-pressed="false">23 × 14</button><button data-long-multiplication="47 × 36" aria-pressed="false">47 × 36</button><button data-long-multiplication="105 × 20" aria-pressed="false">105 × 20</button><button data-formula="x + 5 = 12" aria-pressed="false"></button><button data-formula="3x = 18" aria-pressed="false"></button><button data-formula="2x + 3 = 11" aria-pressed="false"></button><button id="write-formula">✎ Write a formula</button></div><div class="solution-stage"><div id="formula-preview" aria-label="Selected formula"></div><p id="lesson-error" role="alert"></p><section id="lesson" aria-label="Solution"><div class="steps" role="log" aria-live="polite" aria-relevant="additions"></div><p class="caption" aria-live="polite"></p></section></div></main><dialog id="write-modal" aria-labelledby="write-title"><div class="modal-header"><h2 id="write-title">Write a formula</h2><button id="close-write" aria-label="Close handwriting">×</button></div><div id="write-content"></div></dialog>`;
const $=s=>document.querySelector(s);
mountDebug();
let formula='',steps=[],shown=0,timer,disposeWriting,modalGeneration=0,divisionLesson=null,multiplicationLesson=null,equationLesson=false;
const render=(tex,el)=>katex.render(tex,el,{displayMode:true,throwOnError:true,trust:false});
function stop(){clearInterval(timer);timer=null;}
function autoplay(){if(timer||shown>=steps.length)return;log('playback.start');timer=setInterval(reveal,2200);}
function reveal(){
 if(shown>=steps.length)return;
 const current=steps[shown];
 if(multiplicationLesson){
  renderLongMultiplication($('#lesson .steps'),multiplicationLesson,current);
  $('#lesson .caption').textContent=current.text;
  log('long-multiplication.step',{step:shown+1,total:steps.length,...current});shown++;
  if(shown===steps.length){stop();log('playback.complete',{answer:multiplicationLesson.answer});}
  return;
 }
 if(divisionLesson){
  renderLongDivision($('#lesson .steps'),divisionLesson,current);
  $('#lesson .caption').textContent=current.text;
  log('long-division.step',{step:shown+1,total:steps.length,...current});shown++;
  if(shown===steps.length){stop();log('playback.complete',{answer:divisionLesson.answer,remainder:divisionLesson.remainder});}
  return;
 }
 const row=document.createElement('div');row.className=equationLesson?'':'step';
 if(equationLesson)renderEquation(row,current.math);
 else for(const [name,tex] of [['equals',shown&&!equationLesson?'=':'\\phantom{=}'],['math',current.math]]){const cell=document.createElement('div');cell.className=name;render(tex,cell);row.append(cell);}
 $('#lesson .steps').append(row);$('#lesson .caption').textContent=current.text;
 log('lesson.step',{step:shown+1,total:steps.length,latex:current.math,caption:current.text});shown++;
 if(shown>1&&!matchMedia('(prefers-reduced-motion: reduce)').matches)row.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:350});
 if(shown===steps.length){row.classList.add('answer');stop();log('playback.complete');}
}
function selectFormula(input, useLongDivision=false, useLongMultiplication=false){
 stop();$('#formula-preview').classList.remove('equation-line');log('solver.start',{input});
 try{
  if(useLongMultiplication){
   const lesson=longMultiplication(...input.split('×').map(s=>s.trim()));
   divisionLesson=null;multiplicationLesson=lesson;formula=input;steps=lesson.steps;shown=0;
   render(`${lesson.left}\\times ${lesson.right}`,$('#formula-preview'));
   $('#lesson .steps').replaceChildren();$('#lesson .steps').classList.add('division-steps');
   $('#lesson-error').textContent='';$('#lesson').hidden=false;
   document.querySelectorAll('[data-formula],[data-long-division],[data-long-multiplication]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.longMultiplication===input)));
   log('long-multiplication.result',lesson);reveal();autoplay();return true;
  }
  if(useLongDivision){
   const lesson=longDivision(...input.split('÷').map(s=>s.trim()));
   stop();multiplicationLesson=null;divisionLesson=lesson;formula=input;steps=lesson.steps;shown=0;
   render(`${lesson.dividend}\\div ${lesson.divisor}`,$('#formula-preview'));
   $('#lesson .steps').replaceChildren();$('#lesson .steps').classList.add('division-steps');
   $('#lesson-error').textContent='';$('#lesson').hidden=false;
   document.querySelectorAll('[data-formula],[data-long-division],[data-long-multiplication]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.longDivision===input)));
   log('long-division.result',lesson);reveal();autoplay();return true;
  }
  const solution=solve(input);equationLesson=solution.kind==='equation';
  (equationLesson?renderEquation:(el,tex)=>render(tex,el))($('#formula-preview'),solution.methods[0].steps[0].math);
  divisionLesson=null;multiplicationLesson=null;$('#lesson .steps').classList.remove('division-steps');
  document.querySelectorAll('[data-long-division],[data-long-multiplication]').forEach(b=>b.setAttribute('aria-pressed','false'));
  formula=input;steps=solution.methods[0].steps;shown=1;
  $('#lesson .steps').replaceChildren();$('#lesson-error').textContent='';$('#lesson').hidden=false;
  document.querySelectorAll('[data-formula]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.formula===input)));
  $('#lesson .caption').textContent=steps[0].text;
  log('solver.result',{input,answer:solution.answer,methods:solution.methods});autoplay();return true;
 }catch(error){$('#lesson-error').textContent=error.message;log('solver.error',{input,message:error.message});return false;}
}
for(const button of document.querySelectorAll('[data-formula]')){render(solve(button.dataset.formula).methods[0].steps[0].math,button);button.onclick=()=>selectFormula(button.dataset.formula);}
for(const button of document.querySelectorAll('[data-long-division]'))button.onclick=()=>selectFormula(button.dataset.longDivision,true);
for(const button of document.querySelectorAll('[data-long-multiplication]'))button.onclick=()=>selectFormula(button.dataset.longMultiplication,false,true);
$('#close-write').onclick=()=>$('#write-modal').close();
$('#write-modal').addEventListener('close',()=>{modalGeneration++;disposeWriting?.();disposeWriting=null;$('#write-content').replaceChildren();placeDebug();log('modal.close');autoplay();});
$('#write-formula').onclick=async()=>{
 stop();const generation=++modalGeneration;$('#write-modal').showModal();placeDebug($('#write-modal'));$('#write-content').textContent='Loading…';log('modal.open');
 try{const {mountWriting}=await import('./write.js');if(!$('#write-modal').open||generation!==modalGeneration)return;
 disposeWriting=mountWriting($('#write-content'),{log,initialFormula:formula,onUse:latex=>{if(selectFormula(latex))$('#write-modal').close();else $('#write-content #error').textContent=$('#lesson-error').textContent;}});
 }catch(error){$('#write-content').textContent='Unable to open drawing. Try again.';log('modal.error',{message:error.message});}
};
selectFormula('2 + 3 × 4');
if(new URLSearchParams(location.search).has('write'))$('#write-formula').click();
window.addEventListener('pagehide',()=>{stop();disposeWriting?.();});
