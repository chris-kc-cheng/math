import {calculatorPlan,setCalculatorContext} from '../calculator/plans.js';
import {mountCalculatorTutorial} from '../calculator/view.js';
import {createPractice,nextValues,exampleValues} from './practice.js';
import {renderLongDivision} from '../views/long-division-view.js';
import {renderLongMultiplication} from '../views/long-multiplication-view.js';
import {renderEquation} from '../views/equation-view.js';
import {renderVisual} from './visuals.js';
import {mountBuilder} from './builders.js';
import {equalDecimal} from '../math/families/grade5/common.js';
import {answerNumber} from '../math/verification.js';
import {compare,rational,parseDecimal} from '../math/core/exact.js';
// Accepts "3", "2.5", "-4" and "3/4"; compares exactly with the worked answer.
function sameNumber(input,answer){
 const text=String(input).trim(),fraction=text.match(/^([+-]?\d{1,30})\s*\/\s*([+-]?\d{1,30})$/);
 try{
  if(fraction){if(BigInt(fraction[2])===0n)return false;return compare(rational(BigInt(fraction[1]),BigInt(fraction[2])),answerNumber(answer))===0;}
  return equalDecimal(text,answer)||compare(parseDecimal(text),answerNumber(answer))===0;
 }catch{return false;}
}
import {playbackSteps} from '../math/verification.js';
import {setPlaybackIcon} from './playback-controls.js';
import {setMathText} from '../ui/math-text.js';
import {el,reducedMotion,renderTex} from '../ui/dom.js';

const render=(formula,node)=>renderTex(formula,node);

