import {test} from 'node:test';
import assert from 'node:assert/strict';
import {solve} from './solver.js';
test('sample questions produce correct simplest answers',()=>{for(const [q,a] of [['8+2+5','15'],['23-8','15'],['6 × 4','24'],['18 ÷ 3','6'],['3/4','\\frac{3}{4}'],['0.5+0.25','\\frac{3}{4}'],['2/4','\\frac{1}{2}'],['-2*-3','6'],['1/-2','\\frac{-1}{2}']])assert.equal(solve(q).answer,a);});
test('both addition methods end at the same result',()=>{const s=solve('8+2+5');assert.equal(s.methods.length,2);for(const m of s.methods)assert.equal(m.steps.at(-1).math,s.answer);});
test('simple LaTeX is accepted',()=>{assert.equal(solve('\\frac{6}{8}').answer,'\\frac{3}{4}');assert.equal(solve('3 \\times 4').answer,'12');});
test('invalid or undefined operations are rejected',()=>{for(const q of ['1/0','sqrt(-1)','2^3','alert(1)','1*2+3','1/0+2/3',''])assert.throws(()=>solve(q));});
test('multiplication happens before addition with exact arithmetic',()=>{
 for(const [q,a] of [['2 + 3 x 4','14'],['2+3\\times4','14'],['0.1+0.2*3','\\frac{7}{10}'],['2+-3*4','-10']]){
  const s=solve(q);assert.equal(s.answer,a);assert.equal(s.methods[0].steps.at(-1).math,a);
 }
 assert.match(solve('2+3*4').methods[0].steps[1].math,/12/);
});
test('fraction sums use common denominators and reduce exactly',()=>{
 for(const [q,a] of [['1/2+2/3','\\frac{7}{6}'],['\\frac{1}{2}+\\frac{2}{3}','\\frac{7}{6}'],['1/4+1/4','\\frac{1}{2}'],['1/-2+2/3','\\frac{1}{6}']]){
  const s=solve(q);assert.equal(s.answer,a);assert.equal(s.methods[0].steps.at(-1).math,a);
 }
 const steps=solve('1/2+2/3').methods[0].steps;
 assert.match(steps[1].math,/frac\{3\}\{6\}/);assert.match(steps[1].math,/frac\{4\}\{6\}/);
});
