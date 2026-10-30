import {test} from 'node:test';
import assert from 'node:assert/strict';
import {integer,gcd,lcm,rational,parseDecimal,add,subtract,multiply,divide,compare,sum,calculate,integerResult,safeInteger,quotientRemainder,commonParts,roundHalfUp,equalDecimals} from './exact.js';
import {tex,rawFraction,scaledDecimal,fixed,money} from './format.js';
import {linearSolution,substituteLinear,divisionFacts,digitFacts,productDigitFacts,summarizeData,balance,scale,linearSequence,groupsNeeded,additiveFacts} from './relationships.js';

test('one rational representation normalizes signs, zeros and arbitrarily large integer values',()=>{
 assert.deepEqual(rational(6,-8),{n:-3n,d:4n});assert.deepEqual(rational(0,-8),{n:0n,d:1n});
 assert.equal(gcd(-18,24),6n);assert.equal(lcm(-6,8),24n);assert.equal(lcm(0,8),0n);
 assert.deepEqual(add(parseDecimal('0.1'),parseDecimal('0.2')),rational(3,10));
 assert.equal(tex(add('9007199254740993',1)),'9007199254740994');
 assert.ok(Object.isFrozen(rational(1,2)));
 for(const bad of [NaN,Infinity,1.2,Number.MAX_SAFE_INTEGER+1,'1/2','1+2','0x10'])assert.throws(()=>integer(bad));
 assert.throws(()=>rational(1,0));assert.throws(()=>divide(1,0));assert.throws(()=>safeInteger('9007199254740993'));assert.throws(()=>integerResult(rational(1,2)));assert.throws(()=>calculate('constructor',1,2));
});
test('shared operations preserve exact identities without mutating inputs',()=>{
 for(let n=-12;n<=12;n++)for(let d=1;d<=9;d++)for(let m=-3;m<=3;m++){
  const a=rational(n,d),b=rational(m,7),before={...a};
  const result=add(a,b);assert.equal(result.n*BigInt(d*7),BigInt(n*7+m*d)*result.d);
  assert.equal(compare(subtract(result,b),a),0);assert.equal(compare(add(a,b),add(b,a)),0);
  assert.equal(compare(multiply(a,b),multiply(b,a)),0);if(b.n)assert.equal(compare(divide(multiply(a,b),b),a),0);
  assert.deepEqual(a,before);
 }
 assert.deepEqual(sum([]),rational(0));assert.deepEqual(commonParts([rational(1,2),rational(2,3)]),{denominator:6n,numerators:[3n,4n]});
});
test('rounding and formatting use explicit exact decimal policy including ties and negative values',()=>{
 assert.equal(fixed(parseDecimal('1.005')), '1.01');assert.equal(fixed(parseDecimal('-1.005')),'-1.01');
 assert.equal(fixed(rational(1,3),3),'0.333');assert.equal(fixed(parseDecimal('9.95'),1),'10.0');
 assert.equal(scaledDecimal(-1),'−0.01'.replace('−','-'));assert.equal(scaledDecimal(5,0),'5');assert.equal(money(123),'$1.23');
 assert.equal(tex(roundHalfUp(rational(5,2))),'3');assert.equal(rawFraction('2+3',5),'\\frac{2+3}{5}');
 assert.ok(equalDecimals('+01.500','1.5'));assert.ok(equalDecimals('-0','0.00'));assert.ok(!equalDecimals('1/2','0.5'));assert.ok(!equalDecimals('1e2','100'));
 assert.throws(()=>roundHalfUp(1,-1));assert.throws(()=>scaledDecimal(1,1.5));
});
test('ordinary division, digit algorithms and grouping share the quotient/remainder identity',()=>{
 for(let n=0;n<300;n++)for(let d=1;d<20;d++){
  const facts=divisionFacts(n,d);assert.equal(facts.quotient*BigInt(d)+facts.remainder,BigInt(n));assert.ok(facts.remainder>=0n&&facts.remainder<BigInt(d));
  assert.deepEqual(facts,quotientRemainder(n,d));assert.equal(facts.product,facts.quotient*BigInt(d));assert.equal(groupsNeeded(n,d),BigInt(Math.ceil(n/d)));
 }
 assert.deepEqual(productDigitFacts(9,9,8),{total:89n,carry:8n,digit:9n});assert.deepEqual(digitFacts([9,9,9],2),{total:29n,carry:2n,digit:9n});
 assert.throws(()=>divisionFacts(-1,3));assert.throws(()=>divisionFacts(1,0));
});
test('shared linear relationships isolate, substitute, balance and scale exact values',()=>{
 const solution=linearSolution(3,2,9);assert.equal(solution.type,'unique');assert.deepEqual(solution.result,rational(7,3));assert.equal(compare(substituteLinear(3,2,solution.result),9),0);
 assert.equal(linearSolution(0,3,3).type,'all');assert.equal(linearSolution(0,3,4).type,'none');
 assert.deepEqual(linearSolution(rational(1,4),0,8).result,rational(32));
 assert.deepEqual(balance(4000,[1200,800]),rational(2000));assert.deepEqual(balance(10,[15]),rational(-5));assert.deepEqual(scale(1250,13,100),rational(325,2));
 assert.equal(compare(additiveFacts(rational(1,3),rational(2,5),true).check,rational(1,3)),0);
 assert.deepEqual(linearSequence(10,-3,4).map(tex),['10','7','4','1']);assert.throws(()=>linearSequence(0,1,1001));
});
test('one statistics implementation supports odd/even, repeated, decimal and very large values',()=>{
 const odd=summarizeData([2,3,3,4,8]);assert.equal(tex(odd.mean),'4');assert.equal(tex(odd.median),'3');assert.deepEqual(odd.modes.map(tex),['3']);
 const even=summarizeData(['1.2','1.5','1.5','2.2'].map(parseDecimal));assert.equal(tex(even.mean),'\\frac{8}{5}');assert.equal(tex(even.median),'\\frac{3}{2}');
 const multi=summarizeData([2,2,1,1]);assert.deepEqual(multi.modes.map(tex),['1','2']);assert.equal(tex(multi.median),'\\frac{3}{2}');
 const huge=summarizeData(['9007199254740995','9007199254740993']);assert.equal(tex(huge.mean),'9007199254740994');assert.deepEqual(summarizeData([1,2,3]).modes,[]);
 assert.throws(()=>summarizeData([]));
});
