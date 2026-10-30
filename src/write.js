import katex from 'katex';
import 'katex/dist/katex.min.css';
import './style.css';
import {preprocessStrokes,isStrokeMeaningful} from 'ink-on/core';
import {strokeTouchesEraser} from './ink-editing.js';

export function mountWriting(app,{onUse,initialFormula='',log=()=>{}}){
log('drawing.mount');
const icon = path => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const icons={
 pen:icon('<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14z"/>'),
 eraser:icon('<path d="m14 3 7 7a2 2 0 0 1 0 3l-7 7H8l-6-6a2 2 0 0 1 0-3l9-8a2 2 0 0 1 3 0ZM7 7l10 10M8 20h14"/>'),
 undo:icon('<path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12" transform="translate(0 -2)"/>'),
 clear:icon('<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>'),
};
app.innerHTML=`<div class="writing"><div class="drawing-box"><div class="ink-toolbar" role="toolbar" aria-label="Drawing tools">${['pen','eraser','undo','clear'].map((name,i)=>`<button type="button" class="icon-tool" id="${name}" aria-label="${name[0].toUpperCase()+name.slice(1)}" title="${name[0].toUpperCase()+name.slice(1)}" ${i<2?`aria-pressed="${i===0}"`:''}>${icons[name]}</button>`).join('')}<label class="live-toggle"><input id="live" type="checkbox" checked> Live</label></div><canvas id="formula-pad" width="900" height="300" aria-label="Draw a math formula"></canvas></div><div class="read-row"><button id="recognize" disabled hidden>Read handwriting</button><span id="ink-status" role="status">Loading…</span></div><form id="review"><div id="recognized-preview" aria-label="Formula" aria-live="polite"></div><button id="solve" disabled>Use formula</button></form><details id="latex-panel"><summary>Edit LaTeX</summary><form id="edit-formula"><label for="latex">LaTeX or plain text</label><div class="review-row"><input id="latex" maxlength="120" autocomplete="off"><button>Apply</button></div></form></details><p id="error" role="alert"></p></div>`;
const $=s=>app.querySelector(s),canvas=$('#formula-pad'),ctx=canvas.getContext('2d');
const strokes=[];
let active=null, revision=0, requestId=0, pending=null, ready=false, busy=false, worker;
let tool='pen', liveTimer, autoWanted=false, recognized='';
const history=[];
function remember(before){log('drawing.edit',{tool,strokes:strokes.length,points:strokes.reduce((n,s)=>n+s.points.length,0)});history.push(before);if(history.length>30)history.shift();}
function scheduleRecognition(){
 clearTimeout(liveTimer);
 if(!$('#live').checked)return;
 autoWanted=true;log('recognition.debounce',{revision,delayMs:650,busy,ready});
 liveTimer=setTimeout(()=>{if(!active&&!busy&&ready&&autoWanted){autoWanted=false;recognize(true);}},650);
}
for(const mode of ['pen','eraser']) $('#'+mode).onclick=()=>{tool=mode;log('drawing.tool',{tool});$('#pen').setAttribute('aria-pressed',String(mode==='pen'));$('#eraser').setAttribute('aria-pressed',String(mode==='eraser'));canvas.classList.toggle('erasing',mode==='eraser');};
$('#live').onchange=()=>{clearTimeout(liveTimer);autoWanted=false;updateButton();if($('#live').checked)scheduleRecognition();};
function status(text){if(text)log('drawing.status',{text});$('#ink-status').textContent=text;}
function updateButton(){ $('#recognize').disabled=!ready||busy;$('#recognize').hidden=$('#live').checked; }
function invalidate(){revision++;clearTimeout(liveTimer);autoWanted=false;recognized='';$('#latex').value='';$('#solve').disabled=true;$('#recognized-preview').replaceChildren();$('#error').textContent='';status(ready?'':'Loading…');}
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
  log('worker.'+data.type,data);
  if(data.type==='debug')return;
  if(data.type==='ready'){ready=true;status('');if(strokes.length)scheduleRecognition();}
  if(data.type==='result'||data.type==='error'){
   busy=false;
   if(data.id===undefined){ready=false;status('Unable to start. Reload to retry.');}
   else if(pending&&data.id===pending.id&&pending.revision===revision){
    if(data.type==='error')status('Couldn’t read that. Try again.');
    else if(!data.latex.trim())status('Try writing more clearly.');
    else {recognized=data.latex;$('#latex').value=recognized;preview();$('#solve').disabled=false;status('');}
   }
   if(pending&&pending.revision!==revision)log('recognition.stale',{request:data.id,requestRevision:pending.revision,currentRevision:revision});
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
 if(!isStrokeMeaningful(strokes)){if(!automatic)status('Draw a formula first.');return;}
 try{const input=preprocessStrokes(strokes);log('recognition.input',{revision,strokes:strokes.length,height:input.height,width:input.width,tensorBytes:input.tensor.byteLength,maskBytes:input.mask.byteLength});pending={id:++requestId,revision};busy=true;updateButton();status('Reading…');worker.postMessage({type:'recognize',id:pending.id,input},[input.tensor.buffer,input.mask.buffer]);}catch(error){busy=false;pending=null;updateButton();status('Couldn’t read that. Try again.');}
}
$('#recognize').onclick=()=>recognize();
$('#latex-panel').ontoggle=()=>log('editor.toggle',{open:$('#latex-panel').open});
$('#latex').oninput=()=>{
 revision++;clearTimeout(liveTimer);autoWanted=false;recognized=$('#latex').value;
 $('#error').textContent='';
 try{katex.render(recognized,$('#recognized-preview'),{displayMode:true,throwOnError:true,trust:false});$('#solve').disabled=!recognized.trim();}
 catch{ $('#recognized-preview').replaceChildren();$('#solve').disabled=true; }
 log('editor.change',{latex:recognized,revision});
};
$('#edit-formula').onsubmit=e=>{e.preventDefault();$('#latex').oninput();if(!$('#solve').disabled){$('#latex-panel').open=false;log('editor.apply',{latex:recognized});}else $('#error').textContent='Enter a valid formula.';};
if(initialFormula){recognized=initialFormula;$('#latex').value=recognized;preview();$('#solve').disabled=false;}

$('#review').onsubmit=e=>{e.preventDefault();if(recognized){log('drawing.use',{latex:recognized});onUse(recognized);}};
startWorker();
return ()=>{clearTimeout(liveTimer);active=null;worker.onmessage=null;worker.onerror=null;worker.terminate();log('drawing.dispose');app.replaceChildren();};
}
