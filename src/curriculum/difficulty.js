// Difficulty of a question, judged only from its numbers (no LLM, no hidden state).
// Simple: small, commonly seen numbers (2, 5, 10, 25, 50, 100) that can be done without a calculator.
// Medium: ordinary numbers with one or two significant digits. Hard: awkward or large numbers for the grade's range.
export const LEVELS=[{id:'simple',label:'Simple',rank:1},{id:'medium',label:'Medium',rank:2},{id:'hard',label:'Hard',rank:3}];
export const AUTO='auto';
export const levelById=id=>LEVELS.find(level=>level.id===id);
export const rankOf=level=>levelById(level)?.rank;
export const labelOfRank=rank=>LEVELS.find(level=>level.rank===rank)?.label;
// A chosen level, or 'auto' (progressive: the first third of a set is simple, then medium, then hard).
export const normalizeChoice=value=>levelById(value)?value:AUTO;
export const progressiveLevel=(index,count)=>LEVELS[Math.min(LEVELS.length-1,Math.floor(LEVELS.length*Math.max(0,index)/Math.max(1,count)))].id;
// Endless practice with Auto (the New question button): simple, medium, hard, simple, medium, ...
export const cycleLevel=count=>LEVELS[Math.max(0,count)%LEVELS.length].id;
export const levelFor=(choice,index,count)=>levelById(choice)?choice:progressiveLevel(index,count);

// Parameters that pick a wording, shape or unit rather than a size are not part of the difficulty.
const CATEGORICAL=/^(style|form|kind|mode|operation|variant|exact|shape|measure|ask|task|relationship|transformation|transformationType|patternType|solid|usePowers|changeMode|subtract|divide|replace|useTenths|greaterThan|dimensions|unitPair|triple|decimalPlaces|leftPlaces|rightPlaces|places|roundingPlace|roundingPower|place|shrinking)$/;
export const isCategorical=name=>CATEGORICAL.test(name||'');

const COMMON=new Set([5,10,20,25,50,75,100,200,250,500,1000]);
export function sigDigits(value){
 const digits=String(Math.abs(value)).replace(/e.*$/,'').replace('.','').replace(/^0+/,'').replace(/0+$/,'');
 return Math.max(1,digits.length);
}
// `max` is the largest size the question's domain allows (100 when unknown).
export function valueRank(value,max=100){
 const size=Math.abs(value);if(size===0)return 1;
 const share=size/Math.max(1,max),sig=sigDigits(size);
 if(size<=5||COMMON.has(size)&&size<=max||sig<=1&&share<=0.4)return 1;
 if(sig<=1||sig<=2&&share<=0.75)return 2;
 return 3;
}
const maxOf=domain=>Array.isArray(domain)?Math.max(1,...domain.filter(Number.isFinite).map(Math.abs)):Math.max(1,Math.abs(domain.min),Math.abs(domain.max));
const asList=(template,values)=>Array.isArray(values)?values:(template.parameters||[]).map(name=>values?.[name]);

// 1 (simple), 2 (medium) or 3 (hard): the hardest of the question's numbers.
export function difficultyOf(template,values){
 let rank=1;
 asList(template,values).forEach((value,i)=>{
  if(typeof value!=='number'||!Number.isFinite(value)||isCategorical(template.parameters?.[i]))return;
  const domain=template.generation?.[i];
  rank=Math.max(rank,valueRank(value,domain?maxOf(domain):100));
 });
 return rank;
}

// False for questions with no number to judge (a discussion prompt, or only wording choices): no badge is shown for them.
export const isRated=(template,values)=>asList(template,values).some((value,i)=>typeof value==='number'&&Number.isFinite(value)&&!isCategorical(template.parameters?.[i]));

// Numbers typed in a formula: decimals count by their digits (0.5 is 5, 3.75 is 375).
export function difficultyOfFormula(text){
 const numbers=String(text).match(/\d+(?:\.\d+)?/g)||[];
 let rank=1;
 for(const number of numbers)rank=Math.max(rank,valueRank(Number(number.replace('.','')),100));
 return rank;
}

const roundSig=(value,digits)=>{if(value===0)return 0;const power=10**(Math.floor(Math.log10(Math.abs(value)))-digits+1);return Math.round(value/power)*power;};
const onGrid=(domain,value)=>{const step=domain.step||1;return value>=domain.min&&value<=domain.max&&Math.abs((value-domain.min)/step-Math.round((value-domain.min)/step))<1e-9;};
// One value for a range or list domain whose rank is at most `target` (exactly `target` is encouraged by the caller's retries).
// Rule-generated questions draw their numbers with lesson.js `pick`; while a rank is active, `pick` favours numbers of that rank.
export const active={rank:undefined};
export function withRank(rank,fn){const before=active.rank;active.rank=rank;try{return fn();}finally{active.rank=before;}}
export function sampleValue(domain,target,rng=Math.random){
 const max=maxOf(domain);
 if(!Array.isArray(domain)&&Math.floor((domain.max-domain.min)/(domain.step||1))<64){
  // Small domains: choose among the values that fit the level (all of them when none is simple enough).
  const step=domain.step||1,all=[];for(let value=domain.min;value<=domain.max;value+=step)all.push(value);
  const fits=all.filter(value=>valueRank(value,max)<=target);
  const pool=fits.length?fits:all.filter(value=>valueRank(value,max)===Math.min(...all.map(v=>valueRank(v,max))));
  return pool[Math.floor(rng()*pool.length)];
 }
 if(Array.isArray(domain)){
  const fits=domain.filter(value=>valueRank(value,max)<=target);
  const pool=fits.length?fits:domain.filter(value=>valueRank(value,max)===Math.min(...domain.map(v=>valueRank(v,max))));
  return pool[Math.floor(rng()*pool.length)];
 }
 const step=domain.step||1,cells=Math.floor((domain.max-domain.min)/step)+1;
 const uniform=()=>domain.min+Math.floor(rng()*cells)*step;
 if(target>=3)return uniform();
 const cap=target===1?0.4:0.75,digits=target===1?1:2;
 const commons=target===1?[...COMMON].filter(value=>onGrid(domain,value)):[];
 for(let attempt=0;attempt<80;attempt++){
  if(commons.length&&rng()<0.35)return commons[Math.floor(rng()*commons.length)];
  let size=roundSig(max*cap*rng(),digits);
  if(domain.min<0&&rng()<0.5)size=-size;
  const snapped=Math.min(domain.max,Math.max(domain.min,domain.min+Math.round((size-domain.min)/step)*step));
  if(valueRank(snapped,max)<=target)return snapped;
 }
 // Nothing friendly fits: take the smallest value the domain allows.
 return Math.abs(domain.min)<=Math.abs(domain.max)?domain.min:domain.max;
}
