import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moleChoices} from './mole-choices.js';
import {parseAnswer} from './model.js';
import {rational,compare} from '../math/core/exact.js';
test('mole choices have five distinct exact answers and exactly one correct choice',()=>{
 for(const answer of [rational(0),rational(4),rational(-3),rational(2,3),rational(12345,100)])for(let seed=0;seed<20;seed++){
  const choices=moleChoices(answer,seed);assert.equal(new Set(choices).size,5);
  assert.equal(choices.filter(s=>compare(parseAnswer(s),answer)===0).length,1);
  assert.deepEqual(choices,moleChoices(answer,seed));
  if(answer.n>=0n)assert(choices.every(s=>parseAnswer(s).n>=0n));
 }
});
