import {rational,add,subtract,multiply,divide,compare,power,integerSquareRoot,safeInteger,commonParts,calculate} from '../core/exact.js';
import {tex,scaledDecimal,fixed,rawFraction,decimalOrFraction} from '../core/format.js';
import {scale,divisionFacts} from '../core/relationships.js';
import {mixed} from '../core/format.js';
import {pick,step,lesson,table,numeric} from '../lesson.js';
const number=n=>n<0?`(${n})`:String(n);
export function rootForm(n){
 const root=integerSquareRoot(n);if(root*root===BigInt(n))return String(root);
 let coefficient=1,radicand=n;for(let factor=2;factor*factor<=radicand;factor++)while(radicand%(factor*factor)===0){coefficient*=factor;radicand/=factor*factor;}
 return `${coefficient===1?'':coefficient}\\sqrt{${radicand}}`;
}
function rationalArithmetic([a,b,c,d,operation]){
 const left=rational(a,b),right=rational(c,d),op=['+','-','*','/'][operation],result=calculate(op,left,right),symbol=['+','-','\\times','\\div'][operation],steps=[];
 const mixedDisplay=n=>{const magnitude=n.n<0n?-n.n:n.n;if(magnitude<=n.d||n.d===1n)return tex(n);const {quotient,remainder}=divisionFacts(magnitude,n.d);const display=mixed(quotient,remainder,n.d);return n.n<0n?`\\left(-${display}\\right)`:display;};
 const displayLeft=mixedDisplay(left),displayRight=mixedDisplay(right);
 if(displayLeft!==tex(left)||displayRight!==tex(right))steps.push(step('Convert each mixed number to an improper fraction before calculating.',`${tex(left)}${symbol}\\left(${tex(right)}\\right)`));
 if(operation<2){const {denominator,numerators:[l,r]}=commonParts([left,right]);steps.push(step('Make equal-sized parts before adding or subtracting.',`\\frac{${l}}{${denominator}}${symbol}\\frac{${r}}{${denominator}}`));}
 else if(operation===3)steps.push(step('Dividing by a nonzero fraction is multiplying by its reciprocal.',`${tex(left)}\\times\\frac{${right.d}}{${right.n}}`));
 else steps.push(step('Multiply the numerators and multiply the denominators.',`\\frac{${left.n}\\times${number(Number(right.n))}}{${left.d}\\times${right.d}}`));
 steps.push(step('Simplify the result using common factors.',tex(result)));
 return lesson('Calculate using exact fractions. A whole number is a fraction with denominator 1.',steps,{formula:`${displayLeft}${symbol}${right.n<0n?`\\left(${displayRight}\\right)`:displayRight}`,answer:tex(result)});
}
const fractionGenerator=(rng,multiplyDivide)=>{const p=(a,b)=>pick(rng,a,b);let n=0;while(!n)n=p(-12,12);return [p(-18,18),p(1,12),n,p(1,12),p(multiplyDivide?2:0,multiplyDivide?3:1)];};
export const numberRules8={
 'g8-scientific':{
  generate:r=>[pick(r,100,999),pick(r,-6,8)],
  solve:([mantissa,exponent])=>{const coefficient=rational(mantissa,100),result=multiply(coefficient,power(10,exponent));return lesson('Write this scientific notation as an ordinary number. Compare how powers of ten change its size.',[
   step(`Move the decimal point ${Math.abs(exponent)} ${Math.abs(exponent)===1?'place':'places'} ${exponent<0?'left':'right'}. Fill empty places with zeros.`,`${scaledDecimal(mantissa)}\\;\\xrightarrow{\\text{${Math.abs(exponent)} places ${exponent<0?'left':'right'}}}\\;${fixed(result,Math.max(0,2-exponent))}`),
   step('Move the decimal point by the power of ten, keeping the value exact.',fixed(result,Math.max(0,2-exponent))),
   step('Scientific notation helps describe distances in space and measurements much smaller than a metre.')
  ],{formula:`${scaledDecimal(mantissa)}\\times10^{${exponent}}`,answer:tex(result)});}
 },
 'g8-real-order':{
  generate:r=>{const n=pick(r,2,50);return [n,pick(r,-8,10),pick(r,1,4)];},
  solve:([n,a,d])=>{const root=integerSquareRoot(n),square=root*root===BigInt(n),comparison=a<0?-1:compare(rational(a*a,d*d),n),sign=comparison<0?'<':comparison>0?'>':'=';return lesson(`Compare ${a}/${d} with the positive square root of ${n}, and classify the numbers.`,[
   step('An integer fraction is rational. A square root of a non-square whole number is irrational.',undefined,table(['Number','Classification'],[[`${a}/${d}`,'Rational'],[`√${n}`,square?'Rational':'Irrational']],'Real-number classification')),
   step(`The square root is ${square?'exactly '+root:'between '+root+' and '+(root+1n)}.`,`${root}^2\\le${n}<${root+1n}^2`),
   step(a<0?'A negative number is less than a positive square root.':'For nonnegative values, compare their squares; squaring preserves their order.',`${tex(rational(a,d))}${sign}\\sqrt{${n}}`)
  ],{answer:sign,response:{kind:'choice',options:['<','=','>'],answer:sign}});}
 },
 'g8-roots':{
  generate:r=>[pick(r,0,144)],
  solve:([n])=>{const root=integerSquareRoot(n);return lesson(`Find √${n}. Give an exact form and locate it between whole numbers.`,[
   step('Find neighbouring perfect squares.',`${root}^2\\le${n}<${root+1n}^2`),
   step(root*root===BigInt(n)?'This is a perfect square. Its principal square root is nonnegative.':'Keep an exact radical. If possible, take a square factor outside the root.',`\\sqrt{${n}}=${rootForm(n)}`)
  ],{answer:rootForm(n)});}
 },
 'g8-percent':{
  generate:r=>[pick(r,1,25000)],
  solve:([percentHundredths])=>{const fraction=rational(percentHundredths,10000);return lesson(`Write ${scaledDecimal(percentHundredths)}% as a fraction and decimal.`,[
   step('Divide a percentage by 100 to get its value as a number.',`\\frac{${scaledDecimal(percentHundredths)}}{100}=${tex(fraction)}`),
   step('Percentages may be greater than 100% or less than 1%.',`${fixed(fraction,4)}`)
  ],{answer:tex(fraction)});}
 },
 'g8-order-operations':{
  generate:r=>{let a=0;while(!a)a=pick(r,-8,8);return [a,pick(r,1,8),pick(r,2,5),pick(r,2,3)];},
  solve:([a,b,c,e])=>{const left=rational(a,2),right=rational(b,3),inside=add(left,right),raised=power(c,e),result=multiply(inside,raised);return lesson('Evaluate brackets and exponents before multiplication.',[
   step('Evaluate the bracket and the power.',`${tex(inside)}\\times${tex(raised)}`),step('Multiply the resulting values.',tex(result))
  ],{formula:`(${tex(left)}+${tex(right)})\\times${c}^{${e}}`,answer:tex(result)});}
 },
 'g8-squares':{
  generate:r=>[pick(r,0,12)],
  solve:([n])=>lesson(`Recall ${n}² and its principal square root.`,[step('A square number is the product of a whole number with itself.',`${n}^2=${n}\\times${n}=${n*n}`),step('Taking the principal square root reverses squaring a nonnegative value.',`\\sqrt{${n*n}}=${n}`)],{answer:n*n,response:numeric(n*n)})
 },
 'g8-powers-ten':{
  generate:r=>[pick(r,1,99000),pick(r,-3,3)],
  solve:([thousandths,e])=>{const result=multiply(rational(thousandths,1000),power(10,e));return lesson(`Calculate ${scaledDecimal(thousandths,3)} × 10^${e} mentally.`,[step(`Move the decimal point ${Math.abs(e)} places ${e<0?'left':'right'}, adding zeros where needed.`,`${scaledDecimal(thousandths,3)}\\;\\xrightarrow{\\text{${Math.abs(e)} places ${e<0?'left':'right'}}}\\;${fixed(result,Math.max(0,3-e))}`),step('The digits keep their order; only their place values change.',fixed(result,Math.max(0,3-e)))],{answer:tex(result)});}
 },
 'g8-integer-add-sub':{
  generate:r=>[pick(r,-30,30),pick(r,-30,30),pick(r,0,1)],
  solve:([a,b,op])=>integerLesson(a,b,op)
 },
 'g8-integer-multiply-divide':{
  generate:r=>{let b=0;while(!b)b=pick(r,-12,12);const a=pick(r,-12,12),op=pick(r,2,3);return [op===3?a*b:a,b,op];},
  solve:([a,b,op])=>integerLesson(a,b,op)
 },
 'g8-fraction-add-sub':{generate:r=>fractionGenerator(r,false),solve:rationalArithmetic},
 'g8-fraction-multiply-divide':{generate:r=>fractionGenerator(r,true),solve:rationalArithmetic},
 'g8-proportion':{
  generate:r=>[pick(r,2,8),pick(r,2,12),pick(r,2,8),pick(r,5,30)],
  solve:([items,cost,newItems,percent])=>{const unit=divide(cost,items),newCost=multiply(unit,newItems),increased=scale(newCost,100+percent,100);return lesson(`${items} items cost $${cost}. Find the cost of ${newItems} items at the same rate. Then the price goes up by ${percent}%. Find the new cost.`,[
   step('Find the cost per item.',`${cost}\\div${items}=${tex(unit)}`),step('Scale by the new count.',`${tex(unit)}\\times${newItems}=${tex(newCost)}`),step(`A ${percent}% increase means the new price is ${100+percent}% of the old price.`,`${tex(newCost)}\\times\\frac{${100+percent}}{100}=${decimalOrFraction(increased)}`)
  ],{answer:decimalOrFraction(increased)});}
 }
};
function integerLesson(a,b,operation){const op=['+','-','*','/'][operation],symbol=['+','-','\\times','\\div'][operation],result=calculate(op,a,b);return lesson('Calculate with signed integers.',[
 step(operation===1?'Subtracting a number means adding its opposite.':operation>=2?'For nonzero values, matching signs give a positive product or quotient; different signs give a negative one. A zero product or zero dividend gives zero.':'Combine signed amounts; opposite signs can cancel.',operation===1?`${number(a)}+${number(-b)}`:undefined),
 step('Calculate the result and keep its sign.',tex(result))
],{formula:`${number(a)}${symbol}${number(b)}`,answer:tex(result),response:result.d===1n?numeric(String(result.n)):undefined});}
