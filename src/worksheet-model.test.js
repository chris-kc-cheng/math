import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildWorksheet,clampCount,DEFAULT_COUNT,MAX_COUNT} from './worksheet-model.js';
import {topicOptions} from './game/model.js';

const grade=n=>({...JSON.parse(readFileSync(new URL(`./curriculum/data/ontario-math-grade-${n}.json`,import.meta.url))),questions:JSON.parse(readFileSync(new URL(`./curriculum/data/${n===5?'practice-questions':`grade-${n}-questions`}.json`,import.meta.url)))});
let seed=99;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);

test('the worksheet defaults to ten numbered questions, each with an answer and worked steps',()=>{
 for(const n of [4,5,6,7,8]){
  const sheet=buildWorksheet(grade(n),{},rng);
  assert.equal(sheet.questions.length,DEFAULT_COUNT);assert.deepEqual(sheet.questions.map(q=>q.number),[...Array(DEFAULT_COUNT).keys()].map(i=>i+1));
  for(const q of sheet.questions){assert.ok(q.prompt||q.formula,`grade ${n} ${q.title}`);assert.ok(q.answer!==''&&!q.answer.includes('undefined'));assert.ok(q.steps.length>=1);}
 }
});
test('count is clamped to a sensible range and questions are never identical',()=>{
 assert.equal(clampCount('abc'),DEFAULT_COUNT);assert.equal(clampCount(0),1);assert.equal(clampCount(500),MAX_COUNT);assert.equal(clampCount(7.9),7);
 const sheet=buildWorksheet(grade(5),{count:MAX_COUNT},rng);
 const keys=sheet.questions.map(q=>`${q.title}|${q.prompt}|${q.formula}`);assert.equal(new Set(keys).size,keys.length);
});
test('only questions from the chosen topics are used, and an empty choice means all topics',()=>{
 const g=grade(5),topic=topicOptions(g).find(o=>o.level==='topic'&&o.title==='Operations');
 const only=buildWorksheet(g,{topics:[topic.id],count:10},rng),all=buildWorksheet(g,{topics:[],count:10},rng);
 assert.deepEqual(only.topics,['Operations']);assert.deepEqual(all.topics,[]);
 const allowed=new Set(g.questions.filter(q=>q.skillId.startsWith('b2')).map(q=>q.skillId));
 assert.ok(only.questions.every(q=>allowed.has(q.skillId)),'topic restriction');
 assert.equal(all.questions.length,10);
});
test('the workings flag is carried through and the first hidden "Read the question" step is never printed',()=>{
 const sheet=buildWorksheet(grade(4),{workings:true},rng);assert.equal(sheet.workings,true);
 for(const q of sheet.questions)assert.ok(q.steps.every(s=>s.text!=='Read the question.'));
});
