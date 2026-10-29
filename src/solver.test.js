import {test} from 'node:test';
import assert from 'node:assert/strict';
import {solve} from './solver.js';
test('sample questions produce correct simplest answers',()=>{for(const [q,a] of [['8+2+5','15'],['23-8','15'],['6 × 4','24'],['18 ÷ 3','6'],['3/4','\\frac{3}{4}'],['0.5+0.25','\\frac{3}{4}'],['2/4','\\frac{1}{2}'],['-2*-3','6'],['1/-2','\\frac{-1}{2}']])assert.equal(solve(q).answer,a);});
test('both addition methods end at the same result',()=>{const s=solve('8+2+5');assert.equal(s.methods.length,2);for(const m of s.methods)assert.equal(m.steps.at(-1).math,s.answer);});
test('simple LaTeX is accepted',()=>{assert.equal(solve('\\frac{6}{8}').answer,'\\frac{3}{4}');assert.equal(solve('3 \\times 4').answer,'12');});
test('invalid or undefined operations are rejected',()=>{for(const q of ['1/0','sqrt(-1)','2^3','alert(1)','1+2*3',''])assert.throws(()=>solve(q));});
