import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import katex from 'katex';
import {createPractice,generateValues,nextValues,exampleValues} from '../../curriculum/practice.js';
import {grade8Rules,createGrade8,argumentCounts} from './index.js';
import {rootForm} from './number.js';
import {makePairs,describeRelationship,drawProbability,simulateDraws} from './data.js';
import {power,integerSquareRoot,rational,compare} from '../core/exact.js';
import {fitLine} from '../core/relationships.js';
import {tex} from '../core/format.js';
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const data=read('../../curriculum/data/ontario-math-grade-8.json'),questions=read('../../curriculum/data/grade-8-questions.json');
const answer=(rule,values)=>createGrade8(rule,values).answer;

test('Grade 8 covers the 51 researched expectations with valid reusable question links',()=>{
 const ids=new Set(),leaves=[];function visit(node){assert.ok(!ids.has(node.id));ids.add(node.id);if(node.children)node.children.forEach(visit);else leaves.push(node);}visit(data.curriculum);
 assert.equal(leaves.length,51);assert.equal(data.grade,8);assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
 for(const node of leaves){assert.ok(node.code&&node.description);assert.ok(questions.some(q=>q.skillId===node.id),node.id);}
 for(const template of questions){assert.ok(ids.has(template.skillId));assert.deepEqual(Object.keys(template.example).sort(),[...template.parameters].sort());assert.ok(createPractice(template).steps.length>=2,template.id);}
 for(const activity of data.activities)for(const id of activity.questionIds)assert.ok(questions.some(q=>q.id===id&&activity.skillIds.includes(q.skillId)));
 assert.deepEqual(Object.keys(grade8Rules).sort(),Object.keys(argumentCounts).sort());
});
test('all Grade 8 sample and randomized steps render without invalid numerical values',()=>{
 let seed=721;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
 for(const template of questions)for(let i=0;i<25;i++){
  const values=i?generateValues(template.rule,rng):exampleValues(template),result=createPractice(template,values);
  assert.ok(result.prompt||result.formula);assert.ok(!JSON.stringify(result).includes('NaN'),template.id);assert.ok(!JSON.stringify(result).includes('Infinity'),template.id);
  for(const part of [result,...result.steps]){if(part.formula||part.math)assert.doesNotThrow(()=>katex.renderToString(part.formula||part.math,{throwOnError:true,trust:false}),template.id);if(part.visual)assert.ok(part.visual.caption,template.id);}
  assert.notDeepEqual(nextValues(template,values,rng),values,template.id);
 }
});
test('exact powers, scientific notation, roots and signed rational arithmetic',()=>{
 assert.equal(tex(power(10,-6)),'\\frac{1}{1000000}');assert.equal(tex(power(-2,3)),'-8');assert.throws(()=>power(0,0));assert.throws(()=>power(0,-1));
 for(let n=0;n<1000;n++){const q=integerSquareRoot(n);assert.ok(q*q<=BigInt(n)&&(q+1n)*(q+1n)>BigInt(n));}assert.throws(()=>integerSquareRoot(-1));
 assert.equal(rootForm(50),'5\\sqrt{2}');assert.equal(rootForm(144),'12');
 assert.equal(answer('g8-scientific',[546,6]),'5460000');assert.equal(answer('g8-scientific',[125,-3]),'\\frac{1}{800}');
 assert.equal(answer('g8-percent',[25]),'\\frac{1}{400}');assert.equal(answer('g8-percent',[12500]),'\\frac{5}{4}');
 assert.equal(answer('g8-real-order',[2,3,2]),'>');assert.equal(answer('g8-real-order',[4,-3,2]),'<');
 assert.equal(answer('g8-fraction-add-sub',[3,4,2,3,1]),'\\frac{1}{12}');assert.equal(answer('g8-fraction-multiply-divide',[7,3,2,5,3]),'\\frac{35}{6}');
 assert.equal(answer('g8-integer-add-sub',[-7,-4,1]),'-3');assert.equal(answer('g8-integer-multiply-divide',[-24,6,3]),'-4');
});
test('Grade 8 linear equations handle both sides and inequality sign reversals',()=>{
 assert.equal(answer('g8-equation',[25,30,5,110]),'4');assert.equal(answer('g8-equation',[10,20,10,20]),'all');assert.equal(answer('g8-equation',[10,20,10,30]),'none');
 assert.equal(answer('g8-inequality',[-2,3,11,0]),'x>-4');assert.equal(answer('g8-inequality',[2,3,11,0]),'x<4');
 assert.equal(answer('g8-inequality',[-2,3,11,2]),'x\\ge-4');assert.equal(answer('g8-inequality',[2,3,11,3]),'x\\ge4');
 for(let a=-5;a<=5;a++)if(a)for(const greater of [0,1]){
  const result=createGrade8('g8-inequality',[a,-3,7,greater]),sign=result.answer.includes('>');
  const boundary=10/a;for(const x of [-10,-1,0,1,10])assert.equal(sign?x>boundary:x<boundary,Boolean(greater?a*x-3>7:a*x-3<7));
 }
});
test('paired-data fit and compound-event probabilities are exact',()=>{
 const fit=fitLine([[0,1],[1,3],[2,5]]);assert.equal(tex(fit.gradient),'2');assert.equal(tex(fit.intercept),'1');assert.equal(tex(fit.rSquared),'1');
 assert.equal(describeRelationship(makePairs(50,-3,0)).direction,'negative');assert.equal(describeRelationship(makePairs(50,0,0)).strength,'none');assert.throws(()=>fitLine([[1,2],[1,3]]));
 assert.equal(tex(drawProbability(3,2,false)),'\\frac{3}{10}');assert.equal(tex(drawProbability(3,2,true)),'\\frac{9}{25}');
 assert.equal(simulateDraws(3,2,false,20,()=>0),20);assert.equal(simulateDraws(0,3,true,20,()=>0.4),0);assert.throws(()=>simulateDraws(1,0,false,20));
 assert.equal(answer('g8-venn',[5,4,3,2]),'\\frac{6}{7}');
});
test('Grade 8 measurement and supplied financial models have known correct results',()=>{
 assert.equal(answer('g8-pythagorean',[3,4]),'5');assert.deepEqual(answer('g8-composite-solid',[4]),{volume:'128',surfaceArea:'160'});
 assert.equal(answer('g8-pythagorean-leg',[13,5]),'12');assert.throws(()=>createGrade8('g8-pythagorean-leg',[3,4]));
 assert.deepEqual(answer('g8-composite-area',[12,10,4,3]),{area:'108',perimeter:44});assert.equal(answer('g8-scale-drawing',[6,4,100,2]),'240000');
 assert.equal(answer('g8-metric-prefix',[3,3]),'\\frac{3}{1000000}');
 assert.deepEqual(answer('g8-interest',[100000,5,3]),{simple:'1150.00',compound:'1157.63'});
 assert.equal(answer('g8-financial-goal',[4000,1500,10,20000]),'10');assert.equal(answer('g8-exchange',[10000,135,2,300]),'Percentage fee');
 assert.equal(answer('g8-credit-offers',[50000,12,10,0,1500]),'A');
 assert.throws(()=>createGrade8('g8-fraction-multiply-divide',[1,2,0,3,3]));assert.throws(()=>createGrade8('g8-roots',[-1]));assert.throws(()=>createGrade8('g8-equation',['2x',1,2,3]));
});
