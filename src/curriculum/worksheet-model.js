import {eligibleQuestions,findNode} from '../game/model.js';
import {createPractice,generateQuestionValues} from './practice.js';
import {AUTO,normalizeChoice,levelFor,difficultyOf,isRated,levelById} from './difficulty.js';

// Pure worksheet builder (no DOM): the same exact-arithmetic questions as Math quest, laid out for paper.
export const DEFAULT_COUNT=10,MAX_COUNT=50;
const stripCode=title=>title.replace(/^[A-F]\d+ · /,'');
export const clampCount=value=>{const n=Math.floor(Number(value));return Number.isFinite(n)?Math.max(1,Math.min(MAX_COUNT,n)):DEFAULT_COUNT;};

export function topicNames(grade,topics){
 return topics.map(id=>findNode(grade.curriculum,id)?.title).filter(Boolean).map(stripCode);
}
// `topics` is a list of strand/topic ids; an empty list means every topic. Questions repeat a template only after the pool is used up,
// and an identical question (same template and numbers) is never printed twice.
// `difficulty` is 'simple', 'medium', 'hard' or 'auto' (progressive: the sheet starts simple and ends hard).
export function buildWorksheet(grade,{topics=[],count=DEFAULT_COUNT,workings=false,difficulty=AUTO}={},rng=Math.random){
 const choice=normalizeChoice(difficulty);
 count=clampCount(count);
 const pool=eligibleQuestions(grade,topics);
 if(!pool.length)throw Error('No printable questions are available for these topics yet.');
 const shuffled=[...pool];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const questions=[],seen=new Set();
 for(let i=0;i<count;i++){
  const template=shuffled[i%shuffled.length];let made;
  for(let attempt=0;attempt<100&&!made;attempt++){
   const values=generateQuestionValues(template,rng,levelFor(choice,i,count)),key=`${template.id}:${JSON.stringify(values)}`;if(seen.has(key))continue;
   let lesson;try{lesson=createPractice(template,values);}catch{continue;}
   if(lesson.answer===undefined||typeof lesson.answer==='object')continue;
   seen.add(key);
   made={number:questions.length+1,title:template.title,...(isRated(template,values)?{level:difficultyOf(template,values)}:{}),skillId:template.skillId,prompt:lesson.prompt||'',formula:lesson.formula||'',visual:lesson.visual,answer:String(lesson.answer),
    steps:lesson.steps.slice(1).filter(step=>step.text||step.math||step.visual).map(({text,math,visual})=>({text,math,visual}))};
  }
  if(made)questions.push(made);
 }
 if(!questions.length)throw Error('Could not prepare questions for these topics. Try another selection.');
 return {grade:grade.grade,topics:topicNames(grade,topics),workings:Boolean(workings),difficulty:choice,questions};
}
