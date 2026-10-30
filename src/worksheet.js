import katex from 'katex';
import './worksheet.css';
import {topicOptions} from './game/model.js';
import {buildWorksheet,DEFAULT_COUNT,MAX_COUNT} from './worksheet-model.js';
import {renderVisual} from './curriculum/visuals.js';

import {setMathText} from './math-text.js';
const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
const math=(host,tex,display=true)=>{try{katex.render(tex,host,{displayMode:display,throwOnError:false,trust:false});}catch{host.textContent=tex;}return host;};
const looksLikeTex=text=>/[\\^_{}]/.test(text);

// Paper layout: questions first, then an answer sheet on a new page (with workings when asked).
export function renderSheet(sheet){
 const root=el('section',undefined,'print-sheet');root.setAttribute('aria-hidden','true');
 const head=el('header',undefined,'ws-head');
 head.append(el('h1',`Whack-a-Math · Grade ${sheet.grade} exercises`),el('p',sheet.topics.length?`Topics: ${sheet.topics.join(', ')}`:'Topics: all topics','ws-topics'),el('p','Name: ______________________    Date: ______________','ws-name'));
 const list=el('ol',undefined,'ws-questions');
 for(const q of sheet.questions){
  const item=el('li',undefined,'ws-question');item.value=q.number;
  if(q.prompt)item.append(setMathText(el('p',undefined,'ws-prompt'),q.prompt));
  if(q.formula)item.append(math(el('div',undefined,'ws-formula'),q.formula));
  if(q.visual){const figure=el('div',undefined,'ws-visual');renderVisual(figure,q.visual);item.append(figure);}
  item.append(el('p','Answer: ______________________','ws-answer-line'));list.append(item);
 }
 const answers=el('section',undefined,'ws-answers');answers.append(el('h1','Answers'));
 if(!sheet.workings){
  const grid=el('ol',undefined,'ws-answer-grid');
  for(const q of sheet.questions){const item=el('li');item.value=q.number;const value=el('span',undefined,'ws-answer-value');if(looksLikeTex(q.answer))math(value,q.answer,false);else value.textContent=q.answer;item.append(value);grid.append(item);}
  answers.append(grid);
 }else{
  for(const q of sheet.questions){
   const block=el('div',undefined,'ws-solution');block.append(el('h2',`${q.number}. ${q.title}`));
   if(q.prompt)block.append(setMathText(el('p',undefined,'ws-prompt'),q.prompt));if(q.formula)block.append(math(el('div',undefined,'ws-formula'),q.formula));
   for(const step of q.steps){
    const row=el('div',undefined,'ws-step');if(step.text)row.append(setMathText(el('p'),step.text));if(step.math)row.append(math(el('div',undefined,'ws-step-math'),step.math));
    if(step.visual){const figure=el('div',undefined,'ws-visual');renderVisual(figure,step.visual);row.append(figure);}block.append(row);
   }
   const final=el('p',undefined,'ws-final');final.append('Answer: ');const value=el('span',undefined,'ws-answer-value');if(looksLikeTex(q.answer))math(value,q.answer,false);else value.textContent=q.answer;final.append(value);block.append(final);answers.append(block);
  }
 }
 root.append(head,list,answers);return root;
}

// Print on a light theme with only the worksheet visible, then restore the page.
export function printSheet(sheet){
 const root=renderSheet(sheet),html=document.documentElement,theme=html.dataset.theme;
 const done=()=>{root.remove();if(theme)html.dataset.theme=theme;removeEventListener('afterprint',done);};
 document.body.append(root);html.dataset.theme='light';addEventListener('afterprint',done);
 requestAnimationFrame(()=>requestAnimationFrame(()=>{window.print();}));
 return done;
}

// Dialog: choose topics (any mix of strands and topics), how many questions, and whether the answer sheet shows workings.
export function openWorksheetDialog(grade){
 const options=topicOptions(grade),dialog=el('dialog',undefined,'worksheet-dialog');dialog.setAttribute('aria-labelledby','ws-title');
 let chosen=new Set();
 const form=el('form'),title=el('h2',`Exercise sheet · Grade ${grade.grade}`);title.id='ws-title';
 const intro=el('p','Make a printable sheet of exercises. Answers are always on the last page. Choose "Save as PDF" in the print window to keep a PDF copy.','ws-help');
 const list=el('div',undefined,'ws-topic-list'),summary=el('p',undefined,'ws-topic-summary');
 const kids=strand=>options.filter(o=>o.level==='topic'&&o.strand===strand.title);
 const selected=()=>{const ids=options.filter(o=>o.level==='topic').map(o=>o.id);return ids.length&&ids.every(id=>chosen.has(id))?[]:ids.filter(id=>chosen.has(id));};
 function renderList(){
  const picked=selected();list.replaceChildren();
  const row=(label,checked,onchange,cls)=>{const wrap=el('label',undefined,cls),input=document.createElement('input');input.type='checkbox';input.checked=checked;input.onchange=()=>onchange(input.checked);wrap.append(input,el('span',label));return {wrap,input};};
  list.append(row('All topics',!picked.length,on=>{if(on)chosen=new Set();renderList();},'ws-row ws-all').wrap);
  let group;
  for(const option of options){
   if(option.level==='strand'){
    const mine=el('div',undefined,'ws-group'),members=kids(option),full=members.every(k=>picked.includes(k.id)),some=members.some(k=>picked.includes(k.id));group=mine;list.append(mine);
    const head=row(option.title,Boolean(picked.length)&&full,on=>{if(!picked.length)chosen=new Set();for(const k of members)on?chosen.add(k.id):chosen.delete(k.id);renderList();},'ws-row ws-strand');head.input.indeterminate=Boolean(picked.length)&&some&&!full;mine.append(head.wrap);
   }else group.append(row(option.title,picked.includes(option.id),on=>{if(!picked.length)chosen=new Set();on?chosen.add(option.id):chosen.delete(option.id);renderList();},'ws-row ws-leaf').wrap);
  }
  summary.textContent=picked.length?`${picked.length} ${picked.length===1?'topic':'topics'} selected`:'All topics selected';
 }
 renderList();
 const countLabel=el('label',undefined,'ws-count'),count=document.createElement('input');count.type='number';count.min=1;count.max=MAX_COUNT;count.step=1;count.value=DEFAULT_COUNT;count.required=true;countLabel.append(el('span','Number of questions'),count);
 const workLabel=el('label',undefined,'ws-check'),work=document.createElement('input');work.type='checkbox';workLabel.append(work,el('span','Show workings on the answer sheet'));
 const error=el('p',undefined,'ws-error');error.setAttribute('role','alert');
 const cancel=el('button','Cancel');cancel.type='button';const make=el('button','Create PDF');make.type='submit';make.className='ws-primary';
 const actions=el('div',undefined,'ws-actions');actions.append(cancel,make);
 form.append(title,intro,el('h3','Topics'),list,summary,countLabel,workLabel,error,actions);dialog.append(form);document.body.append(dialog);
 const close=()=>{dialog.close();dialog.remove();};
 cancel.onclick=close;dialog.addEventListener('cancel',()=>dialog.remove());
 form.onsubmit=event=>{
  event.preventDefault();error.textContent='';
  try{const sheet=buildWorksheet(grade,{topics:selected(),count:count.value,workings:work.checked});dialog.close();dialog.remove();printSheet(sheet);}
  catch(failure){error.textContent=failure.message;}
 };
 dialog.showModal();return dialog;
}
