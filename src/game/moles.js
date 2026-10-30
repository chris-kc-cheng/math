import katex from 'katex';
import {setMathText} from '../ui/math-text.js';
import {renderVisual} from '../curriculum/visuals.js';
import {moleChoices} from './mole-choices.js';
import {numericAnswer} from './model.js';
import './moles.css';
import {el} from '../ui/dom.js';
export function mountMoles(host,{round,template,lesson,onAnswer,onNext,onQuit,explain}){
 const current=round.questions[round.index],finished=current.correct||current.assisted;
 const field=el('section',undefined,'mole-field');field.setAttribute('aria-label','Whack-a-Math quiz');
 const toolbar=el('div',undefined,'mole-toolbar'),exit=el('button','← Leave meadow'),full=el('button','⛶ Full screen');
 exit.onclick=()=>{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});onQuit();};full.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{full.textContent='Full-window view';}};
 toolbar.append(exit,el('span',`${round.index+1} / ${round.questions.length}`),full);
 const question=el('div',undefined,'mole-question');question.append(setMathText(el('h2'),lesson.prompt||template.title));
 if(lesson.formula){const formula=el('div');katex.render(lesson.formula,formula,{displayMode:true,throwOnError:false});question.append(formula);}
 if(lesson.visual)renderVisual(question,lesson.visual);
 const feedback=el('p',finished?(current.correct?'✓ Correct! Bonk — one dizzy mole!':'✕ Whoosh! That mole escaped. Let’s learn why.'):'Choose an answer. Click a mole to confirm.','mole-caption');feedback.setAttribute('role','status');
 const meadow=el('div',undefined,'mole-meadow');
 const choices=moleChoices(numericAnswer(template,current.values),round.index+template.id.split('').reduce((n,c)=>n+c.charCodeAt(0),0));
 for(const [i,answer] of choices.entries()){
  const button=el('button',undefined,'mole-choice');button.type='button';button.disabled=finished;button.setAttribute('aria-label',`Answer ${answer}`);
  const hole=el('span',undefined,'mole-hole'),sprite=el('img',undefined,'mole-sprite');sprite.src=`${import.meta.env.BASE_URL}game-art/moles/mole-${i+1}.png`;sprite.alt='';sprite.draggable=false;
  const label=el('span',undefined,'mole-answer');katex.render(answer.includes('/')?`\\frac{${answer.split('/')[0]}}{${answer.split('/')[1]}}`:answer,label,{throwOnError:false});
  if(finished&&current.entry===answer){button.classList.add(current.correct?'mole-hit':'mole-escaped');if(current.correct){button.append(el('span','✦ ★ ✧','mole-stars'),el('span','🔨','mole-hammer'));}}
  button.append(hole,sprite,label);button.onclick=()=>onAnswer(answer);meadow.append(button);
 }
 field.append(toolbar,question,feedback,meadow);
 if(finished){const panel=el('div',undefined,'mole-solution'),next=el('button',round.index===round.questions.length-1?'Finish round →':'Next question →','mole-next');next.onclick=onNext;field.append(next,panel);explain(panel);}
 host.append(field);
 return ()=>{};
}
