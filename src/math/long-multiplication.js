// Nonnegative integers only; all arithmetic is exact and every board is a snapshot.
import {integerResult,multiply} from './core/exact.js';
import {productDigitFacts,digitFacts} from './core/relationships.js';
export function longMultiplication(left,right){
 if(!/^\d{1,4}$/.test(String(left))||!/^\d{1,4}$/.test(String(right)))throw Error('Use two whole numbers from 0 to 9999.');
 const a=String(BigInt(left)),b=String(BigInt(right)),answer=String(integerResult(multiply(a,b)));
 const width=Math.max(answer.length,a.length,b.length),partials=[],steps=[],carries=Array(width).fill(''),sumCarries=Array(width).fill(''),total=Array(width).fill('');
 const emit=(phase,text,activeRow=-1)=>steps.push({phase,text,activeRow,carries:[...carries],sumCarries:[...sumCarries],partials:partials.map(r=>[...r]),total:[...total]});
 emit('start',`Multiply ${a} by ${b}. Start with the ones digit on the bottom.`);
 for(let shift=0;shift<b.length;shift++){
  carries.fill('');const digit=BigInt(b[b.length-1-shift]),row=Array(width).fill('');partials.push(row);
  for(let k=0;k<shift;k++)row[width-1-k]='0';
  if(shift)emit('shift',`Move ${shift} ${shift===1?'place':'places'} left. The ${digit} represents ${digit*10n**BigInt(shift)}.`,shift);
  if(digit===0n){row[width-1-shift]='0';emit('multiply',`0 × ${a} = 0. Write 0 in this place.`,shift);continue;}
  let carry=0n;
  for(let j=0;j<a.length;j++){
   const top=BigInt(a[a.length-1-j]),oldCarry=carry,facts=productDigitFacts(top,digit,carry),value=facts.total,column=width-1-shift-j;
   row[column]=String(facts.digit);carry=facts.carry;
   if(column>0)carries[column-1]=carry?String(carry):'';
   const calculation=`${digit} × ${top}${oldCarry?` + ${oldCarry} carried`:''} = ${value}.`;
   if(j===a.length-1&&carry){row[column-1]=String(carry);emit('multiply',`${calculation} Write ${value} to finish this row.`,shift);}
   else emit('multiply',`${calculation} Write ${facts.digit}${carry?` and carry ${carry}`:''}.`,shift);
  }
  const shifted=integerResult(multiply(digit,10n**BigInt(shift))),partialProduct=integerResult(multiply(a,shifted));
  carries.fill('');emit('partial',`${a} × ${shifted} = ${partialProduct}.`,shift);
 }
 carries.fill('');
 if(partials.length>1){
  emit('add','Add the partial products, starting in the ones column.');
  let carry=0n;
  for(let column=width-1;column>=0;column--){
   const values=partials.map(row=>BigInt(row[column]||'0')),oldCarry=carry,facts=digitFacts(values,carry),value=facts.total;
   total[column]=String(facts.digit);carry=facts.carry;
   if(column>0)sumCarries[column-1]=carry?String(carry):'';
   emit('sum',`${values.join(' + ')}${oldCarry?` + ${oldCarry} carried`:''} = ${value}. Write ${facts.digit}${carry?` and carry ${carry}`:''}.`);
  }
 }else [...answer].forEach((digit,i)=>{total[width-answer.length+i]=digit;});
 sumCarries.fill('');emit('complete',`${a} × ${b} = ${answer}.`);
 return {left:a,right:b,answer,width,steps};
}
