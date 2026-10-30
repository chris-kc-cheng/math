import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import {spaceVariantRules as rules} from './variants-space.js';
import {elementaryRules} from './index.js';
import {answerNumber} from '../verification.js';

const renders=lesson=>{for(const s of [...lesson.steps,...(lesson.verification?.steps||[])])if(s.math)assert.doesNotThrow(()=>katex.renderToString(s.math,{throwOnError:true}),s.math);};
const run=(rule,values)=>{const lesson=rules[rule](values);assert.equal(lesson.verification.valid,true,`${rule} ${values}`);renders(lesson);return lesson;};
const is=(lesson,expected)=>{const a=answerNumber(lesson.answer);assert.ok(Math.abs(Number(a.n)/Number(a.d)-expected)<1e-9,`${lesson.prompt} => ${lesson.answer}, expected ${expected}`);};
const each=(rule,values,expected)=>expected.forEach((e,s)=>is(run(rule,[...values.slice(0,values.length),s].slice(0,values.length+1)),e));

test('every new rule is registered for the practice engine',()=>{for(const name of Object.keys(rules))assert.ok(elementaryRules[name],name);});
test('reading a bar graph or a frequency table: six questions about the same data',()=>{
 for(const form of [0,1]){
  const answers=[12,36,4,9,6,1/3];answers.forEach((e,style)=>{const lesson=run('chart-read',[12,8,6,10,style,form]);void lesson;is(run('chart-read',[12,8,6,10,style,form]),e);});
  assert.equal(run('chart-read',[12,8,6,10,0,form]).visual.type,form?'table':'bars');
 }
 assert.throws(()=>run('chart-read',[5,8,6,10,2,0]),/Soccer/);assert.throws(()=>run('chart-read',[12,12,6,10,0,0]),/clear/);
});
test('experimental probability, sample space and probability of one outcome',()=>{
 [0.25,25,9,25].forEach((e,s)=>is(run('experimental-probability-story',[3,12,s]),e));assert.equal(run('experimental-probability-story',[3,12,0]).answer,'\\frac{1}{4}');
 [6,12,12,12].forEach((e,s)=>is(run('sample-space',[3,4,s]),e));assert.equal(run('sample-space',[3,4,4]).answer,'\\frac{1}{12}');
});
test('circles with π ≈ 3.14, from radius, diameter or circumference',()=>{
 [31.4,31.4,78.5,10,5,78.5,5,10].forEach((e,s)=>is(run('circle-story',[5,s]),e));
});
test('rectangular prisms, cubes and cylinders: volume, surface area, missing height and capacity',()=>{
 [24,52,64,96,2,24,24,100.48,24,50.24,150.72].forEach((e,s)=>is(run('solid-measure',[4,3,2,s]),e));
});
test('composite areas, perimeters, trapezoids, rhombi and kites',()=>{
 [[10,8,3,2,0,74],[10,8,3,2,1,36],[10,8,3,2,2,86],[6,4,3,2,3,15],[6,4,3,2,4,12],[6,4,3,2,5,12]].forEach(([a,b,c,d,s,e])=>is(run('composite-area',[a,b,c,d,s]),e));
 assert.throws(()=>run('composite-area',[10,8,12,2,0]),/fit/);assert.throws(()=>run('composite-area',[5,4,3,2,3]),/even/);
});
test('Pythagorean triples in ladders, rectangles and grids',()=>{
 [5,4,5,5].forEach((e,s)=>is(run('pythagoras-story',[1,0,s]),e));is(run('pythagoras-story',[2,1,1]),24);is(run('pythagoras-story',[1,2,0]),17);
});
test('translations, reflections, rotations and dilations of a point',()=>{
 [8,6,-3,-4,-3,-4].forEach((e,s)=>is(run('transform-point',[3,4,5,2,s]),e));is(run('transform-point',[3,-4,2,0,6]),6);is(run('transform-point',[3,-4,2,0,7]),-8);is(run('transform-point',[-3,4,-5,2,0]),-8);
 assert.match(run('transform-point',[3,4,5,2,0]).prompt,/x-coordinate/);assert.throws(()=>run('transform-point',[3,4,1,2,6]),/scale/);
});
test('scale lengths, polygon angles, ratio sharing and how a mean changes',()=>{
 [200,4,200,200].forEach((e,s)=>is(run('scale-length',[50,4,s]),e));
 [720,120,60,6,180].forEach((e,s)=>is(run('polygon-angle',[6,s]),e));assert.throws(()=>run('polygon-angle',[7,1]),/whole-degree/);
 [8,12,8,12,12].forEach((e,s)=>is(run('ratio-share',[3,2,4,s]),e));assert.throws(()=>run('ratio-share',[4,2,3,0]),/lowest/);
 is(run('mean-change',[10,4,20,0]),12);is(run('mean-change',[10,4,10,1]),10);is(run('mean-change',[10,4,0,2]),40);assert.throws(()=>run('mean-change',[10,4,6,1]),/exact/);
});
