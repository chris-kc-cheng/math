import test from 'node:test';
import assert from 'node:assert/strict';
import {families,createLesson,defaultValues} from './index.js';
import {catalog} from '../../curriculum/catalog.js';
import {fmt,frac,ordinal,gcdN,lcmN,terminating,spaceSigns,pickStyle,whole} from '../core/shared.js';
import {rational} from '../core/exact.js';

test('every question template resolves to exactly one family',()=>{
 for(const grade of catalog)for(const template of grade.questions){
  const owners=families.filter(family=>family.has(template.rule));
  assert.equal(owners.length,1,`${template.id} (${template.rule}) is owned by ${owners.map(f=>f.name).join(', ')||'no family'}`);
 }
});

test('unknown rules are rejected clearly, and default values exist only for families that declare them',()=>{
 assert.throws(()=>createLesson('no-such-rule',[1],{}),/Unsupported practice rule/);
 assert.throws(()=>defaultValues('no-such-rule',Math.random),/Unsupported practice rule/);
 assert.deepEqual(defaultValues('times',()=>0),[0,0]);
});

test('shared helpers format and compute what every family expects',()=>{
 assert.equal(fmt(1234567),'1,234,567');
 assert.equal(frac(3,4),'\\frac{3}{4}');
 assert.deepEqual([1,2,3,4,11,12,13,21,112].map(ordinal),['1st','2nd','3rd','4th','11th','12th','13th','21st','112th']);
 assert.equal(gcdN(12,-18),6);assert.equal(lcmN(4,6),12);
 assert.equal(terminating(rational(3,40)),true);assert.equal(terminating(rational(1,3)),false);
 assert.equal(spaceSigns('3x+2y-5'),'3x + 2y - 5');assert.equal(spaceSigns('-3x'),'-3x');
 assert.equal(pickStyle(['a','b'],1),'b');assert.throws(()=>pickStyle(['a'],1),/style/);
 assert.throws(()=>whole(1.5),/whole/);
});
