import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const data=JSON.parse(readFileSync(new URL('./data/ontario-math-grade-5.json',import.meta.url),'utf8'));
const questions=JSON.parse(readFileSync(new URL('./data/practice-questions.json',import.meta.url),'utf8'));
test('shared curriculum has stable unique IDs and all activity references resolve',()=>{
 assert.equal(data.schemaVersion,1);
 const ids=new Set();let skills=0;
 function visit(node){
  assert.ok(node.id&&node.title);assert.ok(!ids.has(node.id),`Duplicate ID: ${node.id}`);ids.add(node.id);
  if(node.children)node.children.forEach(visit);else {skills++;assert.ok(node.code&&node.description&&node.example);}
 }
 visit(data.curriculum);assert.equal(skills,58);
 const activityIds=new Set();
 for(const activity of data.activities){
  assert.ok(!activityIds.has(activity.id));activityIds.add(activity.id);
  assert.ok(activity.skillIds.length);for(const id of activity.skillIds)assert.ok(ids.has(id));
  assert.ok(activity.modes.length);assert.ok(['partial','complete'].includes(activity.coverage));
  assert.ok(activity.href.startsWith('./'));assert.ok(!activity.href.includes('..'));
  assert.doesNotThrow(()=>readFileSync(new URL(`../../${activity.href}`,import.meta.url)));
  for(const id of activity.questionIds||[])assert.ok(questions.some(question=>question.id===id&&activity.skillIds.includes(question.skillId)));
 }
});
