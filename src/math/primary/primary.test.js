import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrimary} from './index.js';
const solve=(rule,args)=>createPrimary(rule,args);

test('primary number strategies have independently known exact answers',()=>{
 assert.equal(solve('primary-count',[0,5,6,0]).answer,'30');
 assert.equal(solve('primary-compose',[0,3,7,0]).answer,'37');
 assert.equal(solve('primary-compose',[2,4,6,1]).answer,'40');
 assert.equal(solve('primary-add-subtract',[8,5,0,1]).answer,'13');
 assert.equal(solve('primary-add-subtract',[14,6,1,1]).answer,'8');
 assert.equal(solve('primary-add-subtract',[328,145,0,2]).answer,'473');
 assert.equal(solve('primary-estimate',[23,5,0]).answer,'23');
 // Grades 1–2 describe shares in words; Grade 3 uses fraction notation.
 assert.equal(solve('primary-fair-share',[3,2,0,1]).answer,'1 whole and 1 half');
 assert.equal(solve('primary-fair-share',[7,4,2,2]).answer,'1 whole and 3 fourths');
 assert.equal(solve('primary-fair-share',[3,2,0,3]).answer,'\\frac{3}{2}');
 assert.equal(solve('primary-fair-share',[7,4,2,3]).answer,'\\frac{7}{4}');
 assert.equal(solve('primary-equivalent-parts',[2,4,1,0]).answer,'4');
 assert.equal(solve('primary-equivalent-parts',[3,2,1,3]).answer,'1');
 assert.equal(solve('primary-unit-compare',[2,8,0]).answer,'2');
 assert.equal(solve('primary-unit-compare',[2,8,1]).answer,'8');
 assert.equal(solve('primary-groups',[6,1,3,0,0,3]).answer,'2');
 assert.equal(solve('primary-groups',[3,2,1,2,2,2]).answer,'2');
 assert.equal(solve('primary-scale',[7,5,0]).answer,'35');
 assert.equal(solve('primary-read',[127,0]).answer,'127');
 assert.equal(solve('primary-parity',[17,0]).answer,'odd');
});

test('primary patterns, equality, and program traces follow their original constraints',()=>{
 assert.equal(solve('primary-pattern',[0,3,2,0]).answer,'circle');
 assert.equal(solve('primary-pattern',[1,3,2,1]).answer,'square');
 assert.equal(solve('primary-operation-pattern',[10,3,1,5,0]).answer,'17');
 assert.equal(solve('primary-balance',[8,5,10,1]).answer,'3');
 assert.equal(solve('primary-balance',[8,5,12,0]).answer,'not equal');
 assert.equal(solve('primary-expressions',[5,4,2,6,0,0]).answer,'yes');
 assert.equal(solve('primary-expressions',[5,4,3,2,2,2]).answer,'2');
 assert.equal(solve('primary-code',[3,2,1,0,0]).answer,'5');
 assert.equal(solve('primary-code',[3,2,1,1,0]).answer,'3');
 assert.equal(solve('primary-code',[3,2,4,2,0]).answer,'20');
 assert.equal(solve('primary-code-change',[3,2,1,0]).answer,'6');
});

test('primary data uses categorical language and honours pictograph keys and supplied samples',()=>{
 assert.equal(solve('primary-chart',[4,3,2,5,0,1,3]).answer,'20');
 assert.equal(solve('primary-chart',[4,3,2,2,1,1,3]).answer,'18');
 assert.equal(solve('primary-chart',[4,3,2,1,4,0,3]).answer,'3');
 assert.equal(solve('primary-chart-order',[5,2,4,0]).answer,'apples, pears, bananas');
 assert.equal(solve('primary-populations',[3,6,9,2,0,3]).answer,'2');
 for(const g of [1,2,3]){
  assert.equal(solve('primary-likelihood',[0,5,0,0,g]).answer,'impossible');
  assert.equal(solve('primary-likelihood',[5,0,0,0,g]).answer,'certain');
 }
 assert.equal(solve('primary-likelihood',[2,5,0,0,1]).answer,'possible');
 assert.equal(solve('primary-likelihood',[2,5,0,0,3]).answer,'unlikely');
 assert.equal(solve('primary-likelihood',[3,3,0,0,3]).answer,'equally likely');
 assert.equal(solve('primary-likelihood',[5,0,1,0,2]).answer,'impossible');
});

test('primary measurement, Canadian money, and calendar answers use the stated units',()=>{
 assert.equal(solve('primary-shape',[0,0,0,0]).answer,'3');
 assert.equal(solve('primary-shape',[2,2,0,1]).answer,'5');
 assert.equal(solve('primary-symmetry',[0,2,0]).answer,'no');
 assert.equal(solve('primary-symmetry',[1,2,0]).answer,'yes');
 assert.equal(solve('primary-position',[1,2,0]).answer,'below');
 assert.equal(solve('primary-route',[4,3,2,1,2]).answer,'2');
 assert.equal(solve('primary-measure',[8,2,3,1]).answer,'8');
 assert.equal(solve('primary-metric',[3,0,0]).answer,'300');
 assert.equal(solve('primary-perimeter',[8,5,2]).answer,'8');
 assert.equal(solve('primary-calendar',[10,8,7,0]).answer,'15');
 assert.equal(solve('primary-calendar',[2,8,7,2]).answer,'28');
 assert.equal(solve('primary-clock',[3,25,2]).answer,'3:25');
 assert.equal(solve('primary-timer',[2,35,0]).answer,'155');
 assert.equal(solve('primary-money',[25,4,10,3,1,0]).answer,'130');
 assert.equal(solve('primary-money',[2000,3,1000,2,1,1]).answer,'80');
 assert.equal(solve('primary-change',[20,13,0,0]).answer,'7');
 assert.equal(solve('primary-change',[75,45,2,1]).answer,'45');
});

test('invalid or out-of-grade primary constructions are rejected clearly',()=>{
 assert.throws(()=>solve('primary-fair-share',[4,2,0,1]),/leftover/);
 assert.throws(()=>solve('primary-equivalent-parts',[3,4,1,0]),/fourths/);
 assert.throws(()=>solve('primary-measure',[7,3,0,0]),/exactly/);
 assert.throws(()=>solve('primary-money',[50,6,25,3,1,0]),/200/);
 assert.throws(()=>solve('primary-money',[25,1,25,1,3,0]),/different/);
 assert.throws(()=>solve('primary-calendar',[2,25,7,0]),/month/);
 assert.throws(()=>solve('primary-change',[5,7,0,0]),/cover/);
 assert.throws(()=>solve('primary-count',[-1,2,3,0]),/nonnegative/);
});

test('Grades 1–2 fractional totals are described in words and counting chains skip by at least two',()=>{
 const sum=createPrimary('primary-groups',[3,1,2,0,0,1]);
 assert.equal(sum.answer,'1 whole and 1 half');
 assert.equal(sum.response.kind,'choice');
 assert.ok(sum.response.options.includes(sum.answer));
 assert.equal(createPrimary('primary-groups',[3,1,2,0,0,3]).answer,'\\frac{3}{2}');
 const estimate=createPrimary('primary-estimate',[19,10,0]);
 assert.match(estimate.steps[1].text,/Estimate first.*20/);
 assert.equal(estimate.answer,'19');
 assert.throws(()=>createPrimary('primary-count',[0,1,6,1]),/./);
});

test('primary chart answers end with a sentence that names what was counted',()=>{
 const text=createPrimary('primary-chart',[4,3,2,5,0,1,3]).steps.at(-1).text;
 assert.match(text,/learners/);
});
