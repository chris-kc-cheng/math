import katex from 'katex';
import 'katex/dist/katex.min.css';
import './style.css';
import './fraction-conversion.css';
import {convertMixed,convertFraction} from './fraction-conversion.js';

document.querySelector('#app').innerHTML=`<main class="fraction-demo">
<nav><a href="./">← Demo</a> · <a href="./curriculum.html#b1-3">Grade 5 · B1.3</a></nav>
<h1>Mixed numbers & fractions</h1>
<form id="conversion-form">
<label class="direction">Convert <select id="direction"><option value="mixed">Mixed number → fraction</option><option value="fraction">Fraction → mixed number</option></select></label>
<div class="number-inputs"><label id="whole-field">Wholes<input id="whole" inputmode="numeric" value="2" required pattern="[0-9]+" maxlength="60"></label><label>Numerator<input id="numerator" inputmode="numeric" value="1" required pattern="[0-9]+" maxlength="60"></label><span aria-hidden="true">/</span><label>Denominator<input id="denominator" inputmode="numeric" value="3" required pattern="[0-9]+" maxlength="60"></label><button type="submit">Show steps</button></div>
</form><p id="conversion-error" role="alert"></p>
<div id="original" class="math"></div><div id="conversion-steps" role="log" aria-label="Solution steps"></div>
<p id="conversion-caption" class="caption" aria-live="polite"></p>
<div class="controls"><button id="next" type="button">Next step</button><button id="play" type="button">Play</button><button id="restart" type="button">Restart</button></div>
</main>`;
const get=id=>document.getElementById(id);
let steps=[],position=1,timer;
const render=(tex,element)=>katex.render(tex,element,{displayMode:true,throwOnError:true,trust:false});
function stop(){clearInterval(timer);timer=undefined;get('play').textContent='Play';}
function reveal(){
  if(position>=steps.length)return;
  const step=steps[position++],row=document.createElement('div');row.className='step';
  const equals=document.createElement('div'),math=document.createElement('div');equals.className='equals';math.className='math';render('=',equals);render(step.math,math);row.append(equals,math);get('conversion-steps').append(row);
  get('conversion-caption').textContent=step.text;
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)row.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:300});
  get('next').disabled=position>=steps.length;get('play').disabled=position>=steps.length;
  if(position>=steps.length){row.classList.add('answer');stop();}
}
function start(){
  stop();get('conversion-error').textContent='';
  try {
    const result=get('direction').value==='mixed'?convertMixed(get('whole').value,get('numerator').value,get('denominator').value):convertFraction(get('numerator').value,get('denominator').value);
    steps=result.steps;position=1;render(steps[0].math,get('original'));get('conversion-steps').replaceChildren();get('conversion-caption').textContent=steps[0].text;get('next').disabled=false;get('play').disabled=false;
  }catch(error){get('conversion-error').textContent=error.message;get('next').disabled=true;get('play').disabled=true;}
}
get('conversion-form').onsubmit=event=>{event.preventDefault();start();};
get('direction').onchange=()=>{const isMixed=get('direction').value==='mixed';get('whole-field').hidden=!isMixed;get('whole').disabled=!isMixed;get('numerator').value=isMixed?'1':'7';start();};
get('next').onclick=reveal;
get('play').onclick=()=>{if(timer){stop();return;}reveal();if(position<steps.length){get('play').textContent='Pause';timer=setInterval(reveal,2200);}};
get('restart').onclick=start;
window.addEventListener('pagehide',stop);
start();
