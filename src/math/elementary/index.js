import {numberRules} from './number.js';
import {algebraRules} from './algebra.js';
import {dataRules} from './data.js';
import {spatialRules} from './spatial.js';
import {financialRules} from './financial.js';
import {lesson,step,requireThat} from './common.js';
export const elementaryRules={...numberRules,...algebraRules,...dataRules,...spatialRules,...financialRules};
export function createElementary(rule,values,template){
 requireThat(values.every(n=>Number.isSafeInteger(n)&&Math.abs(n)<=1000000000),'Use bounded whole-number activity parameters.');
 if(rule==='guided-discussion'){
  requireThat(template.discussion?.length>=2,'A guided activity needs explicit teaching prompts.');
  const index=values[0];requireThat(index>=0&&index<template.discussion.length,'Choose a supported discussion variant.');const item=template.discussion[index];
  return lesson(item.prompt,item.steps.map(text=>step(text)),{reflection:true});
 }
 requireThat(Object.hasOwn(elementaryRules,rule),'Unsupported elementary question family.');
 return elementaryRules[rule](values);
}
