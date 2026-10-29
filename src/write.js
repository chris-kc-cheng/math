import katex from 'katex';
import 'katex/dist/katex.min.css';
import './style.css';
import {solve} from './solver.js';
import {preprocessStrokes,isStrokeMeaningful} from 'ink-on/core';
import {strokeTouchesEraser} from './ink-editing.js';

const app=document.querySelector('#app');
const icon = path => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const icons={
 pen:icon('<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14z"/>'),
 eraser:icon('<path d="m14 3 7 7a2 2 0 0 1 0 3l-7 7H8l-6-6a2 2 0 0 1 0-3l9-8a2 2 0 0 1 3 0ZM7 7l10 10M8 20h14"/>'),
 undo:icon('<path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12" transform="translate(0 -2)"/>'),
 clear:icon('<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>'),
};
app.innerHTML=`<main class="writing"><nav><a href="./">← Questions</a> · <a href="./skills.html">Math skills & captions</a></nav><h1>Write a formula</h1><div class="drawing-box"><div class="ink-toolbar" role="toolbar" aria-label="Drawing tools">${['pen','eraser','undo','clear'].map((name,i)=>`<button type="button" class="icon-tool" id="${name}" aria-label="${name[0].toUpperCase()+name.slice(1)}" title="${name[0].toUpperCase()+name.slice(1)}" ${i<2?`aria-pressed="${i===0}"`:''}>${icons[name]}</button>`).join('')}<label class="live-toggle"><input id="live" type="checkbox" checked> Live</label></div><canvas id="formula-pad" width="900" height="300" aria-label="Draw a math formula"></canvas></div><div class="read-row"><button id="recognize" disabled hidden>Read handwriting</button><span id="ink-status" role="status">Loading…</span></div><form id="review"><div id="recognized-preview" aria-label="Formula" aria-live="polite"></div><button id="solve" disabled>Solve</button></form><p id="error" role="alert"></p><section id="solution" aria-label="Solution" hidden><div class="steps" role="log" aria-live="polite" aria-relevant="additions"></div><p class="caption" aria-live="polite"></p><button id="next">Next step</button></section></main>`;
const $=s=>document.querySelector(s),canvas=$('#formula-pad'),ctx=canvas.getContext('2d');
const strokes=[];
let active=null, revision=0, requestId=0, pending=null, ready=false, busy=false, worker;
let tool='pen', liveTimer, autoWanted=false, recognized='';
const history=[];
function remember(before){history.push(before);if(history.length>30)history.shift();}
function scheduleRecognition(){
 clearTimeout(liveTimer);
 if(!$('#live').checked)return;
 autoWanted=true;
 liveTimer=setTimeout(()=>{if(!active&&!busy&&ready&&autoWanted){autoWanted=false;recognize(true);}},650);
}
for(const mode of ['pen','eraser']) $('#'+mode).onclick=()=>{tool=mode;$('#pen').setAttribute('aria-pressed',String(mode==='pen'));$('#eraser').setAttribute('aria-pressed',String(mode==='eraser'));canvas.classList.toggle('erasing',mode==='eraser');};
$('#live').onchange=()=>{clearTimeout(liveTimer);autoWanted=false;updateButton();if($('#live').checked)scheduleRecognition();};
function status(text){$('#ink-status').textContent=text;}
function updateButton(){ $('#recognize').disabled=!ready||busy;$('#recognize').hidden=$('#live').checked; }
function invalidate(){revision++;clearTimeout(liveTimer);autoWanted=false;$('#solution').hidden=true;recognized='';$('#solve').disabled=true;$('#recognized-preview').replaceChildren();$('#error').textContent='';status(ready?'':'Loading…');}
function draw(){
 ctx.clearRect(0,0,900,300);ctx.strokeStyle='#263440';ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';
 for(const stroke of [...strokes,...(active?.tool==='pen'?[active]:[])]){ctx.beginPath();stroke.points.forEach(({x,y},j)=>j?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
}
function position(e){const r=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(900,(e.clientX-r.left)*900/r.width)),y:Math.max(0,Math.min(300,(e.clientY-r.top)*300/r.height))};}
function erase(from,to){const radius=12*900/canvas.getBoundingClientRect().width;for(let i=strokes.length-1;i>=0;i--)if(strokeTouchesEraser(strokes[i],from,to,radius))strokes.splice(i,1);}
canvas.onpointerdown=e=>{if(active||e.button!==0)return;if(tool==='pen'&&strokes.length>=100){status('The pad is full. Erase strokes or clear it.');return;}e.preventDefault();canvas.setPointerCapture(e.pointerId);const p=position(e);active={id:e.pointerId,tool,points:[p],lineWidth:3,before:[...strokes]};invalidate();if(tool==='eraser'){erase(p,p);draw();}};
canvas.onpointermove=e=>{if(!active||active.id!==e.pointerId)return;const p=position(e),last=active.points.at(-1);if(active.tool==='eraser'){erase(last,p);active.points=[p];draw();}else if(Math.hypot(p.x-last.x,p.y-last.y)>=1.5&&active.points.length<600){active.points.push(p);draw();}};
canvas.onpointerup=e=>{if(!active||active.id!==e.pointerId)return;const p=position(e);if(active.tool==='pen'){active.points.push(p);strokes.push({points:active.points,lineWidth:3});}else erase(active.points.at(-1),p);if(active.tool==='pen'||strokes.length!==active.before.length)remember(active.before);active=null;draw();scheduleRecognition();};
canvas.onpointercancel=canvas.onlostpointercapture=()=>{if(active){strokes.splice(0,strokes.length,...active.before);active=null;draw();scheduleRecognition();}};
$('#clear').onclick=()=>{if(active)return;if(strokes.length)remember([...strokes]);strokes.length=0;invalidate();draw();};
$('#undo').onclick=()=>{if(active||!history.length)return;strokes.splice(0,strokes.length,...history.pop());invalidate();draw();scheduleRecognition();};
function preview(){try{katex.render(recognized,$('#recognized-preview'),{displayMode:true,throwOnError:true,trust:false});}catch{$('#recognized-preview').replaceChildren();}}
function startWorker(){
 worker=new Worker(new URL('./recognition.worker.js',import.meta.url),{type:'module'});
 worker.onmessage=({data})=>{
  if(data.type==='ready'){ready=true;status('');if(strokes.length)scheduleRecognition();}
  if(data.type==='result'||data.type==='error'){
   busy=false;
   if(data.id===undefined){ready=false;status('Unable to start. Reload to retry.');}
   else if(pending&&data.id===pending.id&&pending.revision===revision){
    if(data.type==='error')status('Couldn’t read that. Try again.');
    else if(!data.latex.trim())status('Try writing more clearly.');
    else {recognized=data.latex;preview();$('#solve').disabled=false;status('');}
   }
   pending=null;
   if(autoWanted)scheduleRecognition();
  }
  updateButton();
 };
 worker.onerror=()=>{ready=false;busy=false;pending=null;updateButton();status('Unable to read. Reload to retry.');};
 worker.postMessage({type:'init'});
}
function recognize(automatic=false){
 if(active||busy||!ready)return;
 clearTimeout(liveTimer);autoWanted=false;
 if(!isStrokeMeaningful(strokes)){if(!automatic)status('Write a formula first.');return;}
 try{const input=preprocessStrokes(strokes);pending={id:++requestId,revision};busy=true;updateButton();status('Reading…');worker.postMessage({type:'recognize',id:pending.id,input},[input.tensor.buffer,input.mask.buffer]);}catch(error){busy=false;pending=null;updateButton();status('Couldn’t read that. Try again.');}
}
$('#recognize').onclick=()=>recognize();
let steps=[],shown=0;
function reveal(){
 if(shown>=steps.length)return;
 const current=steps[shown],row=document.createElement('div');row.className='step';
 for(const [className,formula] of [['equals',shown?'=':'\\phantom{=}'],['math',current.math]]){const el=document.createElement('div');el.className=className;katex.render(formula,el,{displayMode:true,throwOnError:true,trust:false});row.append(el);}
 $('#solution .steps').append(row);$('#solution .caption').textContent=current.text;shown++;
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)row.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:350});
 $('#next').disabled=shown===steps.length;$('#next').textContent=shown===steps.length?'Complete':'Next step';if(shown===steps.length)row.classList.add('answer');
}
$('#review').onsubmit=e=>{e.preventDefault();try{steps=solve(recognized).methods[0].steps;shown=0;$('#solution .steps').replaceChildren();$('#error').textContent='';$('#solution').hidden=false;reveal();}catch(error){$('#solution').hidden=true;$('#error').textContent=error.message;}};
$('#next').onclick=reveal;
startWorker();
window.addEventListener('pagehide',()=>{clearTimeout(liveTimer);worker.terminate();});


