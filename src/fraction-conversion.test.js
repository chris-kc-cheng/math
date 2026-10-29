import {test} from 'node:test';
import assert from 'node:assert/strict';
import {convertMixed,convertFraction} from './fraction-conversion.js';

test('mixed numbers become exact, simplified improper fractions',()=>{
  assert.equal(convertMixed(2,1,3).answer,'\\frac{7}{3}');
  assert.equal(convertMixed(2,2,4).answer,'\\frac{5}{2}');
  assert.equal(convertMixed(0,0,3).answer,'\\frac{0}{1}');
});
test('fractions become mixed numbers, proper fractions, or whole numbers',()=>{
  assert.equal(convertFraction(7,3).answer,'2\\,\\frac{1}{3}');
  assert.equal(convertFraction(10,4).answer,'2\\,\\frac{1}{2}');
  assert.equal(convertFraction(6,3).answer,'2');
  assert.equal(convertFraction(2,4).answer,'\\frac{1}{2}');
  assert.equal(convertFraction(0,4).answer,'0');
});
test('conversions preserve exact values across many round trips',()=>{
  for(let d=1;d<=20;d++)for(let n=0;n<=100;n++){
    const m=convertFraction(n,d),f=convertMixed(m.whole,m.numerator,m.denominator);
    assert.equal(BigInt(f.numerator)*BigInt(d),BigInt(n)*BigInt(f.denominator));
  }
  const large='123456789012345678901234567890';
  assert.equal(convertFraction(convertMixed(large,1,3).numerator,3).whole,large);
});
test('invalid numbers and zero denominators are rejected',()=>{
  for(const value of ['-1','1.5','x','', '1e3','9'.repeat(61)])assert.throws(()=>convertFraction(value,3));
  assert.throws(()=>convertFraction(1,0),/greater than zero/);
  assert.throws(()=>convertMixed(2,3,3),/smaller than one/);
});
