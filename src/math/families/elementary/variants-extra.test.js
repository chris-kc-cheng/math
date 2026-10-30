import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import {extraVariantRules as rules} from './variants-extra.js';
import {elementaryRules} from './index.js';
import {answerNumber} from '../../verification.js';

const renders=lesson=>{for(const s of [...lesson.steps,...(lesson.verification?.steps||[])])if(s.math)assert.doesNotThrow(()=>katex.renderToString(s.math,{throwOnError:true}),s.math);};
const run=(rule,values)=>{const lesson=rules[rule](values);assert.equal(lesson.verification.valid,true,`${rule} ${values}`);renders(lesson);return lesson;};
const is=(lesson,expected)=>{const a=answerNumber(lesson.answer);assert.ok(Math.abs(Number(a.n)/Number(a.d)-expected)<1e-9,`${lesson.prompt} => ${lesson.answer}, expected ${expected}`);};
const all=(rule,values,expected)=>expected.forEach((e,style)=>is(run(rule,[...values,style]),e));

test('every new rule is registered for the practice engine',()=>{for(const name of Object.keys(rules))assert.ok(elementaryRules[name],name);});
test('unit fractions as counting units and repeated addition',()=>{all('unit-fraction-story',[3,4],[0.75,12,0.75,0.75]);assert.match(run('unit-fraction-story',[3,4,0]).prompt,/3rd/);assert.throws(()=>run('unit-fraction-story',[1,4,0]),/unit/);});
test('picking the greatest, least or middle decimal, including negatives',()=>{
 all('rational-pick',[35,7,52,2],[0.52,0.07,0.35]);is(run('rational-pick',[-35,7,52,2,1]),-0.35);assert.throws(()=>run('rational-pick',[5,5,7,1,0]),/different/);
});
test('dividing a whole number by a proper fraction in words',()=>{all('fraction-divide-story',[3,1,4],[12,12,12]);is(run('fraction-divide-story',[3,2,5,2]),7.5);assert.throws(()=>run('fraction-divide-story',[3,2,5,0]),/whole/);});
test('counting data in an interval or below it',()=>{is(run('interval-count',[12,18,23,29,30,1,0]),2);is(run('interval-count',[12,18,23,29,30,2,0]),2);is(run('interval-count',[12,18,23,29,30,3,1]),4);assert.throws(()=>run('interval-count',[12,18,23,29,30,0,1]),/above/);});
test('savings goals: weeks, amount saved, weekly saving and what is still needed',()=>{all('savings-goal',[10,8,40],[8,120,10,80]);});
test('midpoint and distance between decimals',()=>{is(run('midpoint-decimal',[25,75,2,0]),0.5);is(run('midpoint-decimal',[25,75,2,1]),0.5);is(run('midpoint-decimal',[3,8,1,0]),0.55);});
test('scientific notation both ways',()=>{is(run('scientific-story',[45,3,0]),4500);is(run('scientific-story',[45,3,1]),0.0045);is(run('scientific-story',[45,3,2]),3);assert.throws(()=>run('scientific-story',[5,3,0]),/coefficient/);});
test('square-root estimates and powers of ten',()=>{all('sqrt-estimate',[20],[4,5,16]);is(run('powers-of-ten',[345,2,0]),345);is(run('powers-of-ten',[345,2,1]),0.0345);assert.throws(()=>run('sqrt-estimate',[25,0]),/perfect/);});
test('integer products, quotients and repeated changes',()=>{
 is(run('integer-product',[-6,4,0]),-24);is(run('integer-product',[-12,-3,1]),4);is(run('integer-product',[-3,5,2]),-15);is(run('integer-product',[-4,8,3]),-32);assert.throws(()=>run('integer-product',[5,3,2]),/negative/);assert.throws(()=>run('integer-product',[7,2,1]),/exactly/);
});
test('evaluating with signed numbers in four shapes',()=>{all('evaluate-signed',[3,-4,-2],[-10,2,-18,0]);assert.match(run('evaluate-signed',[3,-4,-2,0]).prompt,/3x − 4 when x = \(−2\)/);});
test('sale prices, tax and debt stay exact',()=>{
 all('sale-total',[80,25,13],[67.8,20,60,7.8]);all('debt-story',[200,50,10],[20,220,170]);assert.throws(()=>run('debt-story',[200,500,10,2]),/more than/);
});
test('turns of a circle and survey percents',()=>{all('turn-angle',[1,4],[90,0.25,90]);is(run('turn-angle',[1,6,2]),60);assert.throws(()=>run('turn-angle',[1,8,2]),/minutes/);all('survey-percent',[30,20,50],[30,108,100]);assert.throws(()=>run('survey-percent',[1,1,1,0]),/exact/);});
