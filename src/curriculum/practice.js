import {verificationFor,answerNumber} from '../math/verification.js';
import {createLesson,defaultValues} from '../math/families/index.js';
import {tidyDeep} from '../math/core/tidy.js';
import {meaningfulVerification} from '../math/check-policy.js';
import {compare} from '../math/core/exact.js';

export const generateValues=defaultValues;
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
 return createLesson(template.rule,exampleValues(template,values),template);
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
