import {solve} from '../math/arithmetic.js';
import {convertMixed,convertFraction} from '../math/fractions.js';
import {longDivision} from '../math/long-division.js';
import {longMultiplication} from '../math/long-multiplication.js';
import {grade5Rules,createGrade5} from '../math/grade5/index.js';
import {grade8Rules,createGrade8} from '../math/grade8/index.js';
import {scaledDecimal} from '../math/core/format.js';
import {pick as sampleInteger} from '../math/grade5/common.js';
import {verificationFor} from '../math/verification.js';
import {tidyDeep} from '../math/core/tidy.js';
import {meaningfulVerification} from '../math/check-policy.js';
import {elementaryRules,createElementary} from '../math/elementary/index.js';
import {answerNumber} from '../math/verification.js';
import {compare} from '../math/core/exact.js';
import {primaryRules,createPrimary} from '../math/primary/index.js';
import {secondaryRules,createSecondary} from '../math/secondary/index.js';

export function generateValues(rule,rng=Math.random){
 if(grade8Rules[rule])return grade8Rules[rule].generate(rng);
 if(grade5Rules[rule])return grade5Rules[rule].generate(rng);
 const pick=(a,b)=>sampleInteger(rng,a,b),d=pick(2,12),w=pick(1,5),n=pick(1,d-1);
 switch(rule){
  case 'mixed':return [w,n,d];
  case 'fraction':return [w*d+n,d];
  case 'order':return [pick(1,20),pick(2,12),pick(2,12)];
  case 'times':return [pick(0,12),pick(0,12)];
  case 'divide':{const a=pick(0,12),b=pick(1,12);return [a*b,b];}
  case 'add':case 'subtract':{const a=pick(1000,5000),b=pick(1,999);return [a,b];}
  case 'fraction-add':return [pick(1,d-1),pick(1,d-1),d];
  case 'long-multiply':return [pick(10,99),pick(10,99)];
  case 'long-divide':return [pick(100,999),pick(10,99)];
  case 'equation-add':{const b=pick(1,50);return [b,b+pick(1,50)];}
  case 'equation-times':{const a=pick(2,10);return [a,a*pick(1,10)];}
  case 'equation-two':{const a=pick(2,8),b=pick(1,20);return [a,b,a*pick(1,10)+b];}
  default:throw new Error(`Unsupported practice rule: ${rule}`);
 }
}
export function nextValues(template,previous,rng=Math.random){
 previous=exampleValues(template,previous);
 for(let attempt=0;attempt<100;attempt++){
  const values=generateQuestionValues(template,rng);
  if(JSON.stringify(values)!==JSON.stringify(previous))return values;
 }
 throw new Error('Could not generate a different question. Please try again.');
}
// Grade-specific domains live with the reusable question template, not the solver.
export function generateQuestionValues(template,rng=Math.random){
 if(!template.generation)return generateValues(template.rule,rng);
 for(let attempt=0;attempt<1000;attempt++){
  const values=template.generation.map(domain=>Array.isArray(domain)?domain[Math.floor(rng()*domain.length)]:domain.min+Math.floor(rng()*(Math.floor((domain.max-domain.min)/(domain.step||1))+1))*(domain.step||1));
  try{createPractice(template,values);return values;}catch(error){if(!(error instanceof Error))throw error;}
 }
 throw Error('Could not generate a valid question in this grade’s practice domain.');
}
export function exampleValues(template,values=template.example){
 if(Array.isArray(values))return [...values];
 if(!values||typeof values!=='object'||!template.parameters||Object.keys(values).length!==template.parameters.length||!template.parameters.every(name=>Object.hasOwn(values,name)))throw Error('Use the named parameters for this question type.');
 return template.parameters.map(name=>values[name]);
}
function createPracticeBase(template,values=template.example){
 values=exampleValues(template,values);
 const [a,b,c]=values,rule=template.rule;
 if(primaryRules[rule])return createPrimary(rule,values);
 if(secondaryRules[rule])return createSecondary(rule,values);
 if(elementaryRules[rule]||rule==='guided-discussion')return createElementary(rule,values,template);
 if(grade8Rules[rule])return createGrade8(rule,values);
 if(grade5Rules[rule])return createGrade5(rule,values);
 if(rule==='mixed'||rule==='fraction'){
  const result=rule==='mixed'?convertMixed(a,b,c):convertFraction(a,b);
  return {kind:'expression',steps:result.steps,formula:result.steps[0].math};
 }
 if(rule==='long-multiply'||rule==='long-divide'){
  const lesson=rule==='long-multiply'?longMultiplication(a,b):longDivision(a,b);
  return {kind:rule,lesson,steps:lesson.steps,formula:`${a}${rule==='long-multiply'?'\\times':'\\div'}${b}`};
 }
 const money=scaledDecimal;
 const input={order:`${a}+${b}*${c}`,times:`${a}*${b}`,divide:`${a}/${b}`,add:`${money(a)}+${money(b)}`,subtract:`${money(a)}-${money(b)}`,'fraction-add':`${a}/${c}+${b}/${c}`,'equation-add':`x+${a}=${b}`,'equation-times':`${a}x=${b}`,'equation-two':`${a}x+${b}=${c}`}[rule];
 if(!input)throw new Error(`Unsupported practice rule: ${rule}`);
 const result=solve(input),steps=result.methods[0].steps;
 if(result.kind==='equation'&&result.solutionType==='unique'){
  const x=result.result.denominator==='1'?result.result.numerator:`\\frac{${result.result.numerator}}{${result.result.denominator}}`;
  const check=rule==='equation-add'?`${x}+${a}=${b}`:rule==='equation-times'?`${a}\\times ${x}=${b}`:`${a}\\times ${x}+${b}=${c}`;
  steps.push({math:check,text:'Substitute the answer into the original equation. Both sides are equal, so the solution checks.'});
 }
 return {kind:result.kind==='equation'?'equation':'expression',formula:steps[0].math,steps};
}
function numericText(text){try{answerNumber(text);return true;}catch{return false;}}
export function createPractice(template,values=template.example){
 const resolved=exampleValues(template,values);
 if(template.generation&&(resolved.length!==template.generation.length||resolved.some((value,i)=>{const domain=template.generation[i];return Array.isArray(domain)?!domain.includes(value):value<domain.min||value>domain.max||(value-domain.min)%(domain.step||1)!==0;})))throw Error('Values are outside this grade’s practice domain.');
 const base=createPracticeBase(template,resolved),{verification:ownCheck,...lesson}=base,verification=meaningfulVerification(template.rule,verificationFor(template.rule,resolved,base)||ownCheck);
 if(template.answerMinimum!==undefined&&numericText(lesson.answer)&&compare(answerNumber(lesson.answer),template.answerMinimum)<0)throw Error('The answer is below this grade’s practice domain.');
 if(template.answerMaximum!==undefined&&numericText(lesson.answer)&&compare(answerNumber(lesson.answer),template.answerMaximum)>0)throw Error('The answer is above this grade’s practice domain.');
 // Any single exact numeric answer can be tried by the learner, even when the rule did not declare an answer box.
 const response=lesson.response||(!lesson.reflection&&typeof lesson.answer==='string'&&numericText(lesson.answer)?{kind:'number',answer:lesson.answer}:undefined);
 return tidyDeep({...(verification?{...lesson,verification}:lesson),...(response?{response}:{})});
}
