import {rational,add,subtract,multiply,divide,compare,safeInteger,calculate} from '../../core/exact.js';
import {linearSequence,linearSolution,substituteLinear} from '../../core/relationships.js';
import {tex,plain,scaledDecimal,decimalOrFraction} from '../../core/format.js';
import {pick,step,lesson,table,numeric} from '../../lesson.js';
import {linear,sumOfTerms,term} from '../../core/terms.js';
import {requireThat} from '../elementary/common.js';
const plainTerm=n=>Math.abs(n)>=2;
const plainCoefficient=r=>{const n=pick(r,2,9);return pick(r,0,1)?-n:n;};
const signed=v=>v<0?`(${v})`:String(v);
const affine=(a,b)=>linear(decimalOrFraction(rational(a,10)),decimalOrFraction(rational(b,10)));
export function rationalPattern(start,increment,denominator,count=5){return linearSequence(rational(start,denominator),rational(increment,denominator),count);}
export function analyzeReadings(readings,threshold){const selected=readings.filter(n=>compare(n,threshold)>0);return {selected,count:selected.length,total:readings.length};}
export const algebraRules8={
 'g8-monomials':{
  generate:r=>{let a,b,sub;do{a=plainCoefficient(r);b=plainCoefficient(r);sub=pick(r,0,1);}while(a+(sub?-b:b)===0);return [a,b,sub];},
  solve:([a,b,subtractTerms])=>{requireThat(plainTerm(a)&&plainTerm(b),'Use coefficients other than 0, 1 and -1.');const op=subtractTerms?'-':'+',coefficient=calculate(op,a,b);requireThat(compare(coefficient,0)!==0,'Use terms that do not cancel completely.');return lesson('Combine linear monomials by adding or subtracting their coefficients.',[step('Both terms have the same variable part, x.',`(${a}${op}${signed(b)})x`),step('Keep the variable and calculate its coefficient.',linear(safeInteger(coefficient),0))],{formula:sumOfTerms([[a,'x'],[subtractTerms?-b:b,'x']]),answer:tex(coefficient)});}
 },
 'g8-pattern-compare':{
  generate:r=>[pick(r,-8,8),pick(r,1,5),pick(r,-8,8),pick(r,-5,-1)],
  solve:([a,b,c,d])=>lesson(`Compare the patterns A: ${a} + ${b}n and B: ${c} + (${d})n, starting at n = 0.`,[
   step('The constant is the initial value. The coefficient of n is the constant rate.',undefined,table(['Pattern','Initial value','Change per step'],[['A',a,b],['B',c,d]],'Compare rates and initial values')),
   step('Use the same term numbers for a fair comparison.',undefined,table(['n','A','B'],[0,1,2,3].map(n=>[n,tex(substituteLinear(b,a,n)),tex(substituteLinear(d,c,n))]),'A grows while B shrinks'))
  ],{answer:{initial:[a,c],rates:[b,d]}})
 },
 'g8-rational-pattern':{
  generate:r=>[pick(r,-10,10),pick(r,1,6)*(pick(r,0,1)?-1:1),pick(r,2,5),pick(r,6,12)],
  solve:([a,d,denominator,index])=>{const values=rationalPattern(a,d,denominator),target=substituteLinear(rational(d,denominator),rational(a,denominator),index);return lesson(`A pattern starts at ${a}/${denominator} when n = 0 and changes by ${d}/${denominator} each step. Represent it and find term n = ${index}.`,[
   step('Write the initial value plus n copies of the change.',`T(n)=${tex(rational(a,denominator))}+(${tex(rational(d,denominator))})n`),
   step('A table shows the exact rational-number pattern.',undefined,table(['n','T(n)'],values.map((value,i)=>[i,plain(value)]),'Exact term values')),
   step('Plot term number horizontally and term value vertically.',undefined,{type:'points',points:values.map((v,i)=>[i,Number(v.n)/Number(v.d)]),caption:'Rational pattern as points',xLabel:'Term',yLabel:'Value'}),
   step('Substitute the requested index into the rule.',`T(${index})=${tex(rational(a,denominator))}+(${tex(rational(d,denominator))})\\times${index}=${tex(target)}`),
   step('To find an unknown index, subtract the initial value and divide by the nonzero change.',`n=\\frac{${tex(target)}-(${tex(rational(a,denominator))})}{${tex(rational(d,denominator))}}=${index}`)
  ],{answer:tex(target)});}
 },
 'g8-like-terms':{
  generate:r=>{let a,b,c,d;do{a=plainCoefficient(r);c=plainCoefficient(r);b=pick(r,-9,9);d=pick(r,-9,9);}while(!b||!d||a+c===0||b+d===0);return [a,b,c,d];},
  solve:([a,b,c,d])=>{requireThat([a,b,c,d].every(n=>n!==0)&&plainTerm(a)&&plainTerm(c),'Use nonzero terms and coefficients other than 1 and -1.');const coefficient=safeInteger(add(a,c)),constant=safeInteger(add(b,d));requireThat(coefficient!==0&&constant!==0,'Use a sum with both an x term and a constant.');return lesson('Add the two linear binomials. Combine only like terms.',[
   step('Group x terms together and constants together.',`(${a}+${signed(c)})x+(${b}+${signed(d)})`),
   step('The variable part stays x. Add its coefficients.',linear(coefficient,constant))
  ],{formula:`(${linear(a,b)})+(${linear(c,d)})`,answer:{coefficient,constant}});}
 },
 'g8-evaluate':{
  generate:r=>{let a=0,b=0;while(!a)a=pick(r,-8,8);while(!b)b=pick(r,-8,8);return [a,pick(r,2,5),b,pick(r,-9,9),pick(r,2,5)];},
  solve:([a,d,b,n,e])=>{const x=rational(n,e),result=substituteLinear(rational(a,d),b,x);return lesson(`Evaluate ${d===1?term(a,'x'):`(${a}/${d})x`}${b?` ${b<0?'−':'+'} ${Math.abs(b)}`:''} when x = ${n}/${e}.`,[
   step('Replace the variable with the given rational value.',`(${tex(rational(a,d))})(${tex(x)})${b?`+(${b})`:''}`),
   step('Multiply first, then add using exact fractions.',tex(result))
  ],{answer:tex(result)});}
 },
 'g8-equation':{
  generate:r=>{const a=pick(r,-30,30);let c=a;while(c===a)c=pick(r,-30,30);return [a,pick(r,-50,50),c,pick(r,-50,50)];},
  solve:([a,b,c,d])=>{const left=rational(a,10),right=rational(c,10),constantLeft=rational(b,10),constantRight=rational(d,10),coefficient=subtract(left,right),solution=linearSolution(coefficient,constantLeft,constantRight),display=decimalOrFraction,steps=[step('Subtract the right-hand x term and the left-hand constant on both sides.',`(${display(left)}-(${display(right)}))x=${display(constantRight)}-(${display(constantLeft)})`)];
   if(solution.type!=='unique')steps.push(step(solution.type==='all'?'Both sides agree for every real x.':'The constants disagree; there is no solution.',solution.type==='all'?'x\\in\\mathbb R':'\\text{No solution}'));
   else {steps.push(step('Simplify, then divide by the nonzero coefficient.',`${display(coefficient)}x=${display(solution.target)},\\quad x=${display(solution.result)}`));steps.push(step('Substitute into both original sides. The values match.',`${display(substituteLinear(left,constantLeft,solution.result))}=${display(substituteLinear(right,constantRight,solution.result))}`));}
   return lesson('Solve the equation, keeping both sides balanced.',steps,{formula:`${affine(a,b)}=${affine(c,d)}`,answer:solution.type==='unique'?tex(solution.result):solution.type});}
 },
 'g8-inequality':{
  generate:r=>{let a=0,b=0;while(!a)a=pick(r,-6,6);while(!b)b=pick(r,-12,12);return [a,b,pick(r,-12,12),pick(r,0,3)];},
  solve:([a,b,c,comparison])=>{requireThat(b!==0,'Use a nonzero constant so there is something to subtract.');const greater=comparison%2===1,closed=comparison>=2,boundary=divide(subtract(c,b),a),direction=greater!==(a<0),symbol=closed?(direction?'\\ge':'\\le'):(direction?'>':'<'),inputSymbol=closed?(greater?'\\ge':'\\le'):(greater?'>':'<'),check=direction?add(boundary,1):subtract(boundary,1);return lesson(`Solve and graph the ${closed?'inclusive':'strict'} inequality over the real numbers.`,[
   step(`Subtract ${b} on both sides.`,` ${a}x${inputSymbol}${c-b}`),
   step(a<0?'Divide by a negative number and reverse the inequality sign.':'Divide by a positive number; keep the inequality direction.',`x${symbol}${tex(boundary)}`,{type:'real-inequality',boundary:Number(boundary.n)/Number(boundary.d),label:tex(boundary),greater:direction,closed,caption:`${closed?'Filled boundary: the endpoint is included':'Open boundary: the endpoint is excluded'}; the ray continues in the arrow direction`}),
   step('Check an allowed value in the original inequality.',`${a}(${tex(check)})+(${b})=${tex(substituteLinear(a,b,check))}${inputSymbol}${c}`)
  ],{formula:`${linear(a,b)}${inputSymbol}${c}`,answer:`x${symbol}${tex(boundary)}`});}
 },
 'g8-code-data':{
  generate:r=>[pick(r,10,30),pick(r,10,30),pick(r,10,30),pick(r,10,30),pick(r,10,30)],
  solve:([a,b,c,d,threshold])=>{const facts=analyzeReadings([a,b,c,d],threshold);return lesson(`Write or modify a program to count readings greater than ${threshold}. Readings: ${a}, ${b}, ${c}, ${d}.`,[
   step('Set a count to zero, inspect each reading once, and increment only when the condition is true.',undefined,{type:'code',lines:['count ← 0',`FOR each value IN [${a}, ${b}, ${c}, ${d}]`,`  IF value > ${threshold}: count ← count + 1`,'DISPLAY count'],caption:'Bounded data-analysis program'}),
   step(`The count is ${facts.count}. Changing the threshold changes which values qualify.`,undefined,table(['Reading','Greater than threshold?'],[a,b,c,d].map(n=>[n,n>threshold?'Yes':'No']),'Trace the condition')),
   step('One pass examines each reading once. Repeatedly scanning the entire list for each item does unnecessary work.')
  ],{answer:facts.count,response:numeric(facts.count),builder:{kind:'data-analysis',readings:[a,b,c,d],threshold}});}
 },
 'g8-modelling':{
  generate:r=>[pick(r,20,80),pick(r,2,8),pick(r,10,40)],
  solve:([fixedCost,costPerItem,items])=>{const total=substituteLinear(costPerItem,fixedCost,items);return lesson(`Model fundraiser costs: $${fixedCost} setup plus $${costPerItem} per item. Predict costs for ${items} items and review your assumptions.`,[
   step('Define n as the number of items. Assume setup and per-item costs stay constant.',`C(n)=${fixedCost}+${costPerItem}n`),step('Use the model to make a prediction.',`C(${items})=${tex(total)}`),step('Compare the prediction with observed costs. Delivery charges, discounts, waste, or capacity limits could require a revised model.')
  ],{answer:tex(total),reflection:true});}
 }
};
