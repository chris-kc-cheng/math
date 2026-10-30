import './calculator.css';
import {createCalculator,press,entryText,display} from './engine.js';
import {currentCalculatorContext,subscribeCalculator,keyLabel,keyCategory,setCalculatorContext} from './plans.js';
import {setPlaybackIcon} from '../curriculum/playback-controls.js';

const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
const icon='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 10h2m4 0h2M8 14h2m4 0h2M8 18h2m4 0h2"/></svg>';
let ui;
const segmentPaths={a:'4,1 20,1 17,4 7,4',b:'21,2 21,20 18,18 18,6',c:'21,24 21,42 18,38 18,26',d:'4,43 20,43 17,40 7,40',e:'2,24 5,26 5,38 2,42',f:'2,2 5,6 5,18 2,20',g:'4,22 7,20 17,20 20,22 17,24 7,24'};
const segments={'0':'abcdef','1':'bc','2':'abdeg','3':'abcdg','4':'bcfg','5':'acdfg','6':'acdefg','7':'abc','8':'abcdefg','9':'abcdfg',E:'adefg','-':'g'};
function led(text){
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`0 0 ${Math.max(1,text.length)*26} 46`);svg.setAttribute('aria-hidden','true');
 for(const [i,c] of [...text].entries()){
  const group=document.createElementNS(ns,'g');group.setAttribute('transform',`translate(${i*26},0)`);
  if(c==='.'||c==='/'){const mark=document.createElementNS(ns,c==='.'?'circle':'path');if(c==='.'){mark.setAttribute('cx','5');mark.setAttribute('cy','41');mark.setAttribute('r','2');}else{mark.setAttribute('d','M5 42L20 2');mark.setAttribute('stroke','currentColor');mark.setAttribute('stroke-width','2');}mark.setAttribute('class','led-on');group.append(mark);}
  else for(const [name,points] of Object.entries(segmentPaths)){const p=document.createElementNS(ns,'polygon');p.setAttribute('points',points);p.setAttribute('class',(segments[c]||'').includes(name)?'led-on':'led-off');group.append(p);}
  svg.append(group);
 }return svg;
}
export function mountCalculator(){
 if(ui||typeof document==='undefined')return ui;
 let state=createCalculator(),context=currentCalculatorContext(),open=false,hiddenFor='',tutorialIndex=-1,tutorialId='';
 const toggle=el('button',undefined,'calculator-toggle');toggle.type='button';toggle.id='calculator-toggle';toggle.innerHTML=icon;toggle.setAttribute('aria-controls','calculator-panel');
 const panel=el('aside',undefined,'calculator-panel');panel.id='calculator-panel';panel.hidden=true;panel.tabIndex=-1;panel.setAttribute('aria-label','36X Pro calculator');
 const header=el('div',undefined,'calculator-header'),title=el('strong','36X Pro'),close=el('button','×','calculator-close');close.type='button';close.setAttribute('aria-label','Hide calculator');header.append(title,close);
 const topic=el('p',context.title,'calculator-topic'),screen=el('div',undefined,'calculator-screen'),flags=el('div',undefined,'calculator-flags'),entry=el('div',undefined,'calculator-entry'),digits=el('div',undefined,'calculator-digits'),spoken=el('span',undefined,'sr-only'),error=el('p',undefined,'calculator-error'),keypad=el('div',undefined,'calculator-keypad'),trace=el('p',undefined,'calculator-trace');
 spoken.setAttribute('role','status');spoken.setAttribute('aria-live','polite');error.setAttribute('role','alert');entry.setAttribute('aria-label','Calculator entry');screen.append(flags,entry,digits,spoken);panel.append(header,topic,screen,error,keypad,trace);document.body.append(toggle,panel);
 const setOpen=(value,focus=true)=>{open=value;panel.hidden=!open;document.body.classList.toggle('calculator-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Hide calculator':'Show calculator');toggle.title=open?'Hide calculator':'Show calculator';if(focus)(open?panel:toggle).focus();};
 const apply=(key,highlight=false)=>{document.dispatchEvent(new CustomEvent('calculator-interaction'));tutorialId='';tutorialIndex=-1;state=press(state,key);render(highlight?key:'');};
 const keyButton=(key,secondary='')=>{const button=el('button',undefined,'calculator-key');button.type='button';button.dataset.key=key;button.dataset.category=keyCategory(key);if(key==='2nd')button.setAttribute('aria-pressed',String(state.second));button.setAttribute('aria-label',({square:'Square',fraction:'Fraction',neg:'Negative',toggle:'Toggle fraction and decimal',right:'Move right',down:'Move down',left:'Move left','*':'Multiply','/':'Divide',enter:'Enter'}[key]||key));if(secondary)button.append(el('small',secondary,'calculator-secondary'));button.append(el('span',keyLabel(key)));button.onclick=()=>apply(key);return button;};
 function render(highlight=''){
  const focused=document.activeElement?.closest?.('#calculator-panel [data-key]')?.dataset.key;
  const value=display(state);topic.textContent=context.title;flags.textContent=[state.second?'2ND':'',state.modeMenu?`MODE · ${state.modeMenu.row?'NORM  '+(state.modeMenu.column?'[SCI]':'SCI'):(state.modeMenu.column?'DEG [RAD]':'[DEG] RAD')+' · ↓ number format'}`:state.menu?'MATH · 1: n/d ↔ U n/d':`${state.format.toUpperCase()}${state.notation==='SCI'?' SCI':''}`,['sin','cos','tan'].some(k=>context.features.includes(k)||state.keys.includes(k))?state.angle:'',value.approximate?'≈':''].filter(Boolean).join('  ');entry.textContent=entryText(state);entry.scrollLeft=entry.scrollWidth;digits.replaceChildren(led(value.text));spoken.textContent=state.error||`Calculator: ${value.approximate?'approximately ':''}${value.text}`;error.textContent=state.error;trace.textContent=state.keys.map(keyLabel).join(' ');
  const features=new Set([...context.features,...state.keys]),fraction=features.has('fraction')||features.has('mixed'),second=fraction||features.has('square')||features.has('percent')||features.has('2nd');keypad.replaceChildren();
  const functions=el('div',undefined,'calculator-functions');
  if(second)functions.append(keyButton('2nd'));if(features.has('mixed'))functions.append(keyButton('math'));functions.append(keyButton('delete'),keyButton('clear'));
  
  if(features.has('EE'))functions.append(keyButton('EE'));if(features.has('mode'))functions.append(keyButton('mode'));
  if(features.has('π'))functions.append(keyButton('π'));
  for(const k of ['sin','cos','tan'])if(features.has(k))functions.append(keyButton(k));
  if(features.has('^'))functions.append(keyButton('^'));
  if(features.has('square')||features.has('sqrt'))functions.append(keyButton('square','√'));
  if(fraction)functions.append(keyButton('fraction','1/x'));
  if(features.has('(')||features.has(')'))functions.append(keyButton('('),keyButton(')'));
  if(features.has('*'))functions.append(keyButton('*'));
  if(features.has('/')||features.has('percent'))functions.append(keyButton('/',features.has('percent')?'%':''));
  if(fraction||features.has('^')||features.has('square')||features.has('mode')||['sin','cos','tan'].some(k=>features.has(k)))functions.append(keyButton('left'),keyButton('down'),keyButton('right'));
  const numberPad=el('div',undefined,'calculator-numbers');for(const [row,keys] of [['7','8','9','-'],['4','5','6','+'],['1','2','3','toggle'],['0','.','neg','enter']].entries())for(const [col,key] of keys.entries()){
   if(['+','-'].includes(key)&&!features.has(key)||key==='toggle'&&!features.has('toggle')||key==='.'&&!features.has('.')||key==='neg'&&!features.has('neg')&&!features.has('-')&&!second)continue;
   const button=keyButton(key,key==='7'&&features.has('mixed')?'U n/d':key==='neg'&&second?'Ans':'');button.style.gridRow=String(row+1);button.style.gridColumn=String(col+1);numberPad.append(button);
  }
  keypad.append(functions,numberPad);if(highlight)for(const b of keypad.querySelectorAll('[data-key]'))if(b.dataset.key===highlight)b.classList.add('is-tutorial-key');if(focused)[...keypad.querySelectorAll('[data-key]')].find(b=>b.dataset.key===focused)?.focus({preventScroll:true});
 }
 const hide=()=>{hiddenFor=context.id;document.dispatchEvent(new CustomEvent('calculator-interaction'));document.dispatchEvent(new CustomEvent('calculator-hide'));setOpen(false);};toggle.onclick=()=>{if(open)hide();else{document.dispatchEvent(new CustomEvent('calculator-interaction'));setOpen(true);}};close.onclick=hide;
 document.addEventListener('keydown',event=>{
  if(!open||event.ctrlKey||event.metaKey||event.altKey||event.isComposing)return;
  const target=event.target;if(target.closest?.('input,textarea,select,[contenteditable="true"],dialog'))return;if(target.closest?.('button,a')&&!target.closest('#calculator-panel'))return;if(target.closest?.('#calculator-panel button:not([data-key])'))return;
  if(event.key==='Escape'){event.preventDefault();hide();return;}
  let key=event.key;const aliases={Enter:'enter','=':'enter',Backspace:'delete',Delete:'delete',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left',c:'clear',C:'clear'};key=aliases[key]||key;if(!/^[\d.+*/()-]$/.test(key)&&!Object.values(aliases).includes(key))return;
  if(key==='-'&&(!state.root.length||['+','-','*','/','('].includes(state.root.at(-1))))key='neg';event.preventDefault();apply(key);
 });
 subscribeCalculator(next=>{const changed=next.id!==context.id;context=next;if(changed){state=press(state,'clear');tutorialId='';tutorialIndex=-1;render();if(next.recommended&&hiddenFor!==next.id)setOpen(true,false);else setOpen(false,false);}else render();});
 ui={setOpen,step(plan,index){if(plan.id!==context.id)setCalculatorContext(plan);context=plan;if(tutorialId!==plan.id||index!==tutorialIndex+1){state=createCalculator();for(let i=0;i<index;i++)state=press(state,plan.keys[i]);}tutorialId=plan.id;tutorialIndex=index;setOpen(true,false);state=press(state,plan.keys[index]);render(plan.keys[index]);},getState:()=>state};render();setOpen(context.recommended,false);return ui;
}

export function mountCalculatorTutorial(host,plan){
 if(!plan?.recommended||!plan.keys?.length)return()=>{};
 if(plan.alternatives?.length){
  const group=el('div',undefined,'calculator-method-group'),methods=el('div',undefined,'calculator-methods'),content=el('div');methods.setAttribute('role','group');methods.setAttribute('aria-label','Calculator method');group.append(methods,content);host.append(group);let dispose;
  const choices=[{...plan,alternatives:undefined},...plan.alternatives.map((method,i)=>({...plan,...method,alternatives:undefined,id:plan.id+':method-'+i}))];
  const choose=index=>{dispose?.();content.replaceChildren();[...methods.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));dispose=mountCalculatorTutorial(content,choices[index]);};
  choices.forEach((method,index)=>{const button=el('button',method.methodLabel);button.type='button';button.onclick=()=>choose(index);methods.append(button);});choose(0);const cleanup=()=>dispose?.();cleanup.play=auto=>dispose?.play?.(auto);cleanup.pause=()=>dispose?.pause?.();cleanup.complete=()=>dispose?.complete?.();return cleanup;
 }

 const section=el('div',undefined,'calculator-tutorial'),heading=el('h4','Calculator keys · 36X Pro'),keys=el('div',undefined,'calculator-key-sequence'),controls=el('div',undefined,'calculator-tutorial-controls'),next=el('button'),play=el('button'),reset=el('button','↺'),caption=el('p',plan.methodHint||'Step through the keys, or play the sequence.','calculator-tutorial-caption');
 for(const key of plan.keys){const chip=el('span',keyLabel(key),'calculator-key-chip');chip.dataset.category=keyCategory(key);keys.append(chip);}keys.setAttribute('aria-label',plan.keys.map(keyLabel).join(', '));
 for(const b of [next,play,reset])b.type='button';setPlaybackIcon(next,'next','Next calculator key');setPlaybackIcon(play,'play','Play calculator keys');reset.setAttribute('aria-label','Restart calculator keys');reset.title='Restart calculator keys';controls.append(next,play,reset);section.append(heading,keys,controls,caption);host.append(section);
 let index=0,timer;const stop=()=>{clearInterval(timer);timer=undefined;setPlaybackIcon(play,'play','Play calculator keys');};
 const step=()=>{if(index>=plan.keys.length)return;mountCalculator().step(plan,index);[...keys.children].forEach((chip,i)=>{chip.classList.toggle('is-current',i===index);chip.classList.toggle('is-done',i<index);});caption.textContent=`${index+1} / ${plan.keys.length} · Press ${keyLabel(plan.keys[index])}${index===plan.keys.length-1?' to see the result. '+(plan.methodHint||''):'.'}`;index++;next.disabled=index>=plan.keys.length;if(next.disabled){stop();section.dispatchEvent(new CustomEvent('calculator-tutorial-complete',{bubbles:true}));}};
 const interact=()=>section.dispatchEvent(new CustomEvent('calculator-tutorial-start',{bubbles:true}));
 const start=(auto=false)=>{const running=Boolean(timer);if(!auto)interact();if(running){if(!auto)stop();return;}if(index>=plan.keys.length){if(auto)return;index=0;next.disabled=false;}step();if(index<plan.keys.length){setPlaybackIcon(play,'pause','Pause calculator keys');timer=setInterval(step,750);}};
 next.onclick=()=>{interact();stop();step();};play.onclick=()=>start(false);reset.onclick=()=>{interact();stop();index=0;next.disabled=false;step();};const unsubscribe=subscribeCalculator(active=>{if(active.id!==plan.id)stop();});document.addEventListener('calculator-hide',stop);const cleanup=()=>{stop();unsubscribe();document.removeEventListener('calculator-hide',stop);};cleanup.play=start;cleanup.pause=stop;cleanup.complete=()=>index>=plan.keys.length;return cleanup;
}
