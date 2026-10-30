import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPractice} from './practice.js';
const read=name=>JSON.parse(readFileSync(new URL(`./data/${name}.json`,import.meta.url),'utf8'));
const question=(file,id)=>read(file).find(q=>q.id===id);
const visible=lesson=>lesson.steps.slice(1);

test('Ontario strand A comes first under its official 2020 name in every grade',()=>{
 for(const grade of [1,2,3,4,5,6,7,8]){
  const [first]=read(`ontario-math-grade-${grade}`).curriculum.children;
  assert.equal(first.code,'A');assert.match(first.title,/^Social-emotional learning skills/);
 }
});
test('rounding names the deciding digit instead of quoting a zero-based rule',()=>{
 const steps=visible(createPractice(question('grade-4-questions','g4-question-b1-3')));
 assert.match(steps[0].text,/hundred.*It is 3/);assert.match(steps[1].text,/round down/);
 assert.ok(!JSON.stringify(steps).includes('away from zero'));
});
test('grade 4 division shows a quotient and remainder, and one-digit work has no placeholder step',()=>{
 const steps=visible(createPractice(question('grade-4-questions','g4-question-b2-6')));
 assert.equal(steps.length,1);assert.match(steps[0].math,/22\\text\{ R \}2=22\\frac\{2\}\{7\}/);
 assert.ok(!JSON.stringify(steps).includes('(7)'));
});
test('ordering decimals stays in decimals and does not mention negatives',()=>{
 const steps=visible(createPractice(question('grade-4-questions','g4-question-b1-7')));
 assert.equal(steps.at(-1).math,'0.3\\le0.7\\le1.2');assert.ok(!/Negative/.test(steps.at(-1).text));
});
test('simplifying 7/10 says it is already simplest instead of dividing by a factor',()=>{
 assert.match(visible(createPractice(question('grade-4-questions','g4-question-b1-9'))).at(-1).text,/already in simplest form/);
});
test('multi-step rate and percent problem answers the question it asks and verifies',()=>{
 const lesson=createPractice(question('grade-6-questions','g6-question-b2-1'));
 assert.equal(lesson.answer,'24');assert.equal(lesson.verification.valid,true);
});

test("primary reverse metric variants stay within primary whole-number ranges",()=>{
 for(const q of read("grade-3-questions").filter(q=>q.rule==="primary-metric"&&q.example.style===2))assert.deepEqual(q.generation[1],[0,1]);
});

test('primary diagrams reveal sharing progressively and avoid repeating the question clock',()=>{
 const sharing=createPractice(read('grade-1-questions').find(q=>q.rule==='primary-fair-share'));
 assert.equal(sharing.visual.type,'primary-counters');
 const models=sharing.steps.filter(s=>s.visual).map(s=>s.visual);
 assert.equal(models[0].wholeOnly,true);assert.equal(models[1].type,'primary-share');assert.ok(!models[1].wholeOnly);
 const clock=createPractice(read('grade-3-questions').find(q=>q.rule==='primary-clock'));
 assert.equal(clock.visual.type,'primary-clock');assert.ok(clock.steps.every(s=>s.visual?.type!=='primary-clock'));
});

test('early equal-group explanations state the answer without introducing division notation',async()=>{
 const {createPrimary}=await import('../math/families/primary/index.js');
 const groups=createPrimary('primary-groups',[4,2,1,1,2,1]),share=createPrimary('primary-groups',[4,2,1,2,0,1]);
 assert.match(groups.steps.at(-1).text,/4 groups/);assert.match(share.steps.at(-1).text,/2 counters/);
 assert.equal(groups.steps.at(-1).math,undefined);assert.equal(share.steps.at(-1).math,undefined);
});
