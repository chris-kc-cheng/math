import './chrome.css';
import {el} from './dom.js';
import {LEVELS,AUTO,normalizeChoice,labelOfRank,levelById} from '../curriculum/difficulty.js';

// The learner's chosen difficulty (Auto = progressive, otherwise Simple, Medium or Hard), shared by every page on this device.
const KEY='math-difficulty';
export const getChoice=()=>{try{return normalizeChoice(localStorage.getItem(KEY));}catch{return AUTO;}};
export function setChoice(choice){
 const value=normalizeChoice(choice);
 try{localStorage.setItem(KEY,value);}catch{}
 document.dispatchEvent(new CustomEvent('math-difficulty-change',{detail:value}));
}
export const choiceLabel=choice=>levelById(choice)?.label??'Auto';
const HINT={auto:'Starts simple and gets harder',simple:'Small, familiar numbers (like 50%): no calculator needed',medium:'Everyday numbers',hard:'Larger or less friendly numbers'};

// A small badge: three bars filled up to the level, with its name.
export function difficultyBadge(rank,{short=false}={}){
 const node=el('span',undefined,`difficulty-badge level-${rank}`),label=labelOfRank(rank)||'';
 node.setAttribute('role','img');node.setAttribute('aria-label',`Difficulty: ${label}`);node.title=`Difficulty: ${label}`;
 const bars=el('span',undefined,'difficulty-bars');bars.setAttribute('aria-hidden','true');
 for(let i=1;i<=LEVELS.length;i++)bars.append(el('i',undefined,i<=rank?'on':''));
 node.append(bars);if(!short)node.append(el('span',label,'difficulty-name'));
 return node;
}
export function setBadge(host,rank,options){host.replaceChildren(...(rank?[difficultyBadge(rank,options)]:[]));}

// A labelled selector kept in step with the saved choice. `onChange(choice)` runs when the learner picks.
export function difficultySelect({onChange,compact=false,id}={}){
 const wrap=el('label',undefined,`difficulty-pick${compact?' compact':''}`),select=el('select');
 if(id)select.id=id;
 select.title='Difficulty';
 for(const [value,label] of [[AUTO,'Auto'],...LEVELS.map(level=>[level.id,level.label])]){const option=el('option',label);option.value=value;option.title=HINT[value];select.append(option);}
 select.value=getChoice();
 wrap.append(el('span','Difficulty','difficulty-label'),select);
 const sync=()=>{select.value=getChoice();};
 document.addEventListener('math-difficulty-change',sync);
 select.onchange=()=>{setChoice(select.value);onChange?.(select.value);};
 return wrap;
}
