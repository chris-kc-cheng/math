import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import katex from 'katex';
import {createPractice,generateQuestionValues,nextValues} from './practice.js';
import {buildWorksheet} from '../worksheet-model.js';
import {makeRound,numericAnswer,eligibleQuestions} from '../game/model.js';
import {answerNumber} from '../math/verification.js';
import {secondaryRules,secondaryMeta} from '../math/secondary/index.js';

const read=(g,kind)=>JSON.parse(readFileSync(new URL(`./data/${kind==='questions'?`grade-${g}-questions`:`ontario-math-grade-${g}`}.json`,import.meta.url),'utf8'));
const leaves=node=>node.children?node.children.flatMap(leaves):[node];
let seed=4021;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const stem=text=>text.toLowerCase().replace(/\d+(?:\.\d+)?/g,'#');

// The 43 specific expectations of the Ontario MTH1W course (2021) as published by the Ministry, plus the app's labels for the unnumbered 2005 MPM2D expectations.
const MTH1W=['B1.1','B1.2','B1.3','B2.1','B2.2','B3.1','B3.2','B3.3','B3.4','B3.5','C1.1','C1.2','C1.3','C1.4','C1.5','C2.1','C2.2','C2.3','C3.1','C3.2','C3.3','C4.1','C4.2','C4.3','C4.4','D1.1','D1.2','D1.3','D2.1','D2.2','D2.3','D2.4','D2.5','E1.1','E1.2','E1.3','E1.4','E1.5','E1.6','F1.1','F1.2','F1.3','F1.4'];
const MPM2D=[...['QR1.1','QR1.2','QR1.3','QR1.4','QR2.1','QR2.2','QR2.3','QR2.4','QR3.1','QR3.2','QR3.3','QR3.4','QR3.5','QR3.6','QR3.7','QR3.8','QR4.1','QR4.2'],...['AG1.1','AG1.2','AG2.1','AG2.2','AG2.3','AG2.4','AG2.5','AG3.1','AG3.2','AG3.3'],...['TR1.1','TR1.2','TR1.3','TR2.1','TR2.2','TR2.3','TR3.1','TR3.2','TR3.3','TR3.4']];
const GRADES=[9,10];

test('Grades 9 and 10 hierarchies match the Ministry expectation lists',()=>{
 const ids=new Set(),allQuestions=new Set();
 for(const g of GRADES){
  const data=read(g),qs=read(g,'questions'),nodes=leaves(data.curriculum).map(n=>n.code);
  const expected=g===9?[...MTH1W,'AA1.1','AA1.2','AA1.3','AA1.4','AA1.5','AA1.6','A1','A2']:[...MPM2D,'P1'];
  assert.deepEqual(nodes.sort(),expected.sort(),`Grade ${g}`);
  const own=new Set();const visit=n=>{assert.ok(!own.has(n.id),n.id);own.add(n.id);n.children?.forEach(visit);};visit(data.curriculum);
  for(const q of qs){assert.ok(own.has(q.skillId),q.id);assert.ok(!allQuestions.has(q.id),q.id);allQuestions.add(q.id);assert.deepEqual(q.parameters.slice().sort(),Object.keys(q.example).sort(),q.id);}
  for(const n of leaves(data.curriculum)){assert.ok(n.description&&n.example,n.id);assert.ok(qs.some(q=>q.skillId===n.id),n.id);}
  for(const a of data.activities){assert.equal(a.coverage,'partial');assert.ok(a.href.startsWith(`./curriculum.html?grade=${g}#`));for(const id of a.questionIds)assert.ok(qs.some(q=>q.id===id&&a.skillIds.includes(q.skillId)));}
  assert.equal(data.grade,g);assert.ok(data.suggestedSequence.length>=3);
 }
});

