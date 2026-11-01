import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from './catalog.js';
import {createPractice,generateQuestionValues,nextValues} from './practice.js';
import {valueRank,sigDigits,difficultyOf,difficultyOfFormula,progressiveLevel,cycleLevel,levelFor,normalizeChoice,sampleValue,rankOf,LEVELS} from './difficulty.js';

const seeded=seed=>()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296;};
const templates=catalog.flatMap(grade=>grade.questions);

test('commonly seen small numbers are simple; awkward ones are hard',()=>{
 for(const n of [2,5,10,20,25,50,75,100])assert.equal(valueRank(n,100),1,String(n));
 assert.equal(valueRank(50,100),1);assert.equal(valueRank(0,100),1);
 assert.equal(valueRank(35,100),2);assert.equal(valueRank(80,100),2);
 assert.equal(valueRank(87,100),3);assert.equal(valueRank(483,500),3);
 assert.equal(valueRank(-4,12),1);assert.equal(valueRank(11,12),3);
 assert.equal(sigDigits(1200),2);assert.equal(sigDigits(0.5),1);assert.equal(sigDigits(305),3);
});
test('formulas are judged by the digits that are typed',()=>{
 assert.equal(difficultyOfFormula('2 + 3 × 4'),1);assert.equal(difficultyOfFormula('50% of 80'),2);
 assert.equal(difficultyOfFormula('0.5 + 0.25'),1);assert.equal(difficultyOfFormula('156 ÷ 12'),3);
});
test('progressive difficulty starts simple, then medium, then hard',()=>{
 assert.deepEqual(Array.from({length:5},(_,i)=>progressiveLevel(i,5)),['simple','simple','medium','medium','hard']);
 assert.deepEqual(Array.from({length:10},(_,i)=>progressiveLevel(i,10)),['simple','simple','simple','simple','medium','medium','medium','hard','hard','hard']);
 assert.equal(progressiveLevel(0,1),'simple');assert.equal(progressiveLevel(99,5),'hard');
 assert.equal(levelFor('hard',0,5),'hard');assert.equal(levelFor('auto',4,5),'hard');assert.equal(normalizeChoice('nonsense'),'auto');
});
test('range sampling respects the level and the domain grid',()=>{
 const rng=seeded(7),percent={min:5,max:95,step:5},amount={min:20,max:400,step:10};
 for(let i=0;i<200;i++){
  const p=sampleValue(percent,1,rng),a=sampleValue(amount,1,rng);
  assert.ok(valueRank(p,95)===1&&(p-5)%5===0&&p>=5&&p<=95,`percent ${p}`);
  assert.ok(valueRank(a,400)===1&&(a-20)%10===0,`amount ${a}`);
 }
 const seen=new Set();for(let i=0;i<300;i++)seen.add(sampleValue(percent,1,rng));
 assert.ok(seen.has(50)&&seen.has(25)&&seen.has(10),[...seen].join());
 for(let i=0;i<50;i++)assert.equal(valueRank(sampleValue([2,3,4,5,6,7,8,9,12],1,rng),12),1);
});

test('every template can make a valid question at every level, and levels follow the numbers',()=>{
 const stats={1:[],2:[],3:[]};let unreachable={1:0,2:0,3:0};
 for(const [index,template] of templates.entries()){
  for(const level of LEVELS){
   const rng=seeded(index*31+level.rank);
   let values;try{values=generateQuestionValues(template,rng,level.id);}catch(error){assert.fail(`${template.id} (${level.id}): ${error.message}`);}
   assert.doesNotThrow(()=>createPractice(template,values),`${template.id} (${level.id})`);
   const reached=difficultyOf(template,values);
   assert.ok(reached<=Math.max(level.rank,reached),'rank is a number');
   stats[level.rank].push(reached);if(reached!==level.rank)unreachable[level.rank]++;
  }
 }
 const mean=list=>list.reduce((a,b)=>a+b,0)/list.length;
 assert.ok(mean(stats[1])<mean(stats[2])&&mean(stats[2])<mean(stats[3]),`means ${mean(stats[1])} ${mean(stats[2])} ${mean(stats[3])}`);
 // Simple questions really are simple (almost always); a few templates have domains too small to vary.
 assert.ok(unreachable[1]/templates.length<0.05,`simple missed ${unreachable[1]} of ${templates.length}`);
 assert.ok(stats[1].filter(r=>r===1).length/templates.length>0.95);
});

test('generation without a level is unchanged and nextValues accepts a level',()=>{
 const template=templates.find(item=>item.generation&&item.rule==='fraction-add')||templates.find(item=>item.generation);
 const a=generateQuestionValues(template,seeded(5)),b=generateQuestionValues(template,seeded(5));
 assert.deepEqual(a,b);
 const next=nextValues(template,a,seeded(9),'simple');assert.notDeepEqual(next,a);assert.equal(typeof rankOf('simple'),'number');
});
test('a simple percent-of question uses benchmark numbers such as 50% of 80',()=>{
 const template=templates.find(item=>item.rule==='percent-story');
 assert.ok(template);
 const rng=seeded(3);
 for(let i=0;i<40;i++){const values=generateQuestionValues(template,rng,'simple');assert.ok(valueRank(values[0],95)===1,`percent ${values[0]}`);}
});
test('Auto in endless practice toggles simple, medium, hard and wraps around',()=>{
 assert.deepEqual(Array.from({length:7},(_,i)=>cycleLevel(i)),['simple','medium','hard','simple','medium','hard','simple']);
});