export function mountPractice(container,template,initialValues=template.example){
 const card=el('section',null,'practice-card'),heading=el('h3',template.title),question=el('div',null,'practice-question math'),prompt=el('p',null,'practice-prompt'),questionVisual=el('div',null,'practice-question-visual'),tools=el('div'),toolbar=el('div',null,'practice-toolbar');
 card.dataset.questionId=template.id;
 const refresh=el('button','↻','practice-refresh');refresh.type='button';refresh.setAttribute('aria-label',`New question: ${template.title}`);refresh.title='New question';
 refresh.hidden=Boolean(template.generation?.every(domain=>Array.isArray(domain)&&domain.length===1));
 toolbar.append(heading,refresh);
 const output=el('div',null,'practice-work'),caption=el('p',null,'practice-caption'),controls=el('div',null,'controls');
 output.setAttribute('role','log');output.setAttribute('aria-label',`Steps: ${template.title}`);caption.setAttribute('aria-live','polite');
 const next=el('button'),play=el('button'),all=el('button');next.type=play.type=all.type='button';controls.append(next,play,all);controls.setAttribute('role','group');controls.setAttribute('aria-label','Solution playback');setPlaybackIcon(next,'next','Next step');setPlaybackIcon(play,'play','Play');setPlaybackIcon(all,'all','Show all steps');card.append(toolbar,prompt,question,questionVisual,tools,output,caption,controls);container.append(card);
 let values=exampleValues(template,initialValues),lesson,timeline,index=1,timer,plan,tutorialDispose;
 const activateCalculator=()=>setCalculatorContext(plan);card.addEventListener('pointerdown',activateCalculator);card.addEventListener('focusin',activateCalculator);
 function stop(){clearInterval(timer);timer=undefined;setPlaybackIcon(play,'play','Play');}
 function reset(){
  stop();tutorialDispose?.();tutorialDispose=undefined;lesson=createPractice(template,values);
  plan=calculatorPlan({template,lesson,force:template.calculatorDemo});setCalculatorContext(plan,{onlyIfEmpty:true});timeline=playbackSteps(lesson);index=1;output.replaceChildren();question.replaceChildren();questionVisual.replaceChildren();tools.replaceChildren();
  setMathText(prompt,lesson.prompt||'');prompt.hidden=!lesson.prompt;question.hidden=!lesson.formula;if(lesson.formula)render(lesson.formula,question);if(template.demoVisual||lesson.visual)renderVisual(questionVisual,template.demoVisual||lesson.visual);
  if(lesson.reflection){
   const label=el('label','Your thinking'),input=el('textarea');input.rows=3;input.maxLength=2000;label.append(input);tools.append(label,el('p','There is no automatic score for a personal reflection.','curriculum-note'));
  }else if(lesson.response){
   const attempt=el('details',null,'practice-attempt'),summary=el('summary','Try an answer'),form=el('form'),label=el('label',lesson.response.kind==='number'?'Your answer (number or fraction like 3/4)':'Your choice'),status=el('p');status.setAttribute('role','status');let input;
   if(lesson.response.kind==='choice'){input=el('select');for(const value of lesson.response.options){const option=el('option',value);option.value=value;input.append(option);}}
   else {input=el('input');input.inputMode='text';input.maxLength=45;input.required=true;}
   label.append(input);const check=el('button','Check');check.type='submit';form.append(label,check);attempt.append(summary,form,status);tools.append(attempt);
   form.onsubmit=event=>{event.preventDefault();const correct=lesson.response.kind==='number'?sameNumber(input.value,lesson.response.answer):input.value===lesson.response.answer;status.textContent=correct?'That matches. Use the worked steps to explain why.':'Try again, or use the worked steps for a hint.';};
  }
  mountBuilder(tools,lesson.builder);
  caption.textContent='';controls.hidden=false;next.disabled=play.disabled=all.disabled=false;
 }
 function step(animate=true){
  if(index>=timeline.length)return;
  const current=timeline[index++];
  if(current.stage==='verification'){
   let check=output.querySelector('.verification-stage');if(!check){check=el('div',null,'verification-stage');check.append(el('h4','Check the answer'));output.append(check);}
   if(current.math){const row=el('div',null,`worked-step${current.valid===false?' verification-failed':''}`),math=el('div',null,'math');render(current.math,math);row.append(math);check.append(row);if(current.valid===true)row.classList.add('answer');}
  }
  else if(lesson.kind==='long-multiply')renderLongMultiplication(output,lesson.lesson,current);
  else if(lesson.kind==='long-divide')renderLongDivision(output,lesson.lesson,current);
  else if(lesson.kind==='worked'){
   const row=el('div',null,'worked-step');if(current.math){const math=el('div',null,'math');render(current.math,math);row.append(math);}if(current.visual&&!(template.demoVisual?.type==='right-triangle'&&current.visual.type==='polygon'))renderVisual(row,current.visual);if(row.childNodes.length){output.append(row);if(index===timeline.length)row.classList.add('answer');}
  }
  else {
   const row=el('div',null,lesson.kind==='equation'?'':'step');
   if(lesson.kind==='equation')renderEquation(row,current.math);
   else {const equals=el('div',null,'equals'),math=el('div',null,'math');render('=',equals);render(current.math,math);row.append(equals,math);}
   output.append(row);
   if(index===timeline.length&&lesson.kind!=='equation'||lesson.kind==='equation'&&/^x\s*=/.test(current.math))row.classList.add('answer');
   if(animate&&!reducedMotion())row.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:250});
  }
  setMathText(caption,current.text||'');next.disabled=play.disabled=all.disabled=index>=timeline.length;
  if(next.disabled){stop();controls.hidden=true;if(!tutorialDispose)tutorialDispose=mountCalculatorTutorial(output,plan);}
 }
 next.onclick=()=>{stop();step();};
 play.onclick=()=>{if(timer){stop();return;}step();if(index<timeline.length){setPlaybackIcon(play,'pause','Pause');timer=setInterval(step,2000);}};
 const showAll=()=>{stop();while(index<timeline.length)step(false);};
 all.onclick=showAll;
 refresh.onclick=()=>{try{values=nextValues(template,values);reset();activateCalculator();}catch(error){caption.textContent=error.message;}};
 reset();const dispose=()=>{stop();tutorialDispose?.();};dispose.showAll=showAll;dispose.next=()=>{stop();step();};dispose.playCalculatorKeys=(auto=true)=>{if(!tutorialDispose?.play||tutorialDispose.complete?.())return false;tutorialDispose.play(auto);return true;};dispose.pauseCalculatorKeys=()=>tutorialDispose?.pause?.();Object.defineProperty(dispose,'remaining',{get:()=>Math.max(0,timeline.length-index)});return dispose;
}
