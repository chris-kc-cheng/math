import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import katex from 'katex';
import {createPractice,generateQuestionValues,nextValues} from './practice.js';
const read=name=>JSON.parse(readFileSync(new URL(`./data/${name}.json`,import.meta.url),'utf8'));
const grades=[4,6,7];
let seed=71643;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
function leaves(node){return node.children?node.children.flatMap(leaves):[node];}

test('Grades 4, 6, 7 match audited expectation codes and resolve every activity',()=>{
 const counts={4:[9,8,4,3,2,1,6,2,3,6,5,6],6:[6,12,4,4,2,1,6,2,4,6,5,6],7:[7,10,4,4,2,1,6,2,4,7,6,6]};
 const topics=['B1','B2','C1','C2','C3','C4','D1','D2','E1','E2','F1','A1'];
 const globalIds=new Set();
 for(const grade of grades){
  const data=read(`ontario-math-grade-${grade}`),questions=read(`grade-${grade}-questions`),expected=topics.flatMap((topic,i)=>Array.from({length:counts[grade][i]},(_,n)=>topic==='C4'?'C4':`${topic}.${n+1}`));
  const nodes=leaves(data.curriculum);assert.deepEqual(nodes.map(n=>n.code).sort(),expected.sort());
  const ids=new Set();const visit=n=>{assert.ok(!ids.has(n.id),n.id);ids.add(n.id);n.children?.forEach(visit);};visit(data.curriculum);
  for(const n of nodes){assert.ok(n.description&&n.example);assert.ok(questions.some(q=>q.skillId===n.id),n.id);}
  for(const q of questions){assert.ok(!globalIds.has(q.id),q.id);globalIds.add(q.id);assert.ok(ids.has(q.skillId));assert.deepEqual(Object.keys(q.example).sort(),[...q.parameters].sort());}
  for(const a of data.activities){assert.ok(a.href.startsWith(`./curriculum.html?grade=${grade}#`));assert.equal(a.coverage,'partial');for(const id of a.questionIds)assert.ok(questions.some(q=>q.id===id&&a.skillIds.includes(q.skillId)));}
 }
});

test('all new grade examples and randomized lessons are exact, renderable, and refreshable',()=>{
 for(const grade of grades)for(const q of read(`grade-${grade}-questions`))for(let i=0;i<30;i++){
  const values=i?generateQuestionValues(q,rng):q.example,result=createPractice(q,values);
  assert.ok(result.prompt||result.formula,q.id);assert.ok(result.steps.length>=2,q.id);
  assert.ok(!JSON.stringify(result).match(/NaN|Infinity|undefined/),q.id);
  if(result.verification)assert.equal(result.verification.valid,true,q.id);
  for(const s of [result,...result.steps,...(result.verification?.steps||[])]){
   if(s.math||s.formula)assert.doesNotThrow(()=>katex.renderToString(s.math||s.formula,{throwOnError:true,trust:false}),q.id);
   if(s.visual)assert.ok(s.visual.caption,q.id);
  }
  if(!q.generation?.every(d=>Array.isArray(d)&&d.length===1))assert.notDeepEqual(nextValues(q,values,rng),Array.isArray(values)?values:q.parameters.map(k=>values[k]),q.id);
  if(q.answerMinimum===0)assert.ok(!String(result.answer).startsWith('-'),q.id);
 }
});

test('template generation enforces grade bounds instead of inheriting a higher-grade domain',()=>{
 const q=read('grade-4-questions').find(q=>q.rule==='expanded-number');
 assert.throws(()=>createPractice(q,[10001,0]),/domain/);
 assert.equal(createPractice(q,[10000,0]).answer,'10000');
 for(let i=0;i<100;i++)assert.ok(generateQuestionValues(q,rng)[0]<=10000);
 const tenths=read('grade-4-questions').find(q=>q.rule==='decimal-calculate'&&q.example.leftPlaces===1);
 assert.throws(()=>createPractice(tenths,[1,2,1,1,1]),/below/);
 const signed=read('grade-7-questions').find(q=>q.rule==='rational-order');
 assert.ok(createPractice(signed).answer.includes('-'));
});
