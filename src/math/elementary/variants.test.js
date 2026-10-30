import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import {variantRules} from './variants.js';

const run=(rule,values)=>variantRules[rule](values);
const renders=lesson=>{for(const s of [...lesson.steps,...(lesson.verification?.steps||[])])if(s.math)assert.doesNotThrow(()=>katex.renderToString(s.math,{throwOnError:true}));if(lesson.formula)assert.doesNotThrow(()=>katex.renderToString(lesson.formula,{throwOnError:true}));};

test('word-problem rules give a different stem and key-word hint for every style, with the correct exact answer',()=>{
 const cases={'story-add':[[2436,1294],a=>a[0]+a[1]],'story-subtract':[[5240,1294],a=>a[0]-a[1]],'story-multiply':[[24,6],a=>a[0]*a[1]],'story-divide':[[72,6],a=>a[0]/a[1]]};
 for(const [rule,[args,expected]] of Object.entries(cases)){
  const prompts=new Set(),hints=new Set();
  for(let style=0;style<6;style++){const lesson=run(rule,[...args,style]);assert.equal(lesson.answer,String(expected(args)),`${rule} style ${style}`);assert.equal(lesson.verification.valid,true);renders(lesson);prompts.add(lesson.prompt);hints.add(lesson.steps[1].text);}
  assert.equal(prompts.size,6,rule+' stems');assert.equal(hints.size,6,rule+' hints');
 }
 assert.throws(()=>run('story-add',[1,2,9]),/style/);assert.throws(()=>run('story-subtract',[3,5,0]),/smaller/);assert.throws(()=>run('story-divide',[7,2,0]),/exactly/);
});
test('missing-number covers all six equation shapes and rejects impossible ones',()=>{
 const cases=[[8,25,0,17],[8,25,1,17],[8,25,2,33],[40,25,3,15],[6,42,4,7],[6,7,5,42]];
 for(const [a,b,form,answer] of cases){const lesson=run('missing-number',[a,b,form]);assert.equal(lesson.answer,String(answer),`form ${form}`);assert.equal(lesson.verification.valid,true);renders(lesson);}
 assert.throws(()=>run('missing-number',[30,10,0]),/larger/);assert.throws(()=>run('missing-number',[5,12,4]),/exactly/);assert.throws(()=>run('missing-number',[3,9,6]),/form/);
});
test('compare-values answers greater, less and how-much-greater questions',()=>{
 assert.equal(run('compare-values',[4590,5409,0]).answer,'5409');assert.equal(run('compare-values',[4590,5409,1]).answer,'4590');assert.equal(run('compare-values',[4590,5409,2]).answer,'819');
 assert.throws(()=>run('compare-values',[5,5,0]),/different/);renders(run('compare-values',[45900,5409,0]));
});
test('digit-value asks for the value or the digit in a named place and never for an invalid place',()=>{
 const value=run('digit-value',[4836,2,0]),digit=run('digit-value',[4836,2,1]);
 assert.equal(value.answer,'800');assert.equal(digit.answer,'8');assert.match(value.prompt,/hundreds place/);renders(value);
 assert.equal(run('digit-value',[648302,5,0]).answer,'600000');assert.equal(run('digit-value',[406000000,8,1]).answer,'4');
 assert.throws(()=>run('digit-value',[4836,4,0]),/place/);assert.throws(()=>run('digit-value',[4806,1,0]),/not zero/);
});
