import {createPractice,generateQuestionValues} from '../curriculum/practice.js';
import {answerNumber} from '../math/verification.js';
import {rational,parseDecimal,compare} from '../math/core/exact.js';
// Only single-answer tasks are scored. Multi-part and open-ended activities remain in practice.
const scoredRules=new Set(['whole-add-subtract','decimal-addition','decimal-subtraction','fraction-add','fraction-subtract','round-tenth','evaluate-expression','equation-subtract','equation-divide','shape-area','metric-conversion','budget','sales-tax','round-number','decimal-calculate','percent-quantity','whole-power','rectangle-measure','decomposed-area','surface-area','prism-volume','dimensional-units','capacity-volume','cash-purchase','simple-interest','savings-plan','g8-integer-add-sub','g8-integer-multiply-divide','g8-fraction-add-sub','g8-fraction-multiply-divide','g8-evaluate','g8-equation','g8-powers-ten','g8-scientific','g8-pythagorean','g8-pythagorean-leg','g8-financial-goal']);
export function numericAnswer(template,values){
 if(!scoredRules.has(template.rule))throw Error('This activity needs a different answer format.');
 const result=createPractice(template,values);if(result.reflection)throw Error('Discussion is unscored.');
 return answerNumber(result.answer);
}
export function eligibleQuestions(grade,strand='all'){
 const ids=new Set();const collect=n=>{ids.add(n.id);n.children?.forEach(collect);};
 collect(strand==='all'?grade.curriculum:grade.curriculum.children.find(s=>s.id===strand)||{id:''});
 return grade.questions.filter(q=>{if(!ids.has(q.skillId))return false;try{numericAnswer(q,q.example);return true;}catch{return false;}});
}
export function parseAnswer(input){
 const text=String(input).trim();if(text.length>80)throw Error('Keep the answer under 80 characters.');
 const f=text.match(/^([+-]?\d{1,30})\s*\/\s*([+-]?\d{1,30})$/);
 if(f)return rational(f[1],f[2]);
 if(!/^[+-]?\d{1,30}(?:\.\d{1,30})?$/.test(text))throw Error('Enter a whole number, decimal, or fraction such as 3/4.');
 return parseDecimal(text);
}
export function makeRound(grade,strand='all',rng=Math.random,id=crypto.randomUUID()){
 const pool=eligibleQuestions(grade,strand);if(!pool.length)throw Error('No automatically checked questions are available here yet.');
 const shuffled=[...pool];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const questions=[];
 for(let i=0;i<5;i++){
  const template=shuffled[i%shuffled.length];let values;
  for(let attempt=0;attempt<100;attempt++){try{const candidate=generateQuestionValues(template,rng);numericAnswer(template,candidate);values=candidate;break;}catch{}}
  if(!values)throw Error('Could not prepare a valid question. Try another topic.');
  questions.push({templateId:template.id,values,attempts:0,correct:false,assisted:false,entry:''});
 }
 return {id,version:1,revision:0,grade:grade.grade,strand,createdAt:Date.now(),updatedAt:Date.now(),index:0,status:'active',questions};
}
export const score=round=>round.questions.reduce((n,q)=>n+(q.correct&&!q.assisted?(q.attempts===1?10:5):0),0);
export function answerRound(round,template,input){
 const current=round.questions[round.index];if(!current||current.correct||current.assisted||round.status!=='active')throw Error('This question is already finished.');
 if(template.id!==current.templateId)throw Error('Question mismatch.');
 const candidate=parseAnswer(input),expected=numericAnswer(template,current.values),correct=compare(candidate,expected)===0;
 const next=structuredClone(round);Object.assign(next.questions[next.index],{attempts:current.attempts+1,correct,entry:String(input)});return next;
}
export function revealRound(round){const next=structuredClone(round),q=next.questions[next.index];if(q&&!q.correct)q.assisted=true;return next;}
export function advanceRound(round){
 const current=round.questions[round.index];if(!current||!current.correct&&!current.assisted)throw Error('Finish this question first.');
 const next=structuredClone(round);if(next.index===next.questions.length-1)next.status='complete';else next.index++;return next;
}

export function playerKey(name){
 const key=String(name).normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-CA');
 if(!key||key.length>40||/[\u0000-\u001f\u007f]/.test(key))throw Error('Enter a name from 1 to 40 characters.');
 return key;
}
export function lastPlayed(rounds,key){return rounds.filter(r=>r.profileId===key).sort((a,b)=>b.updatedAt-a.updatedAt)[0];}
// The battle is derived from saved answers, so a resumed round shows the same scene.
// Every solved question is a hit; each wrong try or explored question lets the zombie step closer (capped, never a loss).
export const HERO_LIVES=5;
// Captain Patty also has lives: each wrong answer costs one. At zero he cries but never dies.
export function battleState(round){
 let hits=0,misses=0,wrong=0;
 for(const q of round.questions){const bad=Math.max(0,q.attempts-(q.correct?1:0));if(q.correct)hits++;wrong+=bad;misses+=bad+(q.assisted?1:0);}
 const total=round.questions.length;
 const lives=Math.max(0,HERO_LIVES-wrong);
 return {hits,total,hearts:total-hits,lives,maxLives:HERO_LIVES,crying:lives===0,misses:Math.min(misses,4),done:round.status==='complete',won:round.status==='complete'&&hits>=Math.ceil(total/2)};
}
// Progress per topic: the share of the player's last 10 finished questions that were solved.
// A question is finished when solved or explored; exploring without solving counts as not solved.
export const STAT_WINDOW=10;
export function attemptHistory(grade,rounds,profileId){
 const skillOf=new Map(grade.questions.map(q=>[q.id,q.skillId])),history=[];
 for(const round of [...rounds].filter(r=>r.profileId===profileId&&r.grade===grade.grade).sort((a,b)=>a.updatedAt-b.updatedAt))
  round.questions.forEach(q=>{if((q.correct||q.assisted)&&skillOf.has(q.templateId))history.push({skillId:skillOf.get(q.templateId),correct:Boolean(q.correct)});});
 return history;
}
export function recentRate(attempts,limit=STAT_WINDOW){
 const recent=attempts.slice(-limit);return recent.length?{rate:recent.filter(a=>a.correct).length/recent.length,attempts:recent.length}:null;
}
export const levelOf=stat=>!stat?'none':stat.rate>=0.8?'good':stat.rate>=0.5?'fair':'weak';
// Strand → topic → skill tree limited to skills the game can score, each node carrying its own recent rate.
export function progressTree(grade,rounds,profileId){
 const playable=new Set(eligibleQuestions(grade).map(q=>q.skillId)),history=attemptHistory(grade,rounds,profileId);
 const build=(node,level)=>{
  if(!node.children)return playable.has(node.id)?{id:node.id,title:node.title,level,skills:[node.id]}:null;
  const children=node.children.map(c=>build(c,level+1)).filter(Boolean);
  return children.length?{id:node.id,title:node.title.replace(/^[A-F]\d+ · /,''),level,children,skills:children.flatMap(c=>c.skills)}:null;
 };
 const decorate=node=>{const mine=new Set(node.skills),stat=recentRate(history.filter(a=>mine.has(a.skillId)));node.stat=stat;node.status=levelOf(stat);node.children?.forEach(decorate);return node;};
 return grade.curriculum.children.map(s=>build(s,0)).filter(Boolean).map(decorate);
}
