import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../curriculum/catalog.js';
import {createPractice,generateQuestionValues} from '../curriculum/practice.js';
import {isTautology,meaningfulVerification,RESTATING_RULES} from './check-policy.js';

test('a check never equates an expression with itself or restates the question',()=>{
 assert.equal(isTautology('14=14'),true);
 assert.equal(isTautology('\\left(3\\right)=3'),false);
 assert.equal(isTautology('17+8=25'),false);
 const check={method:'x',valid:true,steps:[{text:'Recalculate in the order of operations a second time.',math:'14=14',valid:true}]};
 assert.equal(meaningfulVerification('order-of-operations',check),undefined);
 assert.equal(meaningfulVerification('compare-values',{method:'x',valid:true,steps:[{text:'Anything',math:'1+2=3'}]}),undefined);
 assert.ok(RESTATING_RULES.has('powers-of-ten'));
});

test('every check shown to learners is independent, valid, and not circular',()=>{
 let seed=5;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
 let shown=0;
 for(const grade of catalog)for(const template of grade.questions){
  for(let i=0;i<6;i++){
   const lesson=createPractice(template,i?generateQuestionValues(template,rng):template.example),check=lesson.verification;
   if(!check)continue;shown++;
   assert.equal(check.valid,true,template.id);
   assert.ok(!RESTATING_RULES.has(template.rule),`${template.id} still shows a restating check`);
   for(const step of check.steps){
    if(/^Evaluate each side/i.test(step.text||''))continue;
    assert.ok(!step.math||!isTautology(step.math),`${template.id}: ${step.math}`);
   }
  }
 }
 assert.ok(shown>100,'useful checks remain for inverse operations, substitution and remainders');
});

test('equations are still checked by substituting into the original',()=>{
 const template=catalog.find(g=>g.grade===5).questions.find(q=>q.rule==='equation-add')||catalog.flatMap(g=>g.questions).find(q=>q.rule==='equation-add');
 const lesson=createPractice(template,template.example);
 assert.match(lesson.verification.method,/Substitution/);
});
