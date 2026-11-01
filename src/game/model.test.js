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
 assert.deepEqual(battleState(round([q(),q(),q(),q(),q()])),{hits:0,total:5,hearts:5,lives:5,maxLives:5,crying:false,misses:0,done:false,won:false});
 const mid=battleState(round([q({attempts:2,correct:true}),q({attempts:1}),q({assisted:true}),q(),q()]));
 assert.equal(mid.hits,1);assert.equal(mid.hearts,4);assert.equal(mid.misses,3);
 assert.equal(battleState(round(Array(5).fill(q({attempts:6,assisted:true})))).misses,4);
 assert.equal(battleState(round([q({attempts:1,correct:true}),q({attempts:1,correct:true}),q({attempts:1,correct:true}),q({assisted:true}),q({assisted:true})],'complete')).won,true);
 assert.equal(battleState(round([q({attempts:1,correct:true}),q({attempts:1,correct:true}),q({assisted:true}),q({assisted:true}),q({assisted:true})],'complete')).won,false);
});
import {recentRate,levelOf,progressTree,attemptHistory} from './model.js';
test('topic rate uses only the last ten finished questions; no attempts means no stat',()=>{
 assert.equal(recentRate([]),null);assert.equal(levelOf(null),'none');
 const attempts=[...Array(5).fill({correct:false}),...Array(10).fill({correct:true})];
 assert.deepEqual(recentRate(attempts),{rate:1,attempts:10});
 assert.equal(levelOf({rate:0.8}),'good');assert.equal(levelOf({rate:0.79}),'fair');assert.equal(levelOf({rate:0.5}),'fair');assert.equal(levelOf({rate:0.49}),'weak');
});
test('progress tree rolls skill attempts up to topics and strands per player and grade',()=>{
 const g=grade(5),pool=g.questions.filter(q=>{try{numericAnswer(q,q.example);return true;}catch{return false;}}),[a,b]=pool.filter((q,i,all)=>all.findIndex(x=>x.skillId===q.skillId)===i);
 const mk=(t,correct)=>({templateId:t.id,attempts:1,correct,assisted:!correct,entry:''});
 const rounds=[{profileId:'sam',grade:5,updatedAt:2,questions:[mk(a,true),mk(a,false),{templateId:a.id,attempts:0,correct:false,assisted:false}]},{profileId:'sam',grade:5,updatedAt:1,questions:[mk(b,true)]},{profileId:'ava',grade:5,updatedAt:3,questions:[mk(a,false)]},{profileId:'sam',grade:4,updatedAt:3,questions:[mk(a,false)]}];
 assert.equal(attemptHistory(g,rounds,'sam').length,3);
 const flat=n=>[n,...(n.children||[]).flatMap(flat)],nodes=progressTree(g,rounds,'sam').flatMap(flat);
 const skillA=nodes.find(n=>n.id===a.skillId),skillB=nodes.find(n=>n.id===b.skillId);
 assert.deepEqual(skillA.stat,{rate:0.5,attempts:2});assert.equal(skillA.status,'fair');assert.equal(skillB.status,'good');
 assert.ok(progressTree(g,[],'sam').flatMap(flat).every(n=>n.status==='none'&&n.stat===null));
 assert.ok(progressTree(g,rounds,'sam').every(s=>s.stat===null||s.stat.attempts>=1));
});
test('the hero loses a life per wrong answer (not per explanation), floors at zero and cries instead of dying',()=>{
 const q=(o={})=>({attempts:0,correct:false,assisted:false,...o}),round=questions=>({status:'active',questions});
 const two=battleState(round([q({attempts:3,correct:true}),q({attempts:1}),q(),q(),q()]));
 assert.equal(two.lives,2);assert.equal(two.crying,false);
 assert.equal(battleState(round([q({assisted:true}),q(),q(),q(),q()])).lives,5);
 const out=battleState(round([q({attempts:9}),q(),q(),q(),q()]));assert.equal(out.lives,0);assert.equal(out.crying,true);
});
import {topicOptions,findNode,roundTopics,topicKey} from './model.js';
test('learners can practise a strand, a topic within it, or all topics',()=>{
 const g=grade(5),options=topicOptions(g),topic=options.find(o=>o.level==='topic'),strand=options.find(o=>o.level==='strand');
 assert.ok(strand&&topic&&options.every(o=>eligibleQuestions(g,o.id).length>0));
 assert.ok(!options.some(o=>o.title.startsWith('Social-emotional')));
 const inTopic=new Set(eligibleQuestions(g,topic.id).map(q=>q.id)),inStrand=new Set(eligibleQuestions(g,strand.id).map(q=>q.id));
 assert.ok(inTopic.size>0&&inTopic.size<=eligibleQuestions(g).length);assert.ok([...inTopic].every(id=>inStrand.size>=inTopic.size));
 const round=makeRound(g,topic.id,rng,'topic-round');assert.deepEqual(roundTopics(round),[topic.id]);
 const allowed=new Set(g.questions.filter(q=>inTopic.has(q.id)).map(q=>q.skillId));
 for(const q of round.questions)assert.ok(allowed.has(g.questions.find(t=>t.id===q.templateId).skillId));
 assert.equal(findNode(g.curriculum,topic.id).id,topic.id);
});
test('several topics can be combined, legacy rounds still read, and every grade offers Data',()=>{
 for(const n of [4,5,6,7,8]){const g=grade(n),options=topicOptions(g);assert.ok(options.some(o=>o.level==='strand'&&/^Data/.test(o.title)),'Data in grade '+n);}
 const g=grade(5),topics=topicOptions(g).filter(o=>o.level==='topic').slice(0,2).map(o=>o.id),pool=new Set(eligibleQuestions(g,topics).map(q=>q.id));
 const each=topics.flatMap(id=>eligibleQuestions(g,id).map(q=>q.id));assert.deepEqual([...pool].sort(),[...new Set(each)].sort());
 const round=makeRound(g,topics,rng,'multi');assert.deepEqual(roundTopics(round),topics);
 assert.deepEqual(roundTopics({strand:'all'}),[]);assert.deepEqual(roundTopics({strand:'b'}),['b']);assert.equal(topicKey(['b','a']),topicKey(['a','b']));
});
test('single-answer data questions are scored and verified',()=>{
 const g=grade(5);for(const rule of ['data-measure','probability-single']){const t=g.questions.find(q=>q.rule===rule);assert.ok(t,rule);assert.doesNotThrow(()=>numericAnswer(t,t.example));}
 const mean=g.questions.find(q=>q.rule==='data-measure');assert.equal(numericAnswer(mean,mean.example).n,4n);
});

