import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeRound,eligibleQuestions,parseAnswer,numericAnswer,answerRound,revealRound,advanceRound,score} from './model.js';
const grade=g=>({...JSON.parse(readFileSync(new URL(`../curriculum/data/ontario-math-grade-${g}.json`,import.meta.url))),questions:JSON.parse(readFileSync(new URL(`../curriculum/data/${g===5?'practice-questions':`grade-${g}-questions`}.json`,import.meta.url)))});
const find=(g,r)=>g.questions.find(q=>q.id===r.questions[r.index].templateId);
let seed=734;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
test('all grades can prepare five valid single-answer questions from eligible topics',()=>{
 for(const n of [4,5,6,7,8]){const g=grade(n);for(const topic of ['all',...g.curriculum.children.filter(s=>eligibleQuestions(g,s.id).length).map(s=>s.id)]){
  const r=makeRound(g,topic,rng,'round-'+n+topic);assert.equal(r.questions.length,5);assert.equal(r.status,'active');for(const q of r.questions)assert.doesNotThrow(()=>numericAnswer(g.questions.find(t=>t.id===q.templateId),q.values));
 }}
});
test('equivalent fractions and decimals compare exactly; arbitrary code is rejected',()=>{
 assert.deepEqual(parseAnswer('0.5'),parseAnswer('2/4'));assert.deepEqual(parseAnswer('-3/-6'),parseAnswer('1/2'));
 for(const input of ['1/0','2+3','Math.random()','<script>','NaN','Infinity','1e4'])assert.throws(()=>parseAnswer(input));
});
test('attempts are immutable, duplicate scoring is prevented, and explanations do not earn points',()=>{
 const g=grade(4),r=makeRound(g,'all',rng,'round');const t=find(g,r),expected=numericAnswer(t,r.questions[0].values);const input=`${expected.n}/${expected.d}`;
 const correct=answerRound(r,t,input);assert.equal(r.questions[0].attempts,0);assert.equal(score(correct),10);assert.throws(()=>answerRound(correct,t,input),/finished/);
 const next=advanceRound(correct);assert.equal(next.index,1);assert.throws(()=>advanceRound(next),/Finish/);
 const assisted=revealRound(next);assert.equal(score(assisted),10);assert.equal(assisted.questions[1].correct,false);assert.equal(assisted.questions[1].assisted,true);
 let current=advanceRound(assisted);while(current.status!=='complete')current=advanceRound(revealRound(current));assert.equal(score(current),10);assert.equal(current.status,'complete');
});
test('invalid input does not consume an attempt and retry points are bounded',()=>{
 const g=grade(6),r=makeRound(g,'all',rng,'retry'),t=find(g,r),expected=numericAnswer(t,r.questions[0].values);
 assert.throws(()=>answerRound(r,t,'2+2'));assert.equal(r.questions[0].attempts,0);
 const wrong=answerRound(r,t,`${expected.n+expected.d}/${expected.d}`);assert.equal(wrong.questions[0].correct,false);assert.equal(score(wrong),0);
 const correct=answerRound(wrong,t,`${expected.n}/${expected.d}`);assert.equal(score(correct),5);
});
import {playerKey,lastPlayed} from './model.js';
test('player names identify separate local histories and retain each last grade',()=>{
 assert.equal(playerKey('  Sam  Lee '),playerKey('sam lee'));
 assert.notEqual(playerKey('Sam'),playerKey('Alex'));
 const rounds=[{profileId:'sam',grade:4,updatedAt:10},{profileId:'alex',grade:6,updatedAt:30},{profileId:'sam',grade:7,updatedAt:20}];
 assert.equal(lastPlayed(rounds,playerKey('SAM')).grade,7);
 assert.equal(lastPlayed(rounds,playerKey('Alex')).grade,6);
 assert.equal(lastPlayed(rounds,'new player'),undefined);
 assert.throws(()=>playerKey('   '));assert.throws(()=>playerKey('a'.repeat(41)));
});
import {battleState} from './model.js';
test('battle state is derived from answers: hits remove hearts, misses move the zombie closer (capped), win needs a majority',()=>{
 const q=(o={})=>({attempts:0,correct:false,assisted:false,...o});
 const round=(questions,status='active')=>({status,questions});
 assert.deepEqual(battleState(round([q(),q(),q(),q(),q()])),{hits:0,total:5,hearts:5,misses:0,done:false,won:false});
 const mid=battleState(round([q({attempts:2,correct:true}),q({attempts:1}),q({assisted:true}),q(),q()]));
 assert.equal(mid.hits,1);assert.equal(mid.hearts,4);assert.equal(mid.misses,3);
 assert.equal(battleState(round(Array(5).fill(q({attempts:6,assisted:true})))).misses,4);
 assert.equal(battleState(round([q({attempts:1,correct:true}),q({attempts:1,correct:true}),q({attempts:1,correct:true}),q({assisted:true}),q({assisted:true})],'complete')).won,true);
 assert.equal(battleState(round([q({attempts:1,correct:true}),q({attempts:1,correct:true}),q({assisted:true}),q({assisted:true}),q({assisted:true})],'complete')).won,false);
});
