import {createPractice,generateQuestionValues} from '../curriculum/practice.js';
import {answerNumber} from '../math/verification.js';
import {rational,parseDecimal,compare} from '../math/core/exact.js';
// Only single-answer tasks are scored. Multi-part and open-ended activities remain in practice.
const scoredRules=new Set(['whole-add-subtract','decimal-addition','decimal-subtraction','fraction-add','fraction-subtract','round-tenth','evaluate-expression','equation-subtract','equation-divide','shape-area','metric-conversion','budget','sales-tax','round-number','decimal-calculate','percent-quantity','whole-power','rectangle-measure','decomposed-area','surface-area','prism-volume','dimensional-units','capacity-volume','cash-purchase','simple-interest','savings-plan','g8-integer-add-sub','g8-integer-multiply-divide','g8-fraction-add-sub','g8-fraction-multiply-divide','g8-evaluate','g8-equation','g8-powers-ten','g8-scientific','g8-pythagorean','g8-pythagorean-leg','g8-financial-goal','data-measure','probability-single','story-add','story-subtract','story-multiply','story-divide','missing-number','compare-values','digit-value','fraction-of-quantity','fraction-story','fraction-story-like','decimal-story','percent-story','unit-rate','linear-story','pattern-term','rectangle-measure-variants','area-formula','unit-convert','integer-story','power-value','angle-relation','probability-word','mean-missing','round-story','convert-forms','simplify-fraction','equivalent-missing','compare-fractions-story','gcf-lcm','divisibility-count','prime-factor-question','decimal-operation','order-of-operations','decimal-sequence','pattern-table-values','inequality-count','combine-terms','money-change','unit-price-best','currency-exchange','simple-interest','budget-balance','elapsed-time-story','chart-read','experimental-probability-story','sample-space','circle-story','solid-measure','composite-area','pythagoras-story','transform-point','scale-length','polygon-angle','ratio-share','mean-change','unit-fraction-story','rational-pick','fraction-divide-story','interval-count','savings-goal','midpoint-decimal','scientific-story','sqrt-estimate','powers-of-ten','integer-product','evaluate-signed','sale-total','debt-story','turn-angle','survey-percent','simple-interest-story','g8-venn','g8-dependent-probability']);
export function numericAnswer(template,values){
 if(!scoredRules.has(template.rule))throw Error('This activity needs a different answer format.');
 const result=createPractice(template,values);if(result.reflection)throw Error('Discussion is unscored.');
 return answerNumber(result.answer);
}
export function findNode(root,id){
 if(root.id===id)return root;
 for(const child of root.children||[]){const found=findNode(child,id);if(found)return found;}
}
// `topics` is 'all', one node id, or an array of node ids (strand, topic or skill) in the grade; an empty array also means all.
export const topicList=topics=>topics==='all'||topics==null?[]:Array.isArray(topics)?topics:[topics];
// Saved rounds predate multi-select: they only have `strand`.
export const roundTopics=round=>round.topics??topicList(round.strand);
export const topicKey=topics=>[...topicList(topics)].sort().join(',');
export function eligibleQuestions(grade,topics='all'){
 const ids=new Set(),list=topicList(topics);const collect=n=>{ids.add(n.id);n.children?.forEach(collect);};
 if(!list.length)collect(grade.curriculum);else for(const id of list)collect(findNode(grade.curriculum,id)||{id:''});
 return grade.questions.filter(q=>{if(!ids.has(q.skillId))return false;try{numericAnswer(q,q.example);return true;}catch{return false;}});
}
export function parseAnswer(input){
 const text=String(input).trim();if(text.length>80)throw Error('Keep the answer under 80 characters.');
 const f=text.match(/^([+-]?\d{1,30})\s*\/\s*([+-]?\d{1,30})$/);
 if(f)return rational(f[1],f[2]);
 if(!/^[+-]?\d{1,30}(?:\.\d{1,30})?$/.test(text))throw Error('Enter a whole number, decimal, or fraction such as 3/4.');
 return parseDecimal(text);
}
export function makeRound(grade,topics='all',rng=Math.random,id=crypto.randomUUID()){
 const pool=eligibleQuestions(grade,topics);if(!pool.length)throw Error('No automatically checked questions are available here yet.');
 const shuffled=[...pool];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const questions=[];
 for(let i=0;i<5;i++){
  const template=shuffled[i%shuffled.length];let values;
  for(let attempt=0;attempt<100;attempt++){try{const candidate=generateQuestionValues(template,rng);numericAnswer(template,candidate);values=candidate;break;}catch{}}
  if(!values)throw Error('Could not prepare a valid question. Try another topic.');
  questions.push({templateId:template.id,values,attempts:0,correct:false,assisted:false,entry:''});
 }
 return {id,version:1,revision:0,grade:grade.grade,topics:topicList(topics),createdAt:Date.now(),updatedAt:Date.now(),index:0,status:'active',questions};
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
// Overall progress across every playable topic, for the top-level "All topics" row.
export function overallProgress(grade,rounds,profileId){
 const playable=new Set(eligibleQuestions(grade).map(q=>q.skillId)),stat=recentRate(attemptHistory(grade,rounds,profileId).filter(a=>playable.has(a.skillId)));
 return {stat,status:levelOf(stat)};
}
// Strands and topics the learner can choose to practise: only those with at least one automatically checked question.
export function topicOptions(grade){
 const playable=new Set(eligibleQuestions(grade).map(q=>q.skillId)),options=[];
 const leaves=n=>n.children?n.children.flatMap(leaves):[n.id];
 for(const strand of grade.curriculum.children){
  if(!leaves(strand).some(id=>playable.has(id)))continue;
  options.push({id:strand.id,title:strand.title,level:'strand'});
  for(const topic of strand.children||[])if(topic.children&&leaves(topic).some(id=>playable.has(id)))options.push({id:topic.id,title:topic.title.replace(/^[A-F]\d+ · /,''),level:'topic',strand:strand.title});
 }
 return options;
}
