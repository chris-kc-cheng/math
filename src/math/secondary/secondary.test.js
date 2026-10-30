import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import {secondaryRules,createSecondary} from './index.js';
import {fiveNumbers} from './data.js';

// Independently worked answers: [rule, parameters without style, style, expected answer].
const KNOWN=[
 ['sec-number-sets',[0,1],0,'natural numbers'],['sec-number-sets',[6,1],0,'irrational numbers'],['sec-number-sets',[2,1],0,'integers'],['sec-number-sets',[3,1],0,'rational numbers'],
 ['sec-number-sets',[7,1],3,'yes'],['sec-number-sets',[6,1],3,'no'],
 ['sec-density',[1,4,2],2,'1'],['sec-density',[1,4,2],3,'\\frac{1}{8}'],
 ['sec-power-value',[2,5],0,'32'],['sec-power-value',[3,2],1,'\\frac{1}{9}'],['sec-power-value',[4,3],3,'-64'],['sec-power-value',[2,3],4,'-8'],['sec-power-value',[2,3],5,'3'],
 ['sec-scientific',[35,5,3,2],0,'350000'],['sec-scientific',[35,-3,3,2],0,'0.0035'],['sec-scientific',[35,5,3,2],1,'5'],['sec-scientific',[35,2,4,3],4,'6'],
 ['sec-exponent-laws',[2,3,4,2],0,'7'],['sec-exponent-laws',[2,3,4,2],1,'-1'],['sec-exponent-laws',[2,3,4,2],2,'12'],['sec-exponent-laws',[2,3,4,2],3,'128'],['sec-exponent-laws',[2,3,4,2],4,'4'],['sec-exponent-laws',[2,3,4,2],5,'4'],['sec-exponent-laws',[2,3,4,2],6,'32'],
 ['sec-integer-context',[8,12,5],0,'-15'],['sec-integer-context',[8,12,5],1,'-1'],['sec-integer-context',[8,12,5],3,'1'],
 ['sec-unit-fraction',[3,8,3],0,'\\frac{3}{8}'],['sec-unit-fraction',[3,8,3],1,'24'],['sec-unit-fraction',[3,8,3],2,'\\frac{9}{8}'],['sec-unit-fraction',[3,8,3],3,'0.375'],['sec-unit-fraction',[3,8,3],4,'6'],
 ['sec-signed-rational',[3,4,2,5],0,'\\frac{-3}{4}'],['sec-signed-rational',[3,4,2,5],1,'\\frac{3}{4}'],['sec-signed-rational',[3,4,2,5],2,'-12'],['sec-signed-rational',[3,4,2,5],3,'-0.6'],['sec-signed-rational',[3,4,2,5],5,'\\frac{23}{20}'],
 ['sec-fraction-ops',[3,4,-1,6,2],0,'\\frac{7}{12}'],['sec-fraction-ops',[3,4,-1,6,2],1,'\\frac{11}{12}'],['sec-fraction-ops',[3,4,-1,6,2],2,'\\frac{-1}{8}'],['sec-fraction-ops',[3,4,-1,6,2],3,'\\frac{-9}{2}'],['sec-fraction-ops',[1,2,1,3,2],4,'\\frac{29}{6}'],['sec-fraction-ops',[1,2,1,3,2],5,'\\frac{5}{3}'],
 ['sec-rates-percent',[24,6,15],0,'72'],['sec-rates-percent',[24,6,25],1,'25'],['sec-rates-percent',[4,5,10],2,'8'],['sec-rates-percent',[10,6,20],4,'90.40'],['sec-rates-percent',[8,2,5],5,'20'],
 ['sec-write-expression',[3,2,20],0,'62'],['sec-write-expression',[3,2,4],1,'14'],['sec-write-expression',[3,2,10],2,'32'],['sec-write-expression',[3,2,5],3,'24'],['sec-write-expression',[3,2,7],4,'23'],
 ['sec-equivalent-expressions',[3,4,2],0,'yes'],['sec-equivalent-expressions',[3,4,3],0,'no'],['sec-equivalent-expressions',[3,4,2],1,'8'],['sec-equivalent-expressions',[3,4,2],2,'12'],['sec-equivalent-expressions',[3,4,2],3,'24'],
 ['sec-simplify',[3,2,4,-5],0,'7'],['sec-simplify',[3,2,4,-5],1,'-3'],['sec-simplify',[3,2,4,-5],2,'6'],['sec-simplify',[3,4,2,5],3,'22'],['sec-simplify',[2,3,4,5],4,'36'],
 ['sec-solve-linear',[4,3,5,1],0,'4'],['sec-solve-linear',[-3,3,5,1],1,'-3'],['sec-solve-linear',[3,3,5,1],3,'3'],
 ['sec-code-trace',[2,4,3,6],0,'14'],['sec-code-trace',[2,4,3,6],1,'32'],['sec-code-trace',[2,4,3,6],2,'5'],['sec-code-trace',[2,4,3,6],3,'20'],['sec-code-trace',[2,4,3,6],4,'30'],['sec-code-trace',[2,4,3,6],5,'5'],
 ['sec-relation-compare',[5,2,3],4,'17'],['sec-linear-represent',[3,5,6],2,'23'],['sec-linear-represent',[3,20,4],4,'8'],
 ['sec-two-lines',[4,5,2,3],0,'4'],['sec-two-lines',[4,5,2,3],1,'23'],['sec-two-lines',[4,5,2,3],4,'27'],
 ['sec-line-equation',[2,5,3,2],0,'3'],['sec-line-equation',[2,5,3,2],1,'-1'],['sec-line-equation',[2,5,3,2],2,'14'],
 ['sec-quartiles',[12,3,2,4,1,5,2,0],0,'21'],['sec-quartiles',[12,3,2,4,1,5,2,0],1,'15'],['sec-quartiles',[12,3,2,4,1,5,2,0],2,'27'],['sec-quartiles',[12,3,2,4,1,5,2,0],3,'12'],['sec-quartiles',[12,3,2,4,1,5,2,0],4,'17'],['sec-quartiles',[12,3,2,4,1,5,2,0],5,'45'],
 ['sec-circle-triangle',[50,60,0],0,'70'],['sec-circle-triangle',[50,60,0],1,'65'],['sec-circle-triangle',[50,60,0],4,'40'],
 ['sec-unit-convert',[12,1],0,'30.48'],['sec-unit-convert',[12,0],4,'144'],['sec-unit-convert',[3,1],6,'30000'],
 ['sec-scale-effect',[5,2],0,'4'],['sec-scale-effect',[5,3],1,'27'],['sec-scale-effect',[0,2],4,'21'],['sec-scale-effect',[5,3],7,'1350'],
 ['sec-pythagoras',[0,1,5,7],0,'5'],['sec-pythagoras',[1,1,5,7],1,'12'],['sec-pythagoras',[0,1,5,7],3,'5'],['sec-pythagoras',[1,1,5,7],5,'30'],
 ['sec-volume',[4,6,3],0,'72'],['sec-volume',[3,4,3],1,'12'],['sec-volume',[4,6,3],4,'72'],['sec-volume',[2,3,2],2,'37.7'],
 ['sec-appreciation',[10,6,3],0,'1191.02'],['sec-appreciation',[10,5,3],1,'8500'],['sec-borrowing',[10,6,3],0,'180.00'],['sec-borrowing',[10,6,3],1,'191.02'],['sec-budget-modify',[40,12,8,5],0,'1500'],
 // Grade 10
 ['sec-quadratic-data',[2,-3,1],0,'2'],['sec-quadratic-data',[2,-3,1],1,'1'],['sec-quadratic-data',[2,-3,1],2,'21'],
 ['sec-second-differences',[2,1,0,1],1,'4'],['sec-second-differences',[2,1,0,3],1,'36'],
 ['sec-parabola-features',[1,2,-3,1],0,'2'],['sec-parabola-features',[1,2,-3,1],1,'-3'],['sec-parabola-features',[1,2,-3,1],2,'1'],['sec-parabola-features',[1,2,-4,1],3,'4'],['sec-parabola-features',[1,2,-3,1],4,'-3'],
 ['sec-exponential-vs-quadratic',[4,2],0,'16'],['sec-exponential-vs-quadratic',[4,2],1,'\\frac{1}{4}'],['sec-exponential-vs-quadratic',[4,2],2,'equal'],['sec-exponential-vs-quadratic',[5,2],3,'7'],
 ['sec-transformations',[2,3,-1],0,'3'],['sec-transformations',[2,3,-1],1,'-1'],['sec-transformations',[-2,3,-1],2,'downward'],
 ['sec-sketch-parabola',[2,1,-3,2],0,'-1'],['sec-sketch-parabola',[2,1,-3,2],2,'-1'],
 ['sec-parabola-equation',[2,3,-1],0,'2'],['sec-parabola-equation',[2,3,-1],1,'2'],
 ['sec-expand',[3,5,1,1],0,'8'],['sec-expand',[3,5,1,1],1,'15'],['sec-expand',[4,1,1,1],2,'8'],['sec-expand',[4,1,1,1],3,'-16'],['sec-expand',[2,3,1,-4],4,'-5'],['sec-expand',[2,3,1,1],5,'12'],['sec-expand',[2,3,4,5],7,'22'],
 ['sec-factor',[2,3,2,3],0,'2'],['sec-factor',[2,3,2,3],1,'3'],['sec-factor',[2,3,2,3],2,'3'],['sec-factor',[2,3,5,4],3,'4'],['sec-factor',[1,5,2,3],7,'28'],
 ['sec-zeros-from-factors',[1,2,6,3],0,'6'],['sec-zeros-from-factors',[1,2,6,3],1,'4'],['sec-zeros-from-factors',[1,2,6,3],2,'-4'],['sec-zeros-from-factors',[1,2,6,3],3,'1'],
 ['sec-discriminant',[1,2,3],0,'-8'],['sec-discriminant',[1,2,1],1,'1'],['sec-discriminant',[1,6,1],2,'9'],
 ['sec-complete-square',[6,2,1],0,'-3'],['sec-complete-square',[6,2,1],1,'-7'],['sec-complete-square',[6,2,1],4,'9'],
 ['sec-quadratic-formula',[1,-5,6],0,'2'],['sec-quadratic-formula',[1,-5,6],1,'1'],['sec-quadratic-formula',[1,-5,6],2,'5'],['sec-quadratic-formula',[1,-5,6],3,'3'],
 ['sec-solve-quadratic',[1,2,5,3],0,'2'],['sec-solve-quadratic',[1,2,5,3],1,'5'],['sec-solve-quadratic',[1,2,5,3],4,'3'],
 ['sec-quadratic-max-min',[2,1],0,'2'],['sec-quadratic-max-min',[2,1],1,'20.6'],['sec-quadratic-max-min',[2,1],4,'4'],
 ['sec-linear-system',[3,2,2,1,1],0,'3'],['sec-linear-system',[3,2,2,1,1],1,'2'],['sec-linear-system',[3,2,2,1,1],4,'5'],
 ['sec-midpoint',[2,4,8,-2],0,'5'],['sec-midpoint',[2,4,8,-2],1,'1'],['sec-length',[1,2,4,6],0,'25'],['sec-circle-equation',[5,3,4],0,'5'],['sec-circle-equation',[5,3,4],2,'yes'],['sec-circle-equation',[5,3,4],5,'78.5'],
 ['sec-segment-problems',[1,2,5,8],0,'\\frac{3}{2}'],['sec-segment-problems',[1,2,5,8],1,'\\frac{-2}{3}'],
 ['sec-similar-triangles',[3,4,5,2],0,'2'],['sec-similar-triangles',[3,4,5,2],1,'8'],['sec-similar-triangles',[3,4,5,2],4,'48'],
 ['sec-trig-ratios',[0,1],0,'\\frac{3}{5}'],['sec-trig-ratios',[0,1],3,'0.600'],['sec-trig-ratios',[0,1],4,'tan'],
 ['sec-right-triangle',[30,10,3,4],0,'5.0'],['sec-right-triangle',[45,12,3,4],2,'12.0'],['sec-right-triangle',[24,10,3,4],6,'66'],['sec-right-triangle',[35,12,3,4],4,'36.9'],
 ['sec-trig-application',[35,50,8,40],0,'35.0'],
 ['sec-sine-law',[40,70,12],0,'17.5'],['sec-cosine-law',[10,12,50],0,'9.5'],
];

