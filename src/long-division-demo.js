import './style.css';
import {longDivision} from './math/long-division.js';
import {renderLongDivision} from './long-division-view.js';
const app=document.querySelector('#app');
app.innerHTML='<main class="long-division-demo"><nav><a href="./">← Demo</a></nav><h1>Long division</h1><div class="formula-choices"><button data-division="156,12" aria-pressed="true">156 ÷ 12</button><button data-division="784,7" aria-pressed="false">784 ÷ 7</button><button data-division="125,4" aria-pressed="false">125 ÷ 4</button></div><div id="division-board" aria-label="Long division working"></div><p class="division-caption" aria-live="polite"></p><p class="division-answer" aria-live="polite"></p></main>';
let timer,lesson,index;
function render(){
 const current=lesson.steps[index],board=document.querySelector('#division-board');
 renderLongDivision(board,lesson,current);
 document.querySelector('.division-caption').textContent=current.text;
 document.querySelector('.division-answer').textContent=current.phase==='complete'?`${lesson.answer}${lesson.remainder==='0'?'':` remainder ${lesson.remainder}`}`:'';
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)grid.animate([{opacity:.55},{opacity:1}],{duration:250});
 if(index===lesson.steps.length-1){clearInterval(timer);timer=null;}
}
function load(button){
 clearInterval(timer);lesson=longDivision(...button.dataset.division.split(','));index=0;
 document.querySelectorAll('[data-division]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 render();timer=setInterval(()=>{index++;render();},2300);
}
document.querySelectorAll('[data-division]').forEach(button=>button.onclick=()=>load(button));
load(document.querySelector('[data-division]'));
window.addEventListener('pagehide',()=>clearInterval(timer));
