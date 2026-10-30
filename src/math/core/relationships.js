import {value,rational,add,subtract,multiply,divide,sum,compare,integerResult,quotientRemainder,parseDecimal} from './exact.js';

// These facts are independent of the lesson, curriculum, renderer, and number of steps shown.
export const scale=(amount,numerator,denominator=1)=>multiply(amount,rational(numerator,denominator));
export const balance=(income,expenses)=>subtract(income,sum(expenses));
export function additiveFacts(left,right,takeAway=false){
 const result=takeAway?subtract(left,right):add(left,right);
 return {result,check:takeAway?add(result,right):subtract(result,right)};
}
export function linearSolution(coefficient,constant,rightSide){
 const a=value(coefficient),b=value(constant),c=value(rightSide),target=subtract(c,b);
 if(a.n===0n)return {type:compare(b,c)===0?'all':'none',target,result:null};
 return {type:'unique',target,result:divide(target,a)};
}
export const substituteLinear=(coefficient,constant,x)=>add(multiply(coefficient,x),constant);
export function divisionFacts(dividend,divisor){return quotientRemainder(dividend,divisor);}
export function groupsNeeded(count,capacity){const {quotient,remainder}=divisionFacts(count,capacity);return quotient+(remainder?1n:0n);}
export function linearSequence(start,increment,count){
 if(!Number.isSafeInteger(count)||count<0||count>1000)throw Error('Use a sequence length from 0 to 1000.');
 return Array.from({length:count},(_,index)=>add(start,multiply(index,increment)));
}
export function digitFacts(digits,carry=0){
 const total=integerResult(sum([...digits,carry])),{quotient,remainder}=quotientRemainder(total,10n);
 return {total,carry:quotient,digit:remainder};
}
export const productDigitFacts=(top,bottom,carry=0)=>digitFacts([multiply(top,bottom)],carry);
export function summarizeData(values){
 if(!Array.isArray(values)||!values.length)throw Error('Use at least one data value.');
 const sorted=values.map(value).sort(compare),total=sum(sorted),middle=Math.floor(sorted.length/2),even=sorted.length%2===0;
 const median=even?divide(add(sorted[middle-1],sorted[middle]),2):sorted[middle];
 const groups=[];for(const current of sorted){const previous=groups.at(-1);if(previous&&compare(previous.value,current)===0)previous.count++;else groups.push({value:current,count:1});}
 const modeFrequency=Math.max(...groups.map(group=>group.count)),modes=modeFrequency===1?[]:groups.filter(group=>group.count===modeFrequency).map(group=>group.value);
 return {sorted,total,mean:divide(total,sorted.length),median,modes,modeFrequency};
}
export function fitLine(points){
 if(!Array.isArray(points)||points.length<2)throw Error('Use at least two paired measurements.');
 const exact=n=>typeof n==='number'?parseDecimal(String(n)):value(n),xs=points.map(p=>exact(p[0])),ys=points.map(p=>exact(p[1])),n=points.length,
  sx=sum(xs),sy=sum(ys),sxy=sum(xs.map((x,i)=>multiply(x,ys[i]))),sxx=sum(xs.map(x=>multiply(x,x))),syy=sum(ys.map(y=>multiply(y,y))),
  covariance=subtract(multiply(n,sxy),multiply(sx,sy)),vx=subtract(multiply(n,sxx),multiply(sx,sx)),vy=subtract(multiply(n,syy),multiply(sy,sy));
 if(vx.n===0n)throw Error('A line y = mx + b needs different x values.');
 const gradient=divide(covariance,vx),intercept=subtract(divide(sy,n),multiply(gradient,divide(sx,n))),rSquared=vy.n===0n?rational(0):divide(multiply(covariance,covariance),multiply(vx,vy));
 return {gradient,intercept,rSquared,direction:compare(covariance,0)};
}
