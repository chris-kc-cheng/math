import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import katex from 'katex';
import {createPractice,generateQuestionValues,nextValues} from './practice.js';
import {buildWorksheet} from './worksheet-model.js';
import {makeRound,numericAnswer,eligibleQuestions} from '../game/model.js';
const read=(g,kind)=>JSON.parse(readFileSync(new URL(`./data/${kind==='questions'?`grade-${g}-questions`:`ontario-math-grade-${g}`}.json`,import.meta.url),'utf8'));
const leaves=node=>node.children?node.children.flatMap(leaves):[node];
let seed=9173;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const stem=text=>text.toLowerCase().replace(/\d+(?:\.\d+)?/g,'#').replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)\b/g,'#');

test('primary hierarchies match the independently extracted Ontario expectation code sets',()=>{
 const counts={1:[8,5,4,3,2,1,5,2,5,3,1],2:[7,6,4,3,2,1,5,2,5,4,1],3:[7,9,4,3,2,1,5,2,4,9,1]},topics=['B1','B2','C1','C2','C3','C4','D1','D2','E1','E2','F1'];
 const all=new Set();for(const g of [1,2,3]){
  const data=read(g),qs=read(g,'questions'),nodes=leaves(data.curriculum),expected=topics.flatMap((t,i)=>Array.from({length:counts[g][i]},(_,j)=>t==='C4'?'C4':`${t}.${j+1}`));
  expected.push(...Array.from({length:6},(_,i)=>`A1.${i+1}`));assert.deepEqual(nodes.map(n=>n.code).sort(),expected.sort());assert.deepEqual(data.curriculum.children.map(s=>s.code),['A','B','C','D','E','F']);
  const ids=new Set();const visit=n=>{assert.ok(!ids.has(n.id),n.id);ids.add(n.id);n.children?.forEach(visit);};visit(data.curriculum);
  for(const q of qs){assert.ok(ids.has(q.skillId));assert.ok(!all.has(q.id));all.add(q.id);assert.deepEqual(q.parameters.slice().sort(),Object.keys(q.example).sort());}
  for(const n of nodes){assert.ok(n.description&&n.example);assert.ok(qs.some(q=>q.skillId===n.id));}
  for(const a of data.activities){assert.equal(a.coverage,'partial');assert.ok(a.href.startsWith(`./curriculum.html?grade=${g}#`));for(const id of a.questionIds)assert.ok(qs.some(q=>q.id===id&&a.skillIds.includes(q.skillId)));}
 }
});

test('rich variants are the baseline: every non-SEL primary skill has 2+ templates and 3+ distinct stems',()=>{
 for(const g of [1,2,3]){
  const groups=new Map();for(const q of read(g,'questions')){
   if(q.skillId.includes('-a1-'))continue;const item=groups.get(q.skillId)||{count:0,stems:new Set()};item.count++;
   const ix=q.parameters.indexOf('style'),domain=ix<0?null:q.generation[ix],styles=Array.isArray(domain)?domain:[null];
   for(const style of styles){let valid=0;for(let tries=0;tries<100&&valid<10;tries++){
    const values=generateQuestionValues(q,rng);if(style!==null)values[ix]=style;let result;try{result=createPractice(q,values);}catch{continue;}valid++;
    item.stems.add(stem(result.prompt||result.formula||''));if(result.verification)assert.equal(result.verification.valid,true,q.id);
    for(const s of [result,...result.steps,...(result.verification?.steps||[])]){
     if(s.math||s.formula)katex.renderToString(s.math||s.formula,{throwOnError:true,trust:false});if(s.visual)assert.ok(s.visual.caption,q.id);
    }
    if(result.response?.kind==='choice')assert.ok(result.response.options.includes(result.response.answer),q.id);
   }assert.ok(valid>0,`${q.id}: declared style ${style} cannot produce a valid example`);}
   groups.set(q.skillId,item);
  }
  for(const [id,v] of groups){assert.ok(v.count>=2,`${id}: only ${v.count} templates`);assert.ok(v.stems.size>=3,`${id}: only ${v.stems.size} non-number stems`);}
 }
});

test('primary samples and refreshes remain in their declared teaching domains',()=>{
 for(const g of [1,2,3])for(const q of read(g,'questions')){
  const sample=createPractice(q);assert.ok(sample.steps.length>=2,q.id);assert.ok(!JSON.stringify(sample).match(/NaN|Infinity/),q.id);
  if(q.generation?.every(d=>Array.isArray(d)&&d.length===1))continue; const next=nextValues(q,q.example,rng);assert.notDeepEqual(next,q.parameters.map(p=>q.example[p]),q.id);createPractice(q,next);
 }
});

test('games and printable worksheets reuse only supported primary single-answer activities',()=>{
 for(const g of [1,2,3]){
  const data={...read(g),questions:read(g,'questions')};
  for(const strand of ['all',...data.curriculum.children.filter(s=>eligibleQuestions(data,s.id).length).map(s=>s.id)]){
   const round=makeRound(data,strand,rng,`primary-${g}-${strand}`);assert.equal(round.questions.length,5);
   for(const question of round.questions)numericAnswer(data.questions.find(q=>q.id===question.templateId),question.values);
  }
  const sheet=buildWorksheet(data,{count:12,workings:true},rng);assert.equal(sheet.questions.length,12);assert.ok(sheet.questions.every(q=>q.answer!==undefined&&q.steps.length));
  assert.ok(!eligibleQuestions(data).some(q=>['guided-discussion','primary-fair-share','primary-likelihood','primary-pattern'].includes(q.rule)));
 }
});
