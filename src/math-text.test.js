import test from 'node:test';
import assert from 'node:assert/strict';
import {splitMathText} from './math-text.js';
import {tidyText} from './math/core/tidy.js';
import {linear,sumOfTerms,term} from './math/core/terms.js';

test('slash fractions in prose become typeset fractions, dates and units do not',()=>{
 assert.deepEqual(splitMathText('Compare 3/4 and 5/6.'),[{text:'Compare '},{tex:'\\frac{3}{4}'},{text:' and '},{tex:'\\frac{5}{6}'},{text:'.'}]);
 assert.deepEqual(splitMathText('Add 2 1/2 and -1/3'),[{text:'Add '},{tex:'2\\,\\frac{1}{2}'},{text:' and '},{tex:'-\\frac{1}{3}'}]);
 assert.deepEqual(splitMathText('12/25/2026 and km/h'),[{text:'12/25/2026 and km/h'}]);
 assert.deepEqual(splitMathText('no fractions'),[{text:'no fractions'}]);
});

test('terms never print 1x, 0x or +-',()=>{
 assert.equal(term(1,'n'),'n');assert.equal(term(-1,'n'),'-n');assert.equal(term(5,'x'),'5x');
 assert.equal(linear(1,3),'x+3');assert.equal(linear(0,4),'4');assert.equal(linear(-2,0),'-2x');assert.equal(linear(3,-4),'3x-4');assert.equal(linear(0,0),'0');
 assert.equal(sumOfTerms([[5,'x'],[-3,'x']]),'5x-3x');assert.equal(sumOfTerms([[0,'x'],[2,'']]),'2');
});

test('tidyText fixes unit coefficients, double signs, plurals of one and denominators of one',()=>{
 assert.equal(tidyText('Find 1n + 8 when n = 4'),'Find n + 8 when n = 4');
 assert.equal(tidyText('12-1x'),'12-x');assert.equal(tidyText('11x+1'),'11x+1');assert.equal(tidyText('x^{1}'),'x^{1}');
 assert.equal(tidyText('2+-4'),'2-4');assert.equal(tidyText('2200--300=2500'),'2200-(-300)=2500');assert.equal(tidyText('5-(-3)'),'5-(-3)');
 assert.equal(tidyText('\\frac{6}{1}+\\frac{-8}{1}'),'6-8');assert.equal(tidyText('\\frac{1}{12}'),'\\frac{1}{12}');
 assert.equal(tidyText('There are 1 counters. Take away 1.'),'There is 1 counter. Take away 1.');
 assert.equal(tidyText('What number do 1 tens and 7 ones make?'),'What number do 1 ten and 7 ones make?');
 assert.equal(tidyText('11 counters and 0.1 tens'),'11 counters and 0.1 tens');
});

test('a unit to the power one is just the unit',()=>{
 assert.equal(tidyText('6\\pi\\;\\mathrm{cm}^{1}'),'6\\pi\\;\\mathrm{cm}');
 assert.equal(tidyText('\\mathrm{cm}^{2}'),'\\mathrm{cm}^{2}');
});
