import katex from 'katex';
import 'katex/dist/katex.min.css';
import './style.css';
import {solve} from './solver.js';

const questions = ['2 + 3 × 4', '1/2 + 2/3'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const app = document.querySelector('#app');
app.innerHTML = '<main><nav><a href="./write.html">Write a formula</a> · <a href="./skills.html">Math skills & captions</a></nav><h1>Step by step</h1></main>';

questions.forEach(question => {
  const steps = solve(question).methods[0].steps;
  const section = document.createElement('section');
  section.setAttribute('aria-label', `Question: ${question}`);
  section.innerHTML = `<div class="steps" role="log" aria-live="polite" aria-relevant="additions"></div><p class="caption" aria-live="polite" aria-atomic="true"></p><div class="controls"><button class="next">Next step</button><button class="play">Play</button></div>`;
  app.querySelector('main').append(section);
  const list = section.querySelector('.steps');
  const next = section.querySelector('.next');
  const play = section.querySelector('.play');
  let shown = 0;
  let timer;
  function pause() {
    clearInterval(timer);
    timer = null;
    play.textContent = 'Play';
  }
  function reveal() {
    if (shown >= steps.length) return;
    const current = steps[shown];
    const row = document.createElement('div');
    row.className = 'step';
    const math = document.createElement('div');
    math.className = 'math';
    const equals = document.createElement('div');
    equals.className = 'equals';
    katex.render(shown ? '=' : '\\phantom{=}', equals, {displayMode:true, throwOnError:true});
    katex.render(current.math, math, {displayMode:true, throwOnError:true, trust:false});
    row.append(equals, math);
    list.append(row);
    section.querySelector('.caption').textContent = current.text;
    shown++;
    if (shown > 1 && !reducedMotion.matches) {
      row.animate([{opacity:0, transform:'translateY(8px)'}, {opacity:1, transform:'translateY(0)'}], {duration:350});
    }
    if (shown === steps.length) {
      row.classList.add('answer');
      pause();
      next.disabled = true;
      next.textContent = 'Complete';
      play.hidden = true;
    }
  }
  next.onclick = () => { pause(); reveal(); };
  play.onclick = () => {
    if (timer) { pause(); return; }
    play.textContent = 'Pause';
    timer = setInterval(reveal, 2200);
  };
  reveal();
});
