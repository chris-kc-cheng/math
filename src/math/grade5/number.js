import {pick,decimal,fraction,step,lesson,table,line,numeric} from './common.js';
import {rational,calculate,compare,lcm,safeInteger,multiply,roundHalfUp} from '../core/exact.js';
import {tex} from '../core/format.js';
import {additiveFacts,divisionFacts,scale} from '../core/relationships.js';
const fracBars=(n,d,caption)=>({type:'fraction-bars',n,d,caption});
const order=(values,format=String)=>table(['Position','Value'],[...values].sort((a,b)=>a-b).map((v,i)=>[i+1,format(v)]),'Smallest to largest');
function fractionAdditionLesson([a,b,d],subtract=false){
 const operator=subtract?'-':'+',result=tex(calculate(operator,rational(a,d),rational(b,d)));
 return lesson(`${subtract?'Subtract':'Add'} ${a}/${d} ${subtract?'−':'+'} ${b}/${d}.`,[
  step(subtract?'The parts already have the same size. Subtract only the counts of parts.':'The parts have the same size. Add only the counts of parts.',`\\frac{${a}}{${d}}${operator}\\frac{${b}}{${d}}=\\frac{${a}${operator}${b}}{${d}}`),
  step(subtract?'Simplify the result if possible.':'Keep the piece size, then simplify if possible.',result)
 ],{answer:result});
}
function decimalAdditionLesson([a,b],subtract=false){
 const facts=additiveFacts(a,b,subtract),result=safeInteger(facts.result),check=safeInteger(facts.check),operator=subtract?'-':'+';
 return lesson(`${subtract?'Subtract':'Add'} ${decimal(a)} ${subtract?'−':'+'} ${decimal(b)}.`,[
  step(subtract?'Line up matching place values. Regroup a tenth as ten hundredths when needed.':'Line up whole numbers, tenths, and hundredths. Use hundredths to keep the calculation exact.',undefined,table(['Amount','Whole part','Tenths','Hundredths'],[a,b].map(n=>[decimal(n),Math.floor(n/100),Math.floor(n/10)%10,n%10]),'Matching place values')),
  step(subtract?'Subtract the counts of hundredths.':'Add the counts of hundredths and regroup when needed.',`${decimal(a)}${operator}${decimal(b)}=${decimal(result)}`),
  step(subtract?'Check by adding the subtracted amount back.':'Check by subtracting one addend.',`${decimal(result)}${subtract?'+':'-'}${decimal(b)}=${decimal(check)}`)
 ],{answer:decimal(result),response:numeric(decimal(result))});
}
export function numberWords(n){
 const ones=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
 if(n<20)return ones[n];if(n<100)return tens[Math.floor(n/10)]+(n%10?`-${ones[n%10]}`:'');if(n<1000)return `${ones[Math.floor(n/100)]} hundred${n%100?' '+numberWords(n%100):''}`;return `${numberWords(Math.floor(n/1000))} thousand${n%1000?' '+numberWords(n%1000):''}`;
}

