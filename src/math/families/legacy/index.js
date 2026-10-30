import {solve} from '../../engines/arithmetic.js';
import {convertMixed,convertFraction} from '../../engines/fractions.js';
import {longDivision} from '../../engines/long-division.js';
import {longMultiplication} from '../../engines/long-multiplication.js';
import {scaledDecimal} from '../../core/format.js';
import {pick as sampleInteger} from '../../lesson.js';

// The first demo-era question families (Grade 5 arithmetic, long division and multiplication, one- and two-step equations).
// (Like-denominator fraction addition now lives in grade5.) They run the general arithmetic/equation solver, so each one only names the expression to solve.
const RULES=new Set(['mixed','fraction','order','times','divide','add','subtract','long-multiply','long-divide','equation-add','equation-times','equation-two']);

function generate(rule,rng){
 const pick=(a,b)=>sampleInteger(rng,a,b),d=pick(2,12),w=pick(1,5),n=pick(1,d-1);
 switch(rule){
  case 'mixed':return [w,n,d];
  case 'fraction':return [w*d+n,d];
  case 'order':return [pick(1,20),pick(2,12),pick(2,12)];
  case 'times':return [pick(0,12),pick(0,12)];
  case 'divide':{const a=pick(0,12),b=pick(1,12);return [a*b,b];}
  case 'add':case 'subtract':{const a=pick(1000,5000),b=pick(1,999);return [a,b];}
  case 'long-multiply':return [pick(10,99),pick(10,99)];
  case 'long-divide':return [pick(100,999),pick(10,99)];
  case 'equation-add':{const b=pick(1,50);return [b,b+pick(1,50)];}
  case 'equation-times':{const a=pick(2,10);return [a,a*pick(1,10)];}
  case 'equation-two':{const a=pick(2,8),b=pick(1,20);return [a,b,a*pick(1,10)+b];}
  default:throw new Error(`Unsupported practice rule: ${rule}`);
 }
}

function create(rule,[a,b,c]){
 if(rule==='mixed'||rule==='fraction'){
  const result=rule==='mixed'?convertMixed(a,b,c):convertFraction(a,b);
  return {kind:'expression',steps:result.steps,formula:result.steps[0].math};
 }
 if(rule==='long-multiply'||rule==='long-divide'){
  const lesson=rule==='long-multiply'?longMultiplication(a,b):longDivision(a,b);
  return {kind:rule,lesson,steps:lesson.steps,formula:`${a}${rule==='long-multiply'?'\\times':'\\div'}${b}`};
 }
 const money=scaledDecimal;
 const input={order:`${a}+${b}*${c}`,times:`${a}*${b}`,divide:`${a}/${b}`,add:`${money(a)}+${money(b)}`,subtract:`${money(a)}-${money(b)}`,'equation-add':`x+${a}=${b}`,'equation-times':`${a}x=${b}`,'equation-two':`${a}x+${b}=${c}`}[rule];
 if(!input)throw new Error(`Unsupported practice rule: ${rule}`);
 const result=solve(input),steps=result.methods[0].steps;
 if(result.kind==='equation'&&result.solutionType==='unique'){
  const x=result.result.denominator==='1'?result.result.numerator:`\\frac{${result.result.numerator}}{${result.result.denominator}}`;
  const check=rule==='equation-add'?`${x}+${a}=${b}`:rule==='equation-times'?`${a}\\times ${x}=${b}`:`${a}\\times ${x}+${b}=${c}`;
  steps.push({math:check,text:'Substitute the answer into the original equation. Both sides are equal, so the solution checks.'});
 }
 return {kind:result.kind==='equation'?'equation':'expression',formula:steps[0].math,steps};
}

export const legacyFamily={name:'legacy',has:rule=>RULES.has(rule),create,generate};
