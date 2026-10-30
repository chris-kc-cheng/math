import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import {numberVariantRules as rules} from './variants-number.js';
import {elementaryRules} from './index.js';
import {answerNumber} from '../../verification.js';

const renders=lesson=>{for(const s of [...lesson.steps,...(lesson.verification?.steps||[])])if(s.math)assert.doesNotThrow(()=>katex.renderToString(s.math,{throwOnError:true}),s.math);};
const run=(rule,values)=>{const lesson=rules[rule](values);assert.equal(lesson.verification.valid,true,`${rule} ${values}`);renders(lesson);return lesson;};
const is=(lesson,expected)=>{const a=answerNumber(lesson.answer);assert.ok(Math.abs(Number(a.n)/Number(a.d)-expected)<1e-9,`${lesson.prompt} => ${lesson.answer}, expected ${expected}`);};
const distinct=(rule,values,styles)=>{const prompts=new Set();for(let s=0;s<styles;s++)prompts.add(run(rule,[...values,s]).prompt);assert.equal(prompts.size,styles,`${rule} stems`);};

test('every new rule is registered for the practice engine',()=>{for(const name of Object.keys(rules))assert.ok(elementaryRules[name],name);});
test('rounding in several settings names the deciding digit',()=>{
 is(run('round-story',[4836,0,2,0]),4800);is(run('round-story',[4836,0,2,1]),4800);is(run('round-story',[3647,2,-1,2]),36.5);is(run('round-story',[4856,0,1,3]),4860);is(run('round-story',[3475,3,-2,4]),3.48);
 assert.throws(()=>run('round-story',[36,0,-1,0]),/place/);assert.throws(()=>run('round-story',[3647,2,-1,1]),/whole number/);
 assert.match(run('round-story',[3647,1,0,0]).prompt,/whole number/);
});
test('fraction, decimal and percent conversions go both ways',()=>{
 is(run('convert-forms',[3,4,0]),0.75);is(run('convert-forms',[3,4,1]),75);is(run('convert-forms',[7,20,2]),35);is(run('convert-forms',[7,20,3]),0.35);is(run('convert-forms',[3,4,4]),0.75);
 assert.equal(run('convert-forms',[3,4,4]).answer,'\\frac{3}{4}');assert.throws(()=>run('convert-forms',[1,3,0]),/denominator/);
});
test('simplest form, equivalent fractions and fraction comparison',()=>{
 assert.equal(run('simplify-fraction',[12,18,0]).answer,'\\frac{2}{3}');is(run('simplify-fraction',[12,18,1]),6);is(run('simplify-fraction',[12,18,2]),3);assert.throws(()=>run('simplify-fraction',[5,7,0]),/simplified/);
 is(run('equivalent-missing',[3,4,2,0]),6);is(run('equivalent-missing',[3,4,2,1]),8);is(run('equivalent-missing',[3,4,5,2]),15);is(run('equivalent-missing',[3,4,5,3]),15);distinct('equivalent-missing',[3,4,2],4);
 assert.equal(run('compare-fractions-story',[3,4,5,6,0]).answer,'\\frac{5}{6}');assert.equal(run('compare-fractions-story',[3,4,5,6,1]).answer,'\\frac{3}{4}');assert.equal(run('compare-fractions-story',[3,4,5,6,2]).answer,'\\frac{1}{12}');
});
test('GCF, LCM, divisibility and prime factors in different wordings',()=>{
 const expected=[6,36,36,6,6,36];for(let s=0;s<6;s++)is(run('gcf-lcm',[12,18,s]),expected[s]);distinct('gcf-lcm',[12,18],6);
 is(run('divisibility-count',[1260,0]),5);is(run('divisibility-count',[4836,1]),3);is(run('divisibility-count',[4836,2]),21);
 for(const [s,e] of [[0,4],[1,5],[2,2],[3,12]])is(run('prime-factor-question',[60,s]),e);assert.throws(()=>run('prime-factor-question',[13,0]),/composite/);
});
test('decimal multiplication and division stay exact',()=>{
 is(run('decimal-operation',[245,6,0]),14.7);is(run('decimal-operation',[750,5,1]),1.5);is(run('decimal-operation',[236,4,2]),94.4);is(run('decimal-operation',[236,4,3]),590);is(run('decimal-operation',[24,35,4]),8.4);is(run('decimal-operation',[750,5,5]),15);
 assert.throws(()=>run('decimal-operation',[100,3,1]),/exact/);
});
test('order of operations: six shapes with exact integer results',()=>{
 is(run('order-of-operations',[2,3,4,5,0]),14);is(run('order-of-operations',[2,3,4,5,1]),20);is(run('order-of-operations',[2,3,4,5,2]),9);is(run('order-of-operations',[6,4,8,2,3]),20);is(run('order-of-operations',[5,4,3,2,4]),21);is(run('order-of-operations',[7,5,3,2,5]),6);
 assert.throws(()=>run('order-of-operations',[6,4,7,2,3]),/exactly/);
});
test('decimal patterns, pattern tables and inequalities',()=>{
 is(run('decimal-sequence',[25,25,10,0]),1.25);is(run('decimal-sequence',[25,25,10,1]),2.5);is(run('decimal-sequence',[25,25,10,2]),0.75);is(run('decimal-sequence',[25,25,10,3]),0.25);
 const table=run('pattern-table-values',[3,2,10,0]);is(table,32);assert.equal(table.visual.type,'table');is(run('pattern-table-values',[3,2,10,1]),10);
 is(run('inequality-count',[5,12,0]),7);is(run('inequality-count',[5,12,1]),6);is(run('inequality-count',[5,12,2]),18);is(run('inequality-count',[5,12,3]),7);
});
test('like terms, money and best-value questions',()=>{
 is(run('combine-terms',[3,5,4,0]),8);is(run('combine-terms',[3,-5,4,1]),-2);is(run('combine-terms',[3,5,4,2]),8);
 is(run('money-change',[12,7,20,0]),1);is(run('money-change',[12,7,20,1]),19);is(run('money-change',[12,7,15,2]),4);
 is(run('unit-price-best',[4,10,5,10,0]),2);is(run('unit-price-best',[4,10,5,10,1]),0.5);is(run('unit-price-best',[4,10,5,10,2]),2.5);assert.throws(()=>run('unit-price-best',[4,10,4,10,0]),/different/);
});
test('currency, interest, budgets and elapsed time',()=>{
 is(run('currency-exchange',[200,74,0]),148);is(run('currency-exchange',[148,74,1]),200);is(run('currency-exchange',[50,65,2]),32.5);
 is(run('simple-interest-story',[1000,5,3,0]),150);is(run('simple-interest-story',[1000,5,3,1]),1150);is(run('simple-interest-story',[1000,5,3,2]),5);is(run('simple-interest-story',[1000,5,2,3]),1102.5);assert.throws(()=>run('simple-interest-story',[1000,5,3,3]),/two years/);
 is(run('budget-balance',[3200,1200,600,500,0]),900);is(run('budget-balance',[3200,1200,600,500,1]),2300);is(run('budget-balance',[3200,1200,600,500,2]),500);
 is(run('elapsed-time-story',[1,45,3,20,0]),95);is(run('elapsed-time-story',[11,30,1,15,1]),105);is(run('elapsed-time-story',[9,0,10,30,2]),1.5);
});