import {answerAndExplainRound} from './model.js';
test('every submitted practice answer finishes with an explanation and preserves honest scoring',()=>{
 const g=grade(1),round=makeRound(g,'all',rng,'automatic-explanation'),template=find(g,round),answer=numericAnswer(template,round.questions[0].values);
 const correct=answerAndExplainRound(round,template,`${answer.n}/${answer.d}`);
 assert.equal(correct.questions[0].correct,true);assert.equal(correct.questions[0].assisted,false);assert.equal(score(correct),10);assert.equal(advanceRound(correct).index,1);
 const wrong=answerAndExplainRound(round,template,`${answer.n+answer.d}/${answer.d}`);
 assert.equal(wrong.questions[0].correct,false);assert.equal(wrong.questions[0].assisted,true);assert.equal(score(wrong),0);assert.equal(advanceRound(wrong).index,1);
 assert.equal(battleState(wrong).lives,4);assert.equal(battleState(wrong).misses,1);assert.throws(()=>answerAndExplainRound(wrong,template,`${answer.n}/${answer.d}`),/finished/);
 assert.throws(()=>answerAndExplainRound(round,template,'2+3'));assert.equal(round.questions[0].attempts,0);
});
test('practice rounds honour the selected length and complete at its last question',()=>{
 const g=grade(2);
 for(const count of [1,5,10,20,37,50]){let round=makeRound(g,'all',rng,'length-'+count,count);assert.equal(round.questions.length,count);for(let i=0;i<count;i++)round=advanceRound(revealRound(round));assert.equal(round.status,'complete');assert.equal(round.index,count-1);}
 for(const count of [0,51,2.5,NaN])assert.throws(()=>makeRound(g,'all',rng,'invalid',count),/1 and 50/);
});
test('rounds follow the chosen difficulty; auto starts simple and ends hard',()=>{
 const g=grade(5);
 const levels=(difficulty,count=9)=>makeRound(g,'all',rng,'d-'+difficulty,count,difficulty).questions.map(q=>q.level);
 const auto=levels('auto');
 assert.equal(auto[0],1);assert.equal(auto.at(-1),3);
 assert.deepEqual([...auto].sort(),auto,'levels never go down');
 assert.equal(makeRound(g,'all',rng,'x',9).difficulty,'auto');
 const simple=levels('simple'),hard=levels('hard'),mean=list=>list.reduce((a,b)=>a+b,0)/list.length;
 assert.ok(mean(simple)<1.5&&mean(hard)>2.2,`${mean(simple)} ${mean(hard)}`);
 for(const round of [makeRound(g,'all',rng,'y',6,'medium')])assert.equal(round.difficulty,'medium');
 assert.equal(makeRound(g,'all',rng,'z',3,'nonsense').difficulty,'auto');
});
