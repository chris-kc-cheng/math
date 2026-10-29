import {test} from 'node:test';
import assert from 'node:assert/strict';
import {longMultiplication} from './long-multiplication.js';
test('long multiplication generates exact partials and totals',()=>{
 for(let a=0;a<=120;a++)for(let b=0;b<=110;b++){
  const lesson=longMultiplication(a,b),last=lesson.steps.at(-1);
  const expected=BigInt(a)*BigInt(b);
  assert.equal(lesson.answer,String(expected));assert.equal(BigInt(last.total.join('')),expected);
  assert.equal(last.partials.reduce((sum,row)=>sum+BigInt(row.join('')||'0'),0n),expected);
  assert.ok(last.partials.every(row=>row.length===lesson.width));
 }
 assert.equal(longMultiplication(9999,9999).answer,'99980001');
});
test('carrying, tens shifts, and zero digits are explicit and snapshots immutable',()=>{
 const lesson=longMultiplication(47,36);
 const first=lesson.steps.find(s=>s.phase==='multiply');assert.match(first.text,/42/);assert.ok(first.carries.includes('4'));
 const partials=lesson.steps.filter(s=>s.phase==='partial');assert.equal(partials[0].partials[0].join(''),'282');assert.equal(partials[1].partials[1].join(''),'1410');
 assert.equal(first.partials[0].filter(Boolean).join(''),'2');assert.equal(longMultiplication(105,20).answer,'2100');
 assert.ok(longMultiplication(99,99).steps.some(s=>s.sumCarries.includes('1')));
});
test('unsupported multiplication inputs are rejected',()=>{for(const [a,b] of [[-1,2],[1.5,3],[10000,3],['alert(1)',3],[2,NaN]])assert.throws(()=>longMultiplication(a,b));});
