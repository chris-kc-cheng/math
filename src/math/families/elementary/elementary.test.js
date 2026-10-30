import test from 'node:test';
import assert from 'node:assert/strict';
import {createElementary} from './index.js';
const solve=(rule,args)=>createElementary(rule,args,{});

test('shared elementary number families have independently known results',()=>{
 assert.equal(solve('expanded-number',[1000000000,1]).answer,'1000000000');
 assert.equal(solve('round-number',[3475,3,-2]).answer,'3.48');
 assert.equal(solve('round-number',[-3475,3,-2]).answer,'-3.48');
 assert.equal(solve('decimal-calculate',[236,4,0,1,2]).answer,'\\frac{472}{5}');
 assert.equal(solve('decimal-calculate',[236,4,0,1,3]).answer,'590');
 assert.equal(solve('decimal-calculate',[2375,5,3,0,3]).answer,'\\frac{19}{40}');
 assert.equal(solve('divisibility',[234,6]).answer,'Yes');assert.equal(solve('divisibility',[235,6]).answer,'No');
 assert.equal(solve('prime-factors',[84]).answer,'2 × 2 × 3 × 7');
 assert.deepEqual(solve('common-factors',[24,36,0]).answer,{gcf:'12',lcm:'72'});
 assert.deepEqual(solve('common-factors',[12,18,24]).answer,{gcf:'6',lcm:'72'});
 assert.equal(solve('percent-quantity',[80,25,1]).answer,'100');
 assert.equal(solve('percent-quantity',[80,25,2]).answer,'60');
 assert.equal(solve('between-values',[-3,4,1,2]).answer,'\\frac{-1}{8}');
 assert.equal(solve('whole-power',[3,4]).answer,'81');
 assert.deepEqual(solve('proportional-table',[3,5,8]).answer,{proportional:false,total:29});
});

test('measurement and financial families preserve dimensions, rates, and inverse identities',()=>{
 assert.equal(solve('elapsed-time',[1410,95]).answer,'01:05 (+1 day)');
 assert.equal(solve('rectangle-measure',[8,5,1]).answer,'8');
 assert.equal(solve('angle-relationship',[235,3]).answer,'125');
 assert.equal(solve('decomposed-area',[8,4,5,0]).answer,'30');
 assert.equal(solve('decomposed-area',[8,4,5,1]).answer,'16');
 assert.equal(solve('surface-area',[6,4,3,0]).answer,'108');
 assert.equal(solve('surface-area',[6,4,5,1]).answer,'96');
 assert.equal(solve('circle-measure',[3,5,0]).answer,'6\\pi');
 assert.equal(solve('circle-measure',[3,5,3]).answer,'48\\pi');
 assert.equal(solve('circle-measure',[3,5,4]).answer,'45\\pi');
 assert.equal(solve('dimensional-units',[25000,-2,2]).answer,'\\frac{5}{2}');
 assert.equal(solve('capacity-volume',[2500,0]).answer,'\\frac{5}{2}');
 assert.deepEqual(solve('combined-transform',[-3,2,4,-1,1]).answer,[-1,1]);
 assert.equal(solve('cash-purchase',[4,3,20]).answer,'8');
 assert.equal(solve('currency-convert',[10000,135,0]).answer,'135');
 assert.equal(solve('currency-convert',[13500,135,1]).answer,'100');
 assert.equal(solve('simple-interest',[500,5,3,10]).answer,'585');
 assert.equal(solve('savings-plan',[40,15,200]).answer,'8');
});

test('new data and coding families keep events and observations distinct',()=>{
 assert.deepEqual(solve('data-intervals',[12,18,23,29,30,10]).answer,[2,2,1]);
 assert.deepEqual(solve('data-stem-leaf',[12,23,21,12,35]).answer,[12,12,21,23,35]);
 assert.deepEqual(solve('data-circle',[10,6,4]).answer,['50','30','20']);
 assert.deepEqual(solve('probability-trials',[3,2,0,30,8]).answer,{theoretical:'\\frac{3}{10}',experimental:'\\frac{4}{15}'});
 assert.deepEqual(solve('probability-trials',[3,2,1,30,11]).answer,{theoretical:'\\frac{9}{25}',experimental:'\\frac{11}{30}'});
 assert.equal(solve('nested-code',[4,3]).answer,'12');
 assert.equal(solve('conditional-code',[2,3,5,10]).answer,'14');
});

test('unsupported domains and non-real/undefined operations are rejected',()=>{
 assert.throws(()=>solve('decimal-calculate',[1,0,0,0,3]),/divisor/);
 assert.throws(()=>solve('prime-factors',[13]),/composite/);
 assert.throws(()=>solve('between-values',[1,2,1,2]),/distinct/);
 assert.throws(()=>solve('cash-purchase',[9,5,20]),/cover/);
 assert.throws(()=>solve('probability-trials',[3,2,0,10,11]),/valid/);
 assert.throws(()=>solve('surface-area',[0,4,3,0]),/positive/);
 assert.throws(()=>solve('anything',[1]),/Unsupported/);
});
