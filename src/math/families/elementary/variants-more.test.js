import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import {moreVariantRules as rules} from './variants-more.js';
import {dataRules} from './data.js';
import {answerNumber} from '../../verification.js';

const renders=lesson=>{for(const s of [...lesson.steps,...(lesson.verification?.steps||[])])if(s.math)assert.doesNotThrow(()=>katex.renderToString(s.math,{throwOnError:true}),s.math);if(lesson.formula)assert.doesNotThrow(()=>katex.renderToString(lesson.formula,{throwOnError:true}));};
const run=(rule,values)=>{const lesson=rules[rule](values);assert.equal(lesson.verification.valid,true,`${rule} ${values}`);renders(lesson);return lesson;};
const equalsNumber=(lesson,expected)=>{const a=answerNumber(lesson.answer);assert.ok(Math.abs(Number(a.n)/Number(a.d)-expected)<1e-9,`${lesson.prompt} => ${lesson.answer}, expected ${expected}`);};
const distinct=(rule,values,styles)=>{const prompts=new Set();for(let s=0;s<styles;s++)prompts.add(run(rule,[...values,s]).prompt);assert.equal(prompts.size,styles,`${rule} should give ${styles} different stems`);};

test('fraction of a quantity: whole-number and fractional answers, five stems',()=>{
 distinct('fraction-of-quantity',[3,4,24],5);
 for(let s=0;s<5;s++){equalsNumber(run('fraction-of-quantity',[3,4,24,s,1]),18);}
 equalsNumber(run('fraction-of-quantity',[2,3,10,0,0]),20/3);equalsNumber(run('fraction-of-quantity',[1,4,10,0,0]),2.5);
 assert.throws(()=>run('fraction-of-quantity',[3,4,10,0,1]),/exactly/);assert.throws(()=>run('fraction-of-quantity',[5,4,8,0,0]),/proper/);
});
test('fraction stories: like and unlike denominators, add and subtract, simplified',()=>{
 for(const s of [0,2,4])equalsNumber(run('fraction-story',[1,4,2,6,s]),1/4+2/6);
 for(const s of [1,5])equalsNumber(run('fraction-story',[3,4,1,6,s]),3/4-1/6);
 equalsNumber(run('fraction-story',[1,6,3,4,3]),3/4-1/6);
 const like=run('fraction-story-like',[3,2,8,0]);equalsNumber(like,5/8);assert.ok(like.steps.length>=2);assert.throws(()=>run('fraction-story',[1,6,3,4,1]),/larger/);
});
test('decimal stories line up place values and stay exact',()=>{
 equalsNumber(run('decimal-story',[2475,860,2,0]),33.35);equalsNumber(run('decimal-story',[2475,860,2,1]),16.15);equalsNumber(run('decimal-story',[37,18,1,2]),5.5);equalsNumber(run('decimal-story',[18,37,1,3]),1.9);equalsNumber(run('decimal-story',[3475,8602,3,4]),12.077);
 assert.throws(()=>run('decimal-story',[37,18,1,0]),/two decimal/);
});
test('percent stories: part, sale price and increase',()=>{
 equalsNumber(run('percent-story',[25,80,0]),20);equalsNumber(run('percent-story',[25,80,2]),60);equalsNumber(run('percent-story',[15,60,5]),69);equalsNumber(run('percent-story',[15,60,3]),9);equalsNumber(run('percent-story',[13,45,1]),5.85);
 distinct('percent-story',[10,50],6);
});
test('unit rates: find the rate, then scale it',()=>{
 equalsNumber(run('unit-rate',[4,10,6,0]),2.5);equalsNumber(run('unit-rate',[4,10,6,1]),15);equalsNumber(run('unit-rate',[3,180,5,3]),300);equalsNumber(run('unit-rate',[5,2,2,4]),0.4);distinct('unit-rate',[4,10,6],6);
 assert.throws(()=>run('unit-rate',[4,10,4,1]),/different/);
});
test('multiply-then-add stories solve or evaluate correctly',()=>{
 for(const s of [0,1,4])equalsNumber(run('linear-story',[3,4,5,s]),5);for(const s of [2,3,5])equalsNumber(run('linear-story',[3,4,5,s]),19);distinct('linear-story',[3,4,5],6);
});
test('pattern questions: next, nth, term number, missing term',()=>{
 equalsNumber(run('pattern-term',[3,4,10,0]),19);equalsNumber(run('pattern-term',[3,4,10,1]),39);equalsNumber(run('pattern-term',[3,4,10,2]),10);equalsNumber(run('pattern-term',[3,4,10,3]),11);equalsNumber(run('pattern-term',[3,4,10,4]),39);distinct('pattern-term',[3,4,10],5);
});
test('rectangle and square measures, including missing sides',()=>{
 for(const [s,e] of [[0,84],[1,38],[2,48],[3,144],[4,7],[5,7]])equalsNumber(run('rectangle-measure-variants',[12,7,s]),s===2?48:s===3?144:e);
 for(const [s,e] of [[0,20],[1,40],[2,5],[3,5],[4,40]])equalsNumber(run('area-formula',[8,5,s]),e);assert.throws(()=>run('area-formula',[7,5,0]),/even/);
});
test('unit conversions in both directions',()=>{
 const cases=[[0,3,300],[1,4,4000],[2,2,2000],[3,5,5000],[4,45,450],[5,3,180],[6,250,2.5],[7,1500,1.5],[8,2500,2.5],[9,45,4.5],[10,90,1.5]];
 for(const [s,n,e] of cases)equalsNumber(run('unit-convert',[n,s]),e);assert.throws(()=>run('unit-convert',[50,10]),/minutes/);
});
test('integer stories handle rises, drops, signed sums and differences',()=>{
 equalsNumber(run('integer-story',[-3,8,0]),5);equalsNumber(run('integer-story',[2,5,1]),-3);equalsNumber(run('integer-story',[-4,-6,2]),-10);equalsNumber(run('integer-story',[-4,-6,3]),2);equalsNumber(run('integer-story',[-20,15,4]),-35);equalsNumber(run('integer-story',[3,-5,5]),8);
 assert.throws(()=>run('integer-story',[2,-5,0]),/positive/);
});
test('powers, squares, roots, areas and volumes of cubes',()=>{
 equalsNumber(run('power-value',[4,3,0]),64);equalsNumber(run('power-value',[5,3,1]),125);equalsNumber(run('power-value',[9,2,2]),81);equalsNumber(run('power-value',[12,2,3]),12);equalsNumber(run('power-value',[7,2,4]),49);equalsNumber(run('power-value',[3,3,5]),27);
 assert.throws(()=>run('power-value',[3,3,2]),/exponent/);
});
test('angle relationships name the fact they use',()=>{
 equalsNumber(run('angle-relation',[50,60,0]),70);equalsNumber(run('angle-relation',[35,0+1,1]),55);equalsNumber(run('angle-relation',[35,1,2]),145);equalsNumber(run('angle-relation',[40,90,3]),50);equalsNumber(run('angle-relation',[120,100,4]),140);equalsNumber(run('angle-relation',[65,1,5]),65);
 assert.throws(()=>run('angle-relation',[100,90,0]),/fit/);
});
test('probability stems and the missing value that gives a mean',()=>{
 for(let s=0;s<5;s++)equalsNumber(run('probability-word',[3,12,s]),0.25);equalsNumber(run('probability-word',[2,6,5]),1/3);assert.throws(()=>run('probability-word',[2,8,5]),/six/);
 equalsNumber(run('mean-missing',[4,6,8,10,9]),17);assert.throws(()=>run('mean-missing',[40,40,40,40,2]),/reachable/);
});
test('single-answer mode question needs exactly one mode',()=>{
 const lesson=dataRules['data-measure']([2,3,3,5,9,3]);assert.equal(lesson.answer,'3');renders(lesson);
 assert.throws(()=>dataRules['data-measure']([2,3,3,5,5,3]),/one mode/);assert.throws(()=>dataRules['data-measure']([1,2,3,4,5,3]),/one mode/);
});
