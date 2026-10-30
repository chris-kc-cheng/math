import katex from 'katex';
import {createPractice,nextValues,exampleValues} from './practice.js';
import {renderLongDivision} from '../long-division-view.js';
import {renderLongMultiplication} from '../long-multiplication-view.js';
import {renderEquation} from '../equation-view.js';
import {renderVisual} from './visuals.js';
import {mountBuilder} from './builders.js';
import {equalDecimal} from '../math/grade5/common.js';
import {playbackSteps} from '../math/verification.js';
import {setPlaybackIcon} from './playback-controls.js';

const el=(tag,text,className)=>{const node=document.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;};
const render=(formula,node)=>katex.render(formula,node,{displayMode:true,throwOnError:true,trust:false});

export function mountPractice(container,template,initialValues=template.example){
 const card=el('section',null,'practice-card'),heading=el('h3',template.title),question=el('div',null,'practice-question math'),prompt=el('p',null,'practice-prompt'),questionVisual=el('div'),tools=el('div'),toolbar=el('div',null,'practice-toolbar');
 card.dataset.questionId=template.id;
 const refresh=el('button','↻','practice-refresh');refresh.type='button';refresh.setAttribute('aria-label',`New question: ${template.title}`);refresh.title='New question';
 refresh.hidden=Boolean(template.generation?.every(domain=>Array.isArray(domain)&&domain.length===1));
 toolbar.append(heading,refresh);
 const output=el('div',null,'practice-work'),caption=el('p',null,'practice-caption'),controls=el('div',null,'controls');
 output.setAttribute('role','log');output.setAttribute('aria-label',`Steps: ${template.title}`);caption.setAttribute('aria-live','polite');
 const next=el('button'),play=el('button'),all=el('button');next.type=play.type=all.type='button';controls.append(next,play,all);controls.setAttribute('role','group');controls.setAttribute('aria-label','Solution playback');setPlaybackIcon(next,'next','Next step');setPlaybackIcon(play,'play','Play');setPlaybackIcon(all,'all','Show all steps');card.append(toolbar,prompt,question,questionVisual,tools,output,caption,controls);container.append(card);
 let values=exampleValues(template,initialValues),lesson,timeline,index=1,timer;
 function stop(){clearInterval(timer);timer=undefined;setPlaybackIcon(play,'play','Play');}
 function reset(){
  stop();lesson=createPractice(template,values);timeline=playbackSteps(lesson);index=1;output.replaceChildren();question.replaceChildren();questionVisual.replaceChildren();tools.replaceChildren();
  prompt.textContent=lesson.prompt||'';prompt.hidden=!lesson.prompt;question.hidden=!lesson.formula;if(lesson.formula)render(lesson.formula,question);if(lesson.visual)renderVisual(questionVisual,lesson.visual);
  if(lesson.reflection){
   const label=el('label','Your thinking'),input=el('textarea');input.rows=3;input.maxLength=2000;label.append(input);tools.append(label,el('p','There is no automatic score for a personal reflection.','curriculum-note'));
  }else if(lesson.response){
   const attempt=el('details',null,'practice-attempt'),summary=el('summary','Try an answer'),form=el('form'),label=el('label',lesson.response.kind==='number'?'Your answer (decimal or whole number)':'Your choice'),status=el('p');status.setAttribute('role','status');let input;
   if(lesson.response.kind==='choice'){input=el('select');for(const value of lesson.response.options){const option=el('option',value);option.value=value;input.append(option);}}
   else {input=el('input');input.inputMode='decimal';input.maxLength=45;input.required=true;}
   label.append(input);const check=el('button','Check');check.type='submit';form.append(label,check);attempt.append(summary,form,status);tools.append(attempt);
   form.onsubmit=event=>{event.preventDefault();const correct=lesson.response.kind==='number'?equalDecimal(input.value,lesson.response.answer):input.value===lesson.response.answer;status.textContent=correct?'That matches. Use the worked steps to explain why.':'Try again, or use the worked steps for a hint.';};
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
   const row=el('div',null,'worked-step');if(current.math){const math=el('div',null,'math');render(current.math,math);row.append(math);}if(current.visual)renderVisual(row,current.visual);if(row.childNodes.length){output.append(row);if(index===timeline.length)row.classList.add('answer');}
  }
  else {
   const row=el('div',null,lesson.kind==='equation'?'':'step');
   if(lesson.kind==='equation')renderEquation(row,current.math);
   else {const equals=el('div',null,'equals'),math=el('div',null,'math');render('=',equals);render(current.math,math);row.append(equals,math);}
   output.append(row);
   if(index===timeline.length&&lesson.kind!=='equation'||lesson.kind==='equation'&&/^x\s*=/.test(current.math))row.classList.add('answer');
   if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)row.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:250});
  }
  caption.textContent=current.text;next.disabled=play.disabled=all.disabled=index>=timeline.length;
  if(next.disabled){stop();controls.hidden=true;}
 }
 next.onclick=()=>{stop();step();};
 play.onclick=()=>{if(timer){stop();return;}step();if(index<timeline.length){setPlaybackIcon(play,'pause','Pause');timer=setInterval(step,2000);}};
 const showAll=()=>{stop();while(index<timeline.length)step(false);};
 all.onclick=showAll;
 refresh.onclick=()=>{try{values=nextValues(template,values);reset();}catch(error){caption.textContent=error.message;}};
 reset();stop.showAll=showAll;return stop;
}