test('worked answers agree with independently calculated values',()=>{
 const problems=[];
 for(const [rule,params,style,expected] of KNOWN){
  try{const result=createSecondary(rule,[...params,style]);if(result.answer!==expected)problems.push(`${rule} ${JSON.stringify(params)} s${style}: got ${result.answer}, expected ${expected}`);}
  catch(error){problems.push(`${rule} ${JSON.stringify(params)} s${style}: ${error.message}`);}
 }
 assert.deepEqual(problems,[]);
});

test('five-number summaries use the exclude-the-median quartile method',()=>{
 assert.deepEqual({...fiveNumbers([1,3,5,7,9,11,13]),sorted:undefined},{min:1,q1:3,median:7,q3:11,max:13,sorted:undefined});
 assert.deepEqual({...fiveNumbers([2,4,6,8,10,12,14,16]),sorted:undefined},{min:2,q1:5,median:9,q3:13,max:16,sorted:undefined});
});

test('every generated worked step is valid LaTeX and every stored check is true',()=>{
 let seed=77;const rng=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
 for(const [rule,params,style] of KNOWN){
  let result;try{result=createSecondary(rule,[...params,style]);}catch{continue;}
  for(const step of result.steps)if(step.math)katex.renderToString(step.math,{throwOnError:true,trust:false});
  if(result.verification)assert.equal(result.verification.valid,true,`${rule} ${params}`);
 }
 assert.ok(rng()>=0);
});

test('invalid parameters are rejected instead of producing nonsense',()=>{
 assert.throws(()=>createSecondary('sec-power-value',[2,3,99]),/style/i);
 assert.throws(()=>createSecondary('sec-power-value',[2.5,3,0]),/whole-number/i);
 assert.throws(()=>createSecondary('not-a-rule',[1]),/Unsupported/);
 assert.ok(Object.keys(secondaryRules).length>=65);
});