export const numberRules={
 'fraction-add':{
  generate:r=>{const d=pick(r,2,12);return [pick(r,0,d),pick(r,0,d),d];},
  solve:values=>fractionAdditionLesson(values)
 },
 'decimal-addition':{
  generate:r=>[pick(r,1000,5000),pick(r,1,999)],
  solve:values=>decimalAdditionLesson(values)
 },
 'decimal-subtraction':{
  generate:r=>[pick(r,1000,5000),pick(r,1,999)],
  solve:values=>decimalAdditionLesson(values,true)
 },
 'order-fractions':{
  generate:r=>{const b=pick(r,2,12),d=pick(r,2,12),f=pick(r,2,12);return [pick(r,1,2*b),b,pick(r,1,2*d),d,pick(r,1,2*f),f];},
  solve:([a,b,c,d,e,f])=>{const values=[[a,b],[c,d],[e,f]],l=values.reduce((m,[,n])=>safeInteger(lcm(m,n)),1),ordered=[...values].sort(([n,d],[p,q])=>compare(rational(n,d),rational(p,q)));return lesson(`Order ${a}/${b}, ${c}/${d}, and ${e}/${f} from smallest to largest.`,[
   step('Make the parts the same size.',undefined,table(['Fraction',`Parts out of ${l}`],values.map(([n,d])=>[`${n}/${d}`,n*l/d]),'Compare equal-sized parts')),
   step('Order by the counts of equal-sized parts.',ordered.map(([n,d])=>`\\frac{${n}}{${d}}`).join('\\le '),line(2,values.map(([n,d])=>({value:n/d,label:`${n}/${d}`})),'Ordered fractions'))
  ],{answer:ordered.map(([n,d])=>`${n}/${d}`).join(', ')});}
 },
 'percent-fraction':{
  generate:r=>[pick(r,0,100)],
  solve:([p])=>lesson(`Write ${p}% as a fraction in simplest form and as a decimal.`,[
   step('Percent means parts out of one hundred.',`${p}\\%=\\frac{${p}}{100}`,fracBars(p,100,'Parts out of one hundred')),
   step('Simplify the fraction and use hundredths to write the decimal.',`\\frac{${p}}{100}=${fraction(p,100)}=${decimal(p)}`)
  ],{answer:{fraction:fraction(p,100),decimal:decimal(p)}})
 },
 'place-value':{
  generate:r=>[pick(r,0,100000)],
  solve:([n])=>{const places=[100000,10000,1000,100,10,1],parts=places.map(p=>[p,Math.floor(n/p)%10]),terms=parts.filter(([,v])=>v).map(([p,v])=>v*p);
   return lesson(`Show ${n.toLocaleString('en-CA')} using place value.`,[
    step(`Read the number as “${numberWords(n)}”.`),
    step('Each digit counts groups of its place value.',undefined,table(['Place value','Digit','Amount'],parts.map(([p,v])=>[p,v,p*v]),'Place-value chart')),
    step('Add the amounts to compose the original number.',`${n}=${terms.length?terms.join('+'):'0'}`)
   ],{answer:n});}
 },
 'order-whole':{
  generate:r=>[pick(r,0,100000),pick(r,0,100000),pick(r,0,100000)],
  solve:v=>lesson(`Order ${v.join(', ')} from smallest to largest.`,[
   step('Compare from the highest place value. At the first different digit, the smaller digit means the smaller number.'),
   step('Equal numbers stay together.',[...v].sort((a,b)=>a-b).join('\\le '),order(v))
  ],{answer:[...v].sort((a,b)=>a-b).join(', ')})
 },
 'equivalent-fraction':{
  generate:r=>{const d=pick(r,2,6);return [pick(r,1,d*2-1),d,2];},
  solve:([n,d,k])=>lesson(`Make an equivalent fraction to ${n}/${d} with denominator ${d*k}.`,[
   step('Split every part into the same number of smaller parts. The amount stays the same.',undefined,fracBars(n,d,'Original amount')),
   step(`Multiply both the top and bottom by ${k}.`,`\\frac{${n}}{${d}}=\\frac{${n}\\times ${k}}{${d}\\times ${k}}`),
   step('The two fractions cover the same amount.',`\\frac{${n}}{${d}}=\\frac{${n*k}}{${d*k}}`,fracBars(n*k,d*k,'Same amount, smaller parts'))
  ],{answer:`${n*k}/${d*k}`})
 },
 'compare-fractions':{
  generate:r=>{const b=pick(r,2,12),d=pick(r,2,12);return [pick(r,1,b*2),b,pick(r,1,d*2),d];},
  solve:([a,b,c,d])=>{const l=safeInteger(lcm(b,d)),left=safeInteger(scale(a,l,b)),right=safeInteger(scale(c,l,d)),sign=['<','=','>'][compare(left,right)+1];
   return lesson(`Compare ${a}/${b} and ${c}/${d}.`,[
    step('Make equal-sized parts using a common denominator.',`\\frac{${a}}{${b}}=\\frac{${left}}{${l}},\\quad\\frac{${c}}{${d}}=\\frac{${right}}{${l}}`),
    step('Now compare how many of those parts there are.',`\\frac{${a}}{${b}}${sign}\\frac{${c}}{${d}}`,line(2,[{value:a/b,label:`${a}/${b}`},{value:c/d,label:`${c}/${d}`}],'Fractions on a number line'))
   ],{answer:sign,response:{kind:'choice',options:['<','=','>'],answer:sign}});}
 },
 'order-decimals':{
  generate:r=>[pick(r,0,10000),pick(r,0,10000),pick(r,0,10000)],
  solve:v=>lesson(`Order ${v.map(n=>decimal(n)).join(', ')} from smallest to largest.`,[
   step('Write every number in hundredths, then compare the whole-number counts of hundredths.',undefined,table(['Decimal','Hundredths'],v.map(n=>[decimal(n),n]),'Compare equal-sized units')),
   step('Arrange from fewest hundredths to most.',[...v].sort((a,b)=>a-b).map(n=>decimal(n)).join('\\le '),order(v,n=>decimal(n)))
  ],{answer:[...v].sort((a,b)=>a-b).map(n=>decimal(n)).join(', ')})
 },
 'round-tenth':{
  generate:r=>[pick(r,0,10000)],
  solve:([n])=>{const last=n%10,rounded=safeInteger(multiply(roundHalfUp(rational(n,100),1),10));return lesson(`Round ${decimal(n)} to the nearest tenth.`,[
   step(`The hundredths digit is ${last}. ${last>=5?'Five or more means round up.':'Less than five means keep the tenths digit.'}`),
   step('Use the nearest tenth.',`${decimal(n)}\\approx ${decimal(rounded,1)}`)
  ],{answer:decimal(rounded,1),response:numeric(decimal(rounded,1))});}
 },
 'fraction-percent':{
  generate:r=>{const ds=[2,4,5,10,20,25,50,100],d=ds[pick(r,0,ds.length-1)];return [pick(r,1,d),d];},
  solve:([n,d])=>{const percent=safeInteger(scale(n,100,d));return lesson(`Write ${n}/${d} as a decimal and percentage.`,[
   step('Find the equivalent number of hundredths.',`\\frac{${n}}{${d}}=\\frac{${percent}}{100}`),
   step('Percent means out of one hundred.',`\\frac{${n}}{${d}}=${decimal(percent)}=${percent}\\%`,fracBars(percent,100,'Shaded parts out of 100'))
  ],{answer:`${decimal(percent)}; ${percent}%`});}
 },
 'mental-scale':{
  generate:r=>[pick(r,1,9999),pick(r,1,2)],
  solve:([n,p])=>lesson(`Work out ${n} × ${p===1?'0.1':'0.01'} mentally.`,[
   step(`Each place becomes ${p===1?'one tenth':'one hundredth'} as large.`,` ${n}\\times ${p===1?'0.1':'0.01'}=\\frac{${n}}{${10**p}}`),
   step('Use place value to write the decimal.',`${decimal(n,p)}`)
  ],{answer:decimal(n,p),response:numeric(decimal(n,p))})
 },
 'estimate-decimals':{
  generate:r=>[pick(r,100,5000),pick(r,100,5000),pick(r,0,1)],
  solve:([a,b,subtract])=>{const x=safeInteger(roundHalfUp(rational(a,100))),y=safeInteger(roundHalfUp(rational(b,100))),op=subtract?'-':'+';return lesson(`Estimate ${decimal(a)} ${op} ${decimal(b)} by rounding to whole numbers.`,[
   step('Round each amount to the nearest whole.',`${decimal(a)}\\approx ${x},\\quad${decimal(b)}\\approx${y}`),
   step('Calculate with the rounded amounts. This is an estimate, not an exact answer.',`${x}${op}${y}=${subtract?x-y:x+y}`)
  ],{answer:subtract?x-y:x+y,response:numeric(subtract?x-y:x+y)});}
 },
 'whole-add-subtract':{
  generate:r=>[pick(r,100,49000),pick(r,1,49000),pick(r,0,1)],
  solve:([a,b,subtract])=>{if(subtract&&b>a)[a,b]=[b,a];const result=safeInteger(additiveFacts(a,b,subtract).result),op=subtract?'-':'+';return lesson(`Calculate ${a} ${op} ${b}, then check.`,[
   step('Group tens, hundreds, and thousands to calculate.',`${a}${op}${b}=${result}`),
   step('Use the inverse operation to check.',subtract?`${result}+${b}=${a}`:`${result}-${b}=${a}`)
  ],{answer:result,response:numeric(result)});}
 },
 'fraction-subtract':{
  generate:r=>{const d=pick(r,2,12),a=pick(r,1,d*2);return [a,pick(r,0,a),d];},
  solve:values=>fractionAdditionLesson(values,true)
 },
 'multiplication-area':{
  generate:r=>[pick(r,10,99),pick(r,10,99)],
  solve:([a,b])=>{const at=Math.floor(a/10)*10,ao=a%10,bt=Math.floor(b/10)*10,bo=b%10;return lesson(`Multiply ${a} × ${b} using an area model.`,[
   step('Split each side into tens and ones.',`(${at}+${ao})(${bt}+${bo})`,table(['','Tens: '+at,'Ones: '+ao],[[bt,at*bt,ao*bt],[bo,at*bo,ao*bo]],'Four smaller rectangles')),
   step('Add the four smaller areas.',`${at*bt}+${ao*bt}+${at*bo}+${ao*bo}=${a*b}`)
  ],{answer:a*b,response:numeric(a*b)});}
 },
 'division-area':{
  generate:r=>[pick(r,100,999),pick(r,10,30)],
  solve:([n,d])=>{const facts=divisionFacts(n,d),q=safeInteger(facts.quotient),r=safeInteger(facts.remainder),tens=Math.floor(q/10)*10,ones=q%10;return lesson(`Share ${n} counters in groups of ${d}. Use partial quotients.`,[
   step(`First remove ${tens} groups, then ${ones} more groups.`,`${n}-${d}\\times${tens}=${n-d*tens},\\quad${n-d*tens}-${d}\\times${ones}=${r}`),
   step(`There are ${q} full groups and ${r} counters left. A remainder is smaller than the group size.`,`${n}=${d}\\times${q}+${r}`)
  ],{answer:`${q} remainder ${r}`});}
 },
 'unit-fraction':{
  generate:r=>[pick(r,1,9),pick(r,2,12),pick(r,0,1)],
  solve:([w,d,divide])=>lesson(divide?`How many pieces of size 1/${d} fit in ${w} wholes?`:`Find ${w} groups of 1/${d}.`,[
   step(divide?`Each whole holds ${d} pieces of that size.`:'Add one unit fraction for every group.',undefined,fracBars(divide?w*d:w,d,divide?'Each whole can be split into equal pieces':'One shaded piece per group')),
   step(divide?'Multiply wholes by the number of pieces per whole.':'Count the selected pieces; the piece size stays the same.',divide?`${w}\\div\\frac{1}{${d}}=${w}\\times${d}=${w*d}`:`${w}\\times\\frac{1}{${d}}=${fraction(w,d)}`)
  ],{answer:divide?String(w*d):fraction(w,d)})
 },
 'equivalent-ratio':{
  generate:r=>[pick(r,1,6),pick(r,1,9),pick(r,2,5)],
  solve:([a,b,k])=>lesson(`A recipe uses ${a} cups of oats for ${b} cups of milk. Scale it by ${k}.`,[
   step('Multiply both quantities by the same number.',`${a}:${b}=(${a}\\times${k}):(${b}\\times${k})`),
   step('The ratio stays the same.',`${a*k}:${b*k}`,table(['Batch','Oats (cups)','Milk (cups)'],[[1,a,b],[k,a*k,b*k]],'Equivalent ratios'))
  ],{answer:`${a*k}:${b*k}`})
 }
};