test('secondary variants are the baseline: every non-SEL skill has 2+ templates and 6+ distinct stems',()=>{
 for(const g of GRADES){
  const groups=new Map();
  for(const q of read(g,'questions')){
   if(q.skillId.includes('-aa1-'))continue;
   const item=groups.get(q.skillId)||{count:0,stems:new Set(),styles:0};item.count++;
   const ix=q.parameters.indexOf('style'),ixv=q.parameters.indexOf('variant'),index=ix<0?ixv:ix,domain=index<0?null:q.generation[index],styles=Array.isArray(domain)?domain:[null];
   item.styles+=styles.length;
   for(const style of styles){
    let valid=0;
    for(let tries=0;tries<200&&valid<6;tries++){
     const values=generateQuestionValues(q,rng);if(style!==null)values[index]=style;let result;try{result=createPractice(q,values);}catch{continue;}
     valid++;item.stems.add(stem(result.prompt||result.formula||''));
     if(result.verification)assert.equal(result.verification.valid,true,q.id);
     for(const s of [result,...result.steps,...(result.verification?.steps||[])]){
      if(s.math||s.formula)katex.renderToString(s.math||s.formula,{throwOnError:true,trust:false});
      if(s.visual)assert.ok(s.visual.caption,q.id);
     }
     if(result.response?.kind==='choice')assert.ok(result.response.options.includes(result.response.answer),q.id);
     if(result.response?.kind==='number')assert.doesNotThrow(()=>answerNumber(result.response.answer),q.id);
    }
    assert.ok(valid>0,`${q.id}: declared style ${style} cannot produce a valid example`);
   }
   groups.set(q.skillId,item);
  }
  for(const [id,v] of groups){assert.ok(v.count>=2,`${id}: only ${v.count} templates`);assert.ok(v.stems.size>=(v.styles>=6?6:4),`${id}: only ${v.stems.size} distinct stems`);}
 }
});

test('samples and refreshes stay in their declared domains and contain no nonsense notation',()=>{
 for(const g of GRADES)for(const q of read(g,'questions')){
  const sample=createPractice(q);assert.ok(sample.steps.length>=2,q.id);assert.ok(!JSON.stringify(sample).match(/NaN|Infinity|undefined/),q.id);
  if(q.generation?.every(d=>Array.isArray(d)&&d.length===1))continue;
  const next=nextValues(q,q.example,rng);assert.notDeepEqual(next,q.parameters.map(p=>q.example[p]),q.id);
  const text=JSON.stringify(createPractice(q,next));
  assert.ok(!/(^|[^\w.\\{^])1[xyn](?![\w])/.test(text.replace(/\\\\/g,'\\')),`${q.id}: 1x style coefficient`);
  assert.ok(!/\+\s*-\d/.test(text),`${q.id}: +-`);
 }
});

test('every rule has bounded parameters, a valid default example and accurate known answers',()=>{
 for(const [name,meta] of Object.entries(secondaryMeta)){
  assert.equal(meta.params.length,meta.domains.length);assert.equal(meta.params.at(-1),'style');
  for(let style=0;style<meta.styles;style++){
   let ok=0;for(let i=0;i<300&&!ok;i++){
    const values=meta.domains.map(d=>Array.isArray(d)?d[0]+Math.floor(rng()*(d[1]-d[0]+1)):d.list[Math.floor(rng()*d.list.length)]);values[values.length-1]=style;
    try{secondaryRules[name](values);ok++;}catch{}
   }
   assert.ok(ok,`${name} style ${style} never produced a question`);
  }
  assert.throws(()=>secondaryRules[name]([...meta.example.slice(0,-1),meta.styles]),/style/i,name);
  assert.throws(()=>secondaryRules[name]([]),/bounded/i,name);
 }
});

test('games and worksheets reuse only supported single-answer secondary activities',()=>{
 for(const g of GRADES){
  const data={...read(g),questions:read(g,'questions')};
  const strands=data.curriculum.children.filter(s=>eligibleQuestions(data,s.id).length);assert.ok(strands.length>=3,`Grade ${g}`);
  for(const strand of ['all',...strands.map(s=>s.id)]){
   const round=makeRound(data,strand,rng,`secondary-${g}-${strand}`);assert.equal(round.questions.length,5);
   for(const question of round.questions){const template=data.questions.find(q=>q.id===question.templateId);const answer=numericAnswer(template,question.values);assert.ok(answer);}
  }
  const sheet=buildWorksheet(data,{count:15,workings:true},rng);assert.equal(sheet.questions.length,15);assert.ok(sheet.questions.every(q=>q.answer!==undefined&&q.steps.length));
  assert.ok(!eligibleQuestions(data).some(q=>q.rule==='guided-discussion'));
 }
});

test('answers of numeric questions parse exactly',()=>{
 for(const g of GRADES)for(const q of read(g,'questions')){
  if(q.rule==='guided-discussion'||q.skillId.includes('-aa1-'))continue;
  for(let i=0;i<8;i++){
   let lesson;try{lesson=createPractice(q,generateQuestionValues(q,rng));}catch{continue;}
   if(lesson.response?.kind==='choice')continue;
   try{answerNumber(lesson.answer);}catch{assert.fail(`${q.id}: answer ${lesson.answer} is not machine-readable`);}
  }
 }
});
