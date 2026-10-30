// Integer-only long division. Each event contains an immutable board snapshot.
import {divisionFacts} from './core/relationships.js';
import {add,multiply,integerResult} from './core/exact.js';
export function longDivision(dividend, divisor) {
 if(!/^\d{1,6}$/.test(String(dividend))||!/^\d{1,4}$/.test(String(divisor)))throw Error('Use a whole number up to 999999 and a divisor up to 9999.');
 const n=BigInt(dividend),d=BigInt(divisor);
 if(d===0n)throw Error('Division by zero is undefined.');
 const digits=String(n),quotient=Array(digits.length).fill(''),rows=[],steps=[];
 let remainder=0n,started=false;
 const emit=(phase,text)=>steps.push({phase,text,quotient:[...quotient],rows:rows.map(r=>({...r}))});
 emit('start',`Divide ${n} by ${d}. Work from left to right.`);
 for(let i=0;i<digits.length;i++){
  const partial=integerResult(add(multiply(remainder,10n),BigInt(digits[i])));
  if(!started&&partial<d&&i<digits.length-1){remainder=partial;continue;}
  if(started){
   rows[rows.length-1]={...rows[rows.length-1],value:String(partial),end:i};
   emit('bring-down',`Bring down ${digits[i]}. Now we have ${partial}.`);
  }
  started=true;
  const {quotient:q,product,remainder:nextRemainder}=divisionFacts(partial,d);
  quotient[i]=String(q);
  emit('divide',`${d} fits into ${partial} ${q} ${q===1n?'time':'times'}. Write ${q} above.`);
  rows.push({kind:'product',value:String(product),end:i});
  emit('multiply',`Multiply: ${q} × ${d} = ${product}.`);
  remainder=nextRemainder;
  rows.push({kind:'remainder',value:String(remainder),end:i,ruleStart:i-String(product).length+1,ruleEnd:i});
  emit('subtract',`Subtract: ${partial} − ${product} = ${remainder}.`);
 }
 const answer=quotient.join('');
 emit('complete',remainder===0n?`${n} ÷ ${d} = ${answer}. Nothing is left over!`:`${n} ÷ ${d} = ${answer}, with ${remainder} left over.`);
 return {dividend:String(n),divisor:String(d),answer,remainder:String(remainder),steps};
}
