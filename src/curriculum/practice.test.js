import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPractice,generateQuestionValues,nextValues,exampleValues} from './practice.js';
const questions=JSON.parse(readFileSync(new URL('./data/practice-questions.json',import.meta.url),'utf8'));
const data=JSON.parse(readFileSync(new URL('./data/ontario-math-grade-5.json',import.meta.url),'utf8'));
test('practice templates reference real expectations and all produce valid lessons',()=>{
 const ids=new Set(),skills=new Set();function visit(node){skills.add(node.id);node.children?.forEach(visit);}visit(data.curriculum);
 for(const question of questions){
  assert.ok(!ids.has(question.id));ids.add(question.id);assert.ok(skills.has(question.skillId));
  assert.ok(question.parameters.length);assert.equal(new Set(question.parameters).size,question.parameters.length);assert.deepEqual(Object.keys(question.example).sort(),[...question.parameters].sort());
  assert.deepEqual(createPractice(question,exampleValues(question)),createPractice(question,question.example));
  const lesson=createPractice(question);assert.ok(lesson.steps.length>=2);assert.ok(lesson.formula||lesson.prompt);
  assert.ok(lesson.steps.every(step=>step.text));
 }
 const leaves=[];function collect(node){if(node.children)node.children.forEach(collect);else leaves.push(node.id);}collect(data.curriculum);
 assert.equal(leaves.length,58);for(const id of leaves)assert.ok(questions.some(q=>q.skillId===id),`No activity for ${id}`);
});
test('randomized practice stays in curriculum bounds and remains solvable',()=>{
 let seed=31;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
 for(const template of questions)for(let i=0;i<100;i++){
  const values=generateQuestionValues(template,rng);const lesson=createPractice(template,values);
  assert.ok(lesson.steps.length>=2);
  const [a,b]=values;
  if(template.rule==='long-multiply')assert.ok(a>=10&&a<=99&&b>=10&&b<=99);
  if(template.rule==='long-divide')assert.ok(a>=100&&a<=999&&b>=10&&b<=99);
  if(template.rule==='times')assert.ok(a<=12&&b<=12);
  if(template.rule==='divide')assert.equal(a%b,0);
  assert.notDeepEqual(nextValues(template,values,rng),values);
 }
});
