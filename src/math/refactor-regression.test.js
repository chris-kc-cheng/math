import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createPractice} from '../curriculum/practice.js';
import {solve} from './arithmetic.js';
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const baseline=read('./fixtures/pre-refactor-behavior.json');
const templates=read('../curriculum/data/practice-questions.json');
// Verification is a new, separate playback stage; preserve all original solution data.
const hash=value=>{const {verification,...original}=value;return createHash('sha256').update(JSON.stringify(original)).digest('hex');};
test('shared-operation refactor preserves 240 complete curriculum lessons and parser examples',()=>{
 for(const sample of baseline.practice){const template=templates.find(item=>item.id===sample.id);assert.equal(hash(createPractice(template,sample.values)),sample.sha256,`${sample.id}: ${sample.values}`);}
 for(const sample of baseline.arithmetic)assert.equal(hash(solve(sample.input)),sample.sha256,sample.input);
});
