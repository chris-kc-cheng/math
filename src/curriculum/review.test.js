import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPractice} from './practice.js';
const read=name=>JSON.parse(readFileSync(new URL(`./data/${name}.json`,import.meta.url),'utf8'));
const question=(file,id)=>read(file).find(q=>q.id===id);
const visible=lesson=>lesson.steps.slice(1);

test('Ontario strand A comes first under its official 2020 name in every grade',()=>{
 for(const grade of [4,5,6,7,8]){
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
