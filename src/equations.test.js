import {test} from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import {solve} from './solver.js';
test('simple equations isolate x with exact rational answers',()=>{
 for(const [input,answer] of [['x+5=12','x=7'],['x-5=12','x=17'],['3x=18','x=6'],['2x+3=11','x=4'],['-x+3=2','x=1'],['3x=1','x=\\frac{1}{3}'],['-3x=1','x=\\frac{-1}{3}'],['2\\times x+3=11','x=4'],['x=-2','x=-2']]){
  const result=solve(input);assert.equal(result.kind,'equation');assert.equal(result.answer,answer);assert.equal(result.methods[0].steps.at(-1).math,answer);
  for(const step of result.methods[0].steps)assert.doesNotThrow(()=>katex.renderToString(step.math,{throwOnError:true}));
 }
});
test('generated solutions satisfy their original equation, including negative coefficients',()=>{
 for(let a=-7;a<=7;a++)for(let b=-5;b<=5;b++)for(let c=-7;c<=7;c++){
  const result=solve(`${a}x${b>=0?'+':''}${b}=${c}`);
  if(a===0){assert.equal(result.solutionType,b===c?'all':'none');continue;}
  const n=BigInt(result.result.numerator),d=BigInt(result.result.denominator);
  assert.ok(d>0n);assert.equal(BigInt(a)*n+BigInt(b)*d,BigInt(c)*d);
 }
});
test('equation steps show the same inverse operation on both sides',()=>{
 const steps=solve('2x+3=11').methods[0].steps;
 assert.equal(steps[1].math,'2x+3\\textcolor{#2459a6}{-3}=11\\textcolor{#2459a6}{-3}');
 assert.equal(steps[2].math,'2x=8');assert.match(steps[3].math,/frac\{2x\}/);assert.equal(steps.at(-1).math,'x=4');
 for(const input of ['0x+3=5','0x+3=3'])for(const step of solve(input).methods[0].steps)assert.doesNotThrow(()=>katex.renderToString(step.math,{throwOnError:true}));
});
test('unsupported equation structures are rejected',()=>{
 for(const input of ['2x+3=4x','x+y=2','x^2=4','1/x=2','0.5x=2','x=1/2','2(x+1)=4','x+alert(1)=2','x==3','2*+x=3'])assert.throws(()=>solve(input));
});
