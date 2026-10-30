import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import katex from 'katex';
import {createGrade5,grade5Rules,argumentRanges} from './index.js';
import {numberWords} from './number.js';
import {equalDecimal} from './common.js';
import {simulateCoin} from './data.js';
import {createPractice} from '../../curriculum/practice.js';
const templates=JSON.parse(readFileSync(new URL('../../curriculum/data/practice-questions.json',import.meta.url),'utf8'));
const answer=(rule,values)=>createGrade5(rule,values).answer;

test('known number and fraction results include zero, ties, and rounding across a whole',()=>{
 assert.equal(numberWords(100000),'one hundred thousand');assert.equal(numberWords(48306),'forty-eight thousand three hundred six');assert.equal(numberWords(0),'zero');
 assert.equal(answer('order-whole',[100000,0,0]),'0, 0, 100000');
 assert.equal(answer('compare-fractions',[3,4,5,6]),'<');assert.equal(answer('compare-fractions',[3,2,9,6]),'=');
 assert.equal(answer('order-fractions',[3,4,5,6,3,2]),'3/4, 5/6, 3/2');
 assert.equal(answer('round-tenth',[995]),'10.0');assert.equal(answer('round-tenth',[994]),'9.9');assert.equal(answer('round-tenth',[0]),'0.0');
 assert.deepEqual(answer('percent-fraction',[25]),{fraction:'\\frac{1}{4}',decimal:'0.25'});
 assert.equal(answer('mental-scale',[460,2]),'4.60');
 assert.equal(answer('fraction-subtract',[4,1,5]),'\\frac{3}{5}');
 assert.equal(answer('unit-fraction',[3,2,1]),'6');assert.equal(answer('unit-fraction',[3,2,0]),'\\frac{3}{2}');
 assert.equal(answer('multiplication-area',[24,13]),312);assert.equal(answer('division-area',[125,12]),'10 remainder 5');
 assert.equal(answer('equivalent-ratio',[2,3,2]),'4:6');
 assert.equal(answer('decimal-addition',[2475,860]),'33.35');assert.equal(answer('decimal-subtraction',[2475,860]),'16.15');assert.equal(answer('decimal-subtraction',[101,2]),'0.99');
});
test('algebra verifies equations, inequality boundaries, and loop execution order',()=>{
 assert.equal(answer('evaluate-expression',[3,2,4]),14);
 assert.equal(answer('equation-subtract',[34,56]),90);assert.equal(answer('equation-divide',[4,8]),32);
 const lt=answer('inequality',[5,12,0]).split(', ').map(Number),gt=answer('inequality',[5,12,1]).split(', ').map(Number);
 assert.deepEqual(lt,[0,1,2,3,4,5,6]);assert.ok(!gt.includes(7)&&gt.includes(8)&&gt.includes(50));
 for(const type of [0,1,2])for(const greater of [0,1]){
  const result=answer('inequality-operation',[3,8,type,greater]).split(', ').map(Number);
  for(let x=0;x<=50;x++){const lhs=type===0?x-3:type===1?3*x:x/3,rhs=type===0?5:type===1?24:8;assert.equal(result.includes(x),Boolean(greater?lhs>rhs:lhs<rhs));}
 }
 assert.equal(answer('coding-loop',[2,3,4]),14);assert.equal(answer('coding-condition',[25,2]),'parts left over');
 assert.equal(answer('seating-model',[27,6,4]),6);
 for(const template of templates.filter(q=>q.rule.startsWith('equation-')&&!grade5Rules[q.rule]))assert.match(createPractice(template).steps.at(-1).text,/Substitute/);
});
test('statistics handle decimal units, even medians, multimodes, and no mode',()=>{
 assert.deepEqual(answer('statistics',[2,3,3,4,8,0]),{mean:'4',median:'3',modes:['3']});
 assert.deepEqual(answer('statistics-even',[12,15,15,22,1]),{mean:'\\frac{8}{5}',median:'\\frac{3}{2}',modes:['1.5']});
 assert.deepEqual(answer('statistics-even',[1,1,2,2,0]),{mean:'\\frac{3}{2}',median:'\\frac{3}{2}',modes:['1','2']});
 assert.deepEqual(answer('statistics-even',[1,2,3,4,0]).modes,[]);
 assert.equal(answer('probability',[0,6,5]),'0');assert.equal(answer('probability',[6,6,5]),'1');
 assert.equal(answer('experimental-probability',[17,30]),'\\frac{17}{30}');
});
test('geometry, metric and money calculations use exact supplied units',()=>{
 assert.equal(answer('triangle-sides',[5,5,5]),'equilateral');assert.equal(answer('triangle-sides',[5,5,6]),'isosceles');
 assert.equal(answer('congruent-shapes',[4,3,1]),'Yes');assert.equal(answer('congruent-shapes',[4,3,0]),'No');
 assert.deepEqual(answer('cube-views',[1,3,2,1]),{front:[2,3],side:[3,2]});
 assert.equal(answer('coordinates',[2,4,3,0]),'(5, 4)');
 assert.deepEqual(answer('transformation',[2,3,2]),[[7,2],[7,3],[6,2]]);
 assert.equal(answer('metric-conversion',[25,0]),250);assert.equal(answer('metric-conversion',[25,1]),2500);
 assert.equal(answer('shape-area',[3,3,1]),4.5);assert.equal(answer('shape-area',[8,5,0]),40);
 assert.deepEqual(answer('area-perimeter',[3,2]),{area:12,perimeters:[14,16]});
 assert.equal(answer('sales-tax',[1250,750,13]),'22.60');assert.equal(answer('sales-tax',[5,0,10]),'0.06');
 assert.equal(answer('budget',[4000,1200,800]),'20.00');assert.equal(answer('credit-debt',[2000,200,500]),'17.00');
 assert.equal(answer('unit-price',[5,3,20,25]),'A');assert.equal(answer('unit-price',[5,3,25,25]),'Same value');
});
test('every registered rule has bounded arguments and every generated formula is renderable',()=>{
 assert.deepEqual(Object.keys(argumentRanges).sort(),Object.keys(grade5Rules).sort());
 let seed=123;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
 for(const [rule,entry] of Object.entries(grade5Rules))for(let i=0;i<50;i++){
  const values=entry.generate(rng),result=createGrade5(rule,values);
  assert.ok(result.prompt&&result.steps.length>=2,rule);
  for(const part of [result,...result.steps]){
   if(part.math||part.formula)assert.doesNotThrow(()=>katex.renderToString(part.math||part.formula,{throwOnError:true,trust:false}),rule);
   if(part.visual)assert.ok(part.visual.caption,rule);
  }
  assert.ok(!JSON.stringify(result).includes('NaN'),rule);assert.ok(!JSON.stringify(result).includes('Infinity'),rule);
 }
});
test('generated numeric relationships preserve mathematical invariants',()=>{
 let seed=57;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
 for(let i=0;i<300;i++){
  const [n,d,k]=grade5Rules['probability'].generate(rng);assert.ok(n<=d&&d>0&&k>0);
  const [a,b,c]=grade5Rules['triangle-sides'].generate(rng);assert.ok(a+b>c&&a+c>b&&b+c>a);
  const l=createGrade5('triangle-sides',[a,b,c]),points=l.steps[2].visual.points;
  const distance=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
  assert.ok(Math.abs(distance(points[0],points[1])-a)<1e-9);assert.ok(Math.abs(distance(points[1],points[2])-b)<1e-9);assert.ok(Math.abs(distance(points[2],points[0])-c)<1e-9);
  const [people,capacity,extra]=grade5Rules['seating-model'].generate(rng),tables=answer('seating-model',[people,capacity,extra]);assert.ok(tables*capacity>=people+extra&&(tables-1)*capacity<people+extra);
  const [p,q]=grade5Rules['area-perimeter'].generate(rng),result=answer('area-perimeter',[p,q]);assert.equal(result.area,p*2*q);assert.equal(result.area,2*p*q);
 }
});
test('invalid domain values and unsafe expressions are rejected',()=>{
 for(const bad of [[],[-1],[NaN],[Infinity],['1+2'],[1.5]])assert.throws(()=>createGrade5('place-value',bad));
 for(const [rule,v] of [['triangle-sides',[1,2,3]],['probability',[7,6,1]],['fraction-subtract',[1,2,5]],['fraction-percent',[1,3]],['budget',[1,2,3]],['metric-conversion',[2,9]],['whole-add-subtract',[100000,1,0]]])assert.throws(()=>createGrade5(rule,v));
 assert.ok(equalDecimal('1.50','1.5'));assert.ok(equalDecimal('-0.25','-0.250'));assert.ok(!equalDecimal('1/2','0.5'));assert.ok(!equalDecimal('1+1','2'));
 assert.equal(simulateCoin(10,()=>0.1),10);assert.equal(simulateCoin(10,()=>0.9),0);assert.throws(()=>simulateCoin(201));
});
test('hands-on activities retain their builder configuration',()=>{
 const types=new Set();
 for(const template of templates){const result=createPractice(template);if(result.builder)types.add(result.builder.kind);}
 assert.deepEqual([...types].sort(),['angle','budget','coin','condition','coordinates','graph','infographic','loop','survey','triangle']);
});
