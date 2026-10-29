import {test} from 'node:test';
import assert from 'node:assert/strict';
import {longDivision} from './long-division.js';
test('long division preserves quotient/remainder identity and decimal place values',()=>{
 for(let n=0;n<=300;n++)for(let d=1;d<=25;d++){
  const lesson=longDivision(n,d);
  assert.equal(BigInt(lesson.answer)*BigInt(d)+BigInt(lesson.remainder),BigInt(n));
  assert.ok(BigInt(lesson.remainder)<BigInt(d));
 }
 for(const [n,d,q,r] of [[156,12,'13','0'],[784,7,'112','0'],[125,4,'31','1'],[1005,5,'201','0'],[3,12,'0','3'],[0,3,'0','0']]){
  const lesson=longDivision(n,d);assert.equal(lesson.answer,q);assert.equal(lesson.remainder,r);
 }
});
test('long division creates exact multiply/subtract work and immutable snapshots',()=>{
 const {steps}=longDivision(156,12);
 const multiply=steps.filter(s=>s.phase==='multiply');
 assert.equal(multiply[0].rows.at(-1).value,'12');assert.equal(multiply[1].rows.at(-1).value,'36');
 const subtraction=steps.find(s=>s.phase==='subtract');assert.equal(subtraction.rows.at(-1).value,'3');
 const brought=steps.find(s=>s.phase==='bring-down');assert.equal(brought.rows.at(-1).value,'36');assert.equal(subtraction.rows.at(-1).value,'3');
 assert.equal(subtraction.quotient.join(''),'1');assert.equal(steps.at(-1).quotient.join(''),'13');
});
test('unsupported long division inputs are rejected',()=>{
 for(const [n,d] of [[1,0],[-1,3],[1.5,2],['alert(1)',2],[1000000,2],[1,10000]])assert.throws(()=>longDivision(n,d));
});
