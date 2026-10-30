import './curriculum.css';
import {mountCalculatorTutorial} from './calculator/view.js';
import {visualExamples} from './demo/examples.js';
import {mountPractice} from './curriculum/practice-view.js';
import {calculatorPlan,setCalculatorContext,clearCalculatorContext} from './calculator/plans.js';
import katex from 'katex';
import {pageNav} from './nav.js';
import 'katex/dist/katex.min.css';
import './style.css';
import {solve} from './math/arithmetic.js';
import {renderEquation} from './equation-view.js';
import {longDivision} from './math/long-division.js';
import {longMultiplication} from './math/long-multiplication.js';
import {renderLongMultiplication} from './long-multiplication-view.js';
import {renderLongDivision} from './long-division-view.js';
import {log} from './debug.js';
import {setPlaybackIcon} from './curriculum/playback-controls.js';

const app=document.querySelector('#app');
app.innerHTML=`<main class="landing">${pageNav('demo')}<div class="app-brand"><img src="${import.meta.env.BASE_URL}mole-logo.png" width="64" height="64" alt="Waving mole mascot"><span>Whack-a-Math</span></div><section class="slide-card" aria-roledescription="carousel" aria-label="Worked examples"><header class="slide-head"><span id="slide-topic" class="slide-topic"></span><span id="slide-count" class="slide-count"></span></header><div class="solution-stage"><div id="activity-demo" hidden></div><div id="formula-preview" aria-label="Selected formula"></div><p id="lesson-error" role="alert"></p><section id="lesson" aria-label="Solution"><div class="steps" role="log" aria-live="polite" aria-relevant="additions"></div><p class="caption" aria-live="polite"></p></section></div><div class="slide-progress" aria-hidden="true"><span id="slide-progress"></span></div><div class="slide-controls" role="group" aria-label="Slide show controls"><button id="slide-prev" type="button"></button><button id="slide-play" type="button"></button><button id="slide-step" type="button"></button><button id="slide-next" type="button"></button></div><div id="slide-dots" class="slide-dots" role="tablist" aria-label="Choose an example"></div></section><form id="own-formula" class="own-formula"><label for="formula-input">Try your own formula</label><div><input id="formula-input" autocomplete="off" spellcheck="false" placeholder="e.g. 3 × 7 + 2 or x + 4 = 9"><button type="submit">Solve</button><button id="write-formula" type="button" class="draw-button"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4.5l4.5 4.5L9.5 19H5v-4.5z"/><path d="M12.5 7l4.5 4.5"/><path d="M5 19c-1.3 0-2-.7-2-1.6 0-.9 2-2.4 2-2.4" class="ink" /><path d="M4.5 3v3.5M2.75 4.75h3.5" class="ink spark"/></svg> Draw</button></div></form></main><dialog id="write-modal" aria-labelledby="write-title"><div class="modal-header"><h2 id="write-title">Draw a formula</h2><button id="close-write" aria-label="Close handwriting">×</button></div><div id="write-content"></div></dialog>`;
const $=s=>document.querySelector(s);
let formula='',steps=[],shown=0,timer,disposeWriting,modalGeneration=0,divisionLesson=null,multiplicationLesson=null,equationLesson=false,activityView,formulaCalculatorPlan,formulaTutorialDispose;
const render=(tex,el)=>katex.render(tex,el,{displayMode:true,throwOnError:true,trust:false});
// One example per kind of math; the slide show cycles through them and the learner can pause to type or draw their own.
const slides=[
 {topic:'Order of operations',input:'2 + 3 × 4'},
 {topic:'Fractions',input:'1/2 + 2/3'},
 {topic:'Long division',input:'156 ÷ 12',division:true},
 {topic:'Long multiplication',input:'23 × 14',multiplication:true},
 {topic:'Equations',input:'2x + 3 = 11'},
 ...visualExamples
];
const STEP_MS=1700,HOLD_MS=2600,reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let slideIndex=0,playing=!reduceMotion,advance;
function stop(){clearInterval(timer);timer=null;clearTimeout(advance);advance=null;$('#slide-progress').style.transition='none';$('#slide-progress').style.width='0';}
function autoplay(){
 if(!playing)return;
 if(shown<steps.length){if(!timer){log('playback.start');timer=setInterval(reveal,STEP_MS);}return;}
 if(activityView?.playCalculatorKeys?.(true))return;if(formulaTutorialDispose?.play&&!formulaTutorialDispose.complete?.()){formulaTutorialDispose.play(true);return;}holdThenAdvance();
}
function holdThenAdvance(){
 if(!playing||advance)return;
 const bar=$('#slide-progress');bar.style.transition='none';bar.style.width='0';void bar.offsetWidth;bar.style.transition=`width ${HOLD_MS}ms linear`;bar.style.width='100%';
 advance=setTimeout(()=>{advance=null;goTo(slideIndex+1);},HOLD_MS);
}
function finish(){
 clearInterval(timer);timer=null;
 if(!activityView&&formulaCalculatorPlan?.recommended){if(!formulaTutorialDispose)formulaTutorialDispose=mountCalculatorTutorial($('#lesson .steps'),formulaCalculatorPlan);if(playing&&!formulaTutorialDispose.complete?.())formulaTutorialDispose.play?.(true);else if(playing)holdThenAdvance();return;}
 if(playing&&activityView?.playCalculatorKeys?.(true)){return;}holdThenAdvance();
}
function pause(){playing=false;stop();formulaTutorialDispose?.pause?.();activityView?.pauseCalculatorKeys?.();syncControls();}
document.addEventListener('calculator-interaction',()=>pause());
app.addEventListener('calculator-tutorial-start',()=>pause());
app.addEventListener('calculator-tutorial-complete',()=>holdThenAdvance());
function play(){playing=true;syncControls();autoplay();}
function syncControls(){
 setPlaybackIcon($('#slide-play'),playing?'pause':'play',playing?'Pause slide show':'Play slide show');
 $('#slide-play').setAttribute('aria-pressed',String(playing));
 $('#slide-step').disabled=playing||shown>=steps.length;
}
function goTo(index){
 const n=slides.length;slideIndex=((index%n)+n)%n;const slide=slides[slideIndex];
 if(slide.template)selectActivity(slide.template);else selectFormula(slide.input,Boolean(slide.division),Boolean(slide.multiplication));showSlide();
}
function showSlide(){
 const slide=slides[slideIndex];
 $('#slide-topic').textContent=slide?.topic??'Your formula';$('#slide-count').textContent=slide?`${slideIndex+1} / ${slides.length}`:'';
 document.querySelectorAll('#slide-dots button').forEach((dot,i)=>{const on=Boolean(slide)&&i===slideIndex;dot.setAttribute('aria-selected',String(on));dot.tabIndex=on?0:-1;});
 syncControls();
}
function reveal(){
 if(shown>=steps.length)return;
 if(activityView){activityView.next();shown++;if(!activityView.remaining)finish();return;}
 const current=steps[shown];
 if(multiplicationLesson){
  renderLongMultiplication($('#lesson .steps'),multiplicationLesson,current);
  $('#lesson .caption').textContent=current.text;
  log('long-multiplication.step',{step:shown+1,total:steps.length,...current});shown++;
  if(shown===steps.length){finish();log('playback.complete',{answer:multiplicationLesson.answer});}
  return;
 }
 if(divisionLesson){
  renderLongDivision($('#lesson .steps'),divisionLesson,current);
  $('#lesson .caption').textContent=current.text;
  log('long-division.step',{step:shown+1,total:steps.length,...current});shown++;
  if(shown===steps.length){finish();log('playback.complete',{answer:divisionLesson.answer,remainder:divisionLesson.remainder});}
  return;
 }
 const row=document.createElement('div');row.className=equationLesson?'':'step';
 if(equationLesson)renderEquation(row,current.math);
 else for(const [name,tex] of [['equals',shown&&!equationLesson?'=':'\\phantom{=}'],['math',current.math]]){const cell=document.createElement('div');cell.className=name;render(tex,cell);row.append(cell);}
 $('#lesson .steps').append(row);$('#lesson .caption').textContent=current.text;
 log('lesson.step',{step:shown+1,total:steps.length,latex:current.math,caption:current.text});shown++;
 if(shown>1&&!matchMedia('(prefers-reduced-motion: reduce)').matches)row.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:350});
 if(shown===steps.length){row.classList.add('answer');finish();log('playback.complete');}
}
function selectActivity(template){
 stop();activityView?.();formulaTutorialDispose?.();formulaTutorialDispose=null;formulaCalculatorPlan=null;clearCalculatorContext();divisionLesson=multiplicationLesson=null;equationLesson=false;formula='';
 const host=$('#activity-demo');host.replaceChildren();host.hidden=false;$('#formula-preview').hidden=true;$('#lesson').hidden=true;$('#lesson-error').textContent='';document.querySelector('.slide-card').classList.remove('fraction-example');document.querySelector('.slide-card').classList.add('visual-example');
 activityView=mountPractice(host,template);steps=Array(activityView.remaining).fill(null);shown=0;autoplay();
}
function selectFormula(input, useLongDivision=false, useLongMultiplication=false){
 activityView?.();activityView=null;formulaTutorialDispose?.();formulaTutorialDispose=null;$('#activity-demo').hidden=true;$('#activity-demo').replaceChildren();$('#formula-preview').hidden=false;document.querySelector('.slide-card').classList.remove('visual-example');formulaCalculatorPlan=calculatorPlan({template:{title:slides[slideIndex]?.topic||'Your formula'},input,force:/\d\s*\/\s*\d|\\frac/.test(input)});setCalculatorContext(formulaCalculatorPlan);
 document.querySelector('.slide-card').classList.remove('fraction-example');
 stop();$('#formula-preview').classList.remove('equation-line');log('solver.start',{input});
 try{
  if(useLongMultiplication){
   const lesson=longMultiplication(...input.split('×').map(s=>s.trim()));
   divisionLesson=null;multiplicationLesson=lesson;formula=input;steps=lesson.steps;shown=0;
   render(`${lesson.left}\\times ${lesson.right}`,$('#formula-preview'));
   $('#lesson .steps').replaceChildren();$('#lesson .steps').classList.add('division-steps');
   $('#lesson-error').textContent='';$('#lesson').hidden=false;
      log('long-multiplication.result',lesson);reveal();autoplay();return true;
  }
  if(useLongDivision){
   const lesson=longDivision(...input.split('÷').map(s=>s.trim()));
   stop();multiplicationLesson=null;divisionLesson=lesson;formula=input;steps=lesson.steps;shown=0;
   render(`${lesson.dividend}\\div ${lesson.divisor}`,$('#formula-preview'));
   $('#lesson .steps').replaceChildren();$('#lesson .steps').classList.add('division-steps');
   $('#lesson-error').textContent='';$('#lesson').hidden=false;
      log('long-division.result',lesson);reveal();autoplay();return true;
  }
  const solution=solve(input);equationLesson=solution.kind==='equation';
  document.querySelector('.slide-card').classList.toggle('fraction-example',solution.methods[0].steps.some(step=>step.math?.includes('\\frac')));
  (equationLesson?renderEquation:(el,tex)=>render(tex,el))($('#formula-preview'),solution.methods[0].steps[0].math);
  divisionLesson=null;multiplicationLesson=null;$('#lesson .steps').classList.remove('division-steps');
    formula=input;steps=solution.methods[0].steps;shown=1;
  $('#lesson .steps').replaceChildren();$('#lesson-error').textContent='';$('#lesson').hidden=false;
    $('#lesson .caption').textContent=steps[0].text;
  log('solver.result',{input,answer:solution.answer,methods:solution.methods});autoplay();return true;
 }catch(error){$('#lesson-error').textContent=error.message;log('solver.error',{input,message:error.message});return false;}
}
slides.forEach((slide,i)=>{
 const dot=document.createElement('button');dot.type='button';dot.setAttribute('role','tab');dot.setAttribute('aria-label',`${i+1}. ${slide.topic}`);dot.title=slide.topic;
 dot.onclick=()=>goTo(i);$('#slide-dots').append(dot);
});
setPlaybackIcon($('#slide-prev'),'prev','Previous example');setPlaybackIcon($('#slide-step'),'next','Show next step');setPlaybackIcon($('#slide-next'),'all','Next example');
$('#slide-prev').onclick=()=>goTo(slideIndex-1);$('#slide-next').onclick=()=>goTo(slideIndex+1);
$('#slide-play').onclick=()=>playing?pause():play();
$('#slide-step').onclick=()=>{reveal();syncControls();};
// Typed formulas: whole numbers of two or more digits with ÷ or × use the long-form lessons; anything else goes to the exact solver.
function solveOwn(text){
 const long=text.trim().replace(/\*/g,'×').match(/^(\d{2,})\s*([÷×])\s*(\d{2,})$/);
 if(long&&selectFormula(`${long[1]} ${long[2]} ${long[3]}`,long[2]==='÷',long[2]==='×'))return true;
 return selectFormula(text.trim());
}
$('#own-formula').onsubmit=event=>{event.preventDefault();const text=$('#formula-input').value;if(!text.trim())return;pause();slideIndex=-1;if(!solveOwn(text)){showSlide();return;}showSlide();};
$('#formula-input').addEventListener('focus',()=>{if(playing)pause();});
$('#close-write').onclick=()=>$('#write-modal').close();
$('#write-modal').addEventListener('close',()=>{modalGeneration++;disposeWriting?.();disposeWriting=null;$('#write-content').replaceChildren();log('modal.close');});
$('#write-formula').onclick=async()=>{
 pause();const generation=++modalGeneration;$('#write-modal').showModal();$('#write-content').textContent='Loading…';log('modal.open');
 try{const {mountWriting}=await import('./write.js');if(!$('#write-modal').open||generation!==modalGeneration)return;
 disposeWriting=mountWriting($('#write-content'),{log,initialFormula:formula,onUse:latex=>{slideIndex=-1;if(selectFormula(latex)){showSlide();$('#write-modal').close();}else $('#write-content #error').textContent=$('#lesson-error').textContent;}});
 }catch(error){$('#write-content').textContent='Unable to open drawing. Try again.';log('modal.error',{message:error.message});}
};
goTo((Number(new URLSearchParams(location.search).get('slide'))||1)-1);
if(new URLSearchParams(location.search).has('write'))$('#write-formula').click();
window.addEventListener('pagehide',()=>{stop();activityView?.();formulaTutorialDispose?.();disposeWriting?.();});
