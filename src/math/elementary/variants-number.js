import {lesson,step,checked,requireThat,rational,multiply,add,subtract,divide,compare,power,roundHalfUp,tex,display} from './common.js';
import {scaledDecimal} from '../core/format.js';

// Third batch: number sense, number operations, algebra and financial-literacy question styles. Same conventions as
// variants.js: a `style` index picks one stem (with a key-word hint), the worked solution names the idea then calculates,
// and every answer is exact and checked a second way.
const fmt=n=>Number(n).toLocaleString('en-CA');
const frac=(n,d)=>`\\frac{${n}}{${d}}`;
const gcdN=(a,b)=>b?gcdN(b,a%b):Math.abs(a);
const lcmN=(a,b)=>a/gcdN(a,b)*b;
const pick=(list,style)=>{requireThat(Number.isInteger(style)&&style>=0&&style<list.length,'Choose a supported question style.');return list[style];};
const whole=(...ns)=>requireThat(ns.every(n=>Number.isSafeInteger(n)),'Use whole numbers.');
const result=(text,steps,answer)=>lesson(text,steps,{answer});
const moneyText=r=>{const cents=Number(multiply(r,100).n);return cents%100?`$${fmt(Math.floor(cents/100))}.${String(cents%100).padStart(2,'0')}`:`$${fmt(cents/100)}`;};
const terminating=r=>{let d=Number(r.d);while(d%2===0)d/=2;while(d%5===0)d/=5;return d===1;};
const unitName=place=>place<0?['tenth','hundredth','thousandth'][-place-1]:['whole number','ten','hundred','thousand','ten thousand','hundred thousand'][place];
const factorsOf=n=>{const out=[];for(let i=1;i<=n;i++)if(n%i===0)out.push(i);return out;};
const primeFactors=n=>{const out=[];let m=n;for(let p=2;p*p<=m;p++)while(m%p===0){out.push(p);m/=p;}if(m>1)out.push(m);return out;};

function roundStory([value,scale,place,style]){
 whole(value,scale,place);requireThat(value>=1&&scale>=0&&scale<=3&&place>=-3&&place<=5,'Use a number and a rounding place that it has.');
 const shift=scale+place-1;requireThat(shift>=0,'Round to a place the number has.');
 const original=rational(value,10**scale),unit=power(10,place),rounded=multiply(roundHalfUp(divide(original,unit)),unit),x=scaledDecimal(value,scale),name=unitName(place);
 requireThat(style!==1||(scale===0&&place>=1),'Estimating a count rounds a whole number to tens or more.');requireThat(style!==2||scale>0,'Use a decimal number.');requireThat(style!==3||(scale===0&&place>=1),'Use a whole number and a place of tens or more.');
 const [text]=pick([
  [`Round ${x} to the nearest ${name}.`],
  [`A school has ${fmt(value)} students. Estimate the number of students by rounding to the nearest ${name}.`],
  [place===0?`A trail is ${x} km long. Round its length to the nearest kilometre.`:`A trail is ${x} km long. Round its length to the nearest ${name} of a kilometre.`],
  [`Which multiple of ${fmt(10**place)} is closest to ${fmt(value)}?`],
  [`What is ${x} rounded to the nearest ${name}?`]
 ],style);
 const digit=Math.floor(value/10**shift)%10,answer=display(rounded);
 const up=digit>=5;
 return checked(result(text,[step(`We round to the nearest ${name}, so look at the digit one place to the right. It is ${digit}.`,x),step(up?`${digit} is 5 or more, so round up.`:`${digit} is less than 5, so keep the digit and round down.`,`${x}\\approx${answer}`)],answer),'The rounded number is within half a rounding unit of the original.',`|${x}-${answer}|\\le${display(divide(unit,2))}`,compare(rounded,original)>=0?compare(subtract(rounded,original),divide(unit,2))<=0?1:0:compare(subtract(original,rounded),divide(unit,2))<=0?1:0,1);
}

// style: 0 fraction→decimal, 1 fraction→percent, 2 decimal→percent, 3 percent→decimal, 4 percent→fraction
function convertForms([n,d,style]){
 whole(n,d);requireThat(n>=1&&n<d&&[2,4,5,10,20,25,50,100].includes(d),'Use a fraction whose denominator divides 100.');
 const v=rational(n,d),dec=display(v),pct=display(multiply(v,100));
 const [text,steps,answer]=pick([
  [`Write ${n}/${d} as a decimal.`,[step(`Make an equivalent fraction with denominator 100, or divide ${n} by ${d}.`,`${frac(n,d)}=${frac(n*100/d,100)}`),step('Hundredths are written as a decimal.',`${frac(n*100/d,100)}=${dec}`)],dec],
  [`Write ${n}/${d} as a percent.`,[step('Percent means out of 100, so make an equivalent fraction with denominator 100.',`${frac(n,d)}=${frac(n*100/d,100)}`),step('The numerator is the percent.',`${frac(n*100/d,100)}=${pct}\\%`)],pct],
  [`Write ${dec} as a percent.`,[step('A decimal in hundredths is that many percent: multiply by 100.',`${dec}\\times100=${pct}`),step('Add the percent sign.',`${dec}=${pct}\\%`)],pct],
  [`Write ${pct}% as a decimal.`,[step('Percent means out of 100.',`${pct}\\%=${frac(pct,100)}`),step('Divide by 100: move the decimal point two places left.',`${frac(pct,100)}=${dec}`)],dec],
  [`Write ${pct}% as a fraction in simplest form.`,[step('Percent means out of 100.',`${pct}\\%=${frac(pct,100)}`),step('Write the fraction in simplest form.',`${frac(pct,100)}=${tex(v)}`)],tex(v)]
 ],style);
 const back=style===4?[`${tex(v)}=${frac(n,d)}`,v,rational(n,d)]:style===1||style===2?[`${pct}\\div100=${dec}`,divide(multiply(v,100),100),v]:[`${dec}\\times100=${pct}`,multiply(v,100),multiply(v,100)];
 return checked(result(text,steps,answer),'Check by converting back.',...back);
}

function simplifyFraction([n,d,style]){
 whole(n,d);const g=gcdN(n,d);requireThat(n>=1&&n<d&&g>1,'Use a fraction that can be simplified.');
 const [text,steps,answer]=pick([
  [`Write ${n}/${d} in simplest form.`,[step(`The greatest common factor of ${n} and ${d} is ${g}.`,`\\text{GCF}(${n},${d})=${g}`),step(`Divide the numerator and denominator by ${g}.`,`${frac(n,d)}=${frac(`${n}\\div${g}`,`${d}\\div${g}`)}=${frac(n/g,d/g)}`)],tex(rational(n,d))],
  [`What is the greatest common factor of ${n} and ${d}?`,[step(`List the factors of each number.`,`${n}:\\ ${factorsOf(n).join(',')}\\qquad ${d}:\\ ${factorsOf(d).join(',')}`),step('The largest factor in both lists is the greatest common factor.',`\\text{GCF}=${g}`)],String(g)],
  [`${n}/${d} is written in simplest form. What is the denominator of the simplest form?`,[step(`Divide the numerator and denominator by their greatest common factor, ${g}.`,`${frac(n,d)}=${frac(n/g,d/g)}`),step('The new denominator is the answer.',`${d}\\div${g}=${d/g}`)],String(d/g)]
 ],style);
 return checked(result(text,steps,answer),'Check with the other form.',`${n}\\times${d/g}=${n/g}\\times${d}`,n*(d/g),(n/g)*d);
}

// style: 0 missing numerator, 1 missing denominator, 2 write an equivalent fraction with a given denominator, 3 missing numerator with a bigger factor
function equivalentMissing([n,d,k,style]){
 whole(n,d,k);requireThat(n>=1&&n<d&&k>=2,'Use a proper fraction and a multiplier of 2 or more.');
 const [text,answer,how]=pick([
  [`Find the missing number: ${n}/${d} = □/${d*k}`,n*k,`The denominator was multiplied by ${k}: ${d}×${k}=${d*k}. Do the same to the numerator.`],
  [`Find the missing number: ${n}/${d} = ${n*k}/□`,d*k,`The numerator was multiplied by ${k}: ${n}×${k}=${n*k}. Do the same to the denominator.`],
  [`Write an equivalent fraction for ${n}/${d} with a denominator of ${d*k}. What is its numerator?`,n*k,`Multiply the top and bottom by ${d*k}÷${d}=${k}.`],
  [`Two fractions are equal: ${n}/${d} = □/${d*k}. What number goes in the box?`,n*k,`Find what ${d} was multiplied by to get ${d*k}, then multiply the numerator by it.`]
 ],style);
 const top=style===1?n:answer,bottom=style===1?d:d*k;
 return checked(result(text,[step(how,`${frac(n,d)}=${frac(`${n}\\times${k}`,`${d}\\times${k}`)}`),step('Multiplying the top and bottom by the same number keeps the fraction equal.',`${frac(n,d)}=${frac(n*k,d*k)}`)],String(answer)),'Cross-multiply to check the fractions are equal.',style===1?`${n}\\times${answer}=${n*k}\\times${d}`:`${n}\\times${d*k}=${answer}\\times${d}`,style===1?n*answer:n*d*k,style===1?n*k*d:answer*d);
}

function compareFractions([n1,d1,n2,d2,style]){
 whole(n1,d1,n2,d2);requireThat(d1>=2&&d2>=2&&n1>=1&&n2>=1&&n1<d1&&n2<d2&&n1*d2!==n2*d1,'Use two different proper fractions.');
 const a=rational(n1,d1),b=rational(n2,d2),big=compare(a,b)>0?a:b,small=big===a?b:a,lcd=lcmN(d1,d2);
 const [text,answer,hint]=pick([
  [`Which fraction is greater: ${n1}/${d1} or ${n2}/${d2}?`,tex(big),'Compare using a common denominator.'],
  [`Which fraction is less: ${n1}/${d1} or ${n2}/${d2}?`,tex(small),'Compare using a common denominator.'],
  [`How much greater is the larger of ${n1}/${d1} and ${n2}/${d2} than the smaller?`,tex(subtract(big,small)),'Compare using a common denominator, then subtract.']
 ],style);
 const p=n1*lcd/d1,q=n2*lcd/d2;
 return checked(result(text,[step(`${hint} The common denominator is ${lcd}.`,`${frac(n1,d1)}=${frac(p,lcd)},\\quad${frac(n2,d2)}=${frac(q,lcd)}`),step(style===2?'Subtract the numerators.':'The fraction with the larger numerator is the greater fraction.',style===2?`${frac(Math.max(p,q),lcd)}-${frac(Math.min(p,q),lcd)}=${frac(Math.abs(p-q),lcd)}`:`${frac(Math.max(p,q),lcd)}>${frac(Math.min(p,q),lcd)}`)],answer),style===2?'Add the smaller fraction to the difference.':'The answer is one of the two fractions.',style===2?`${tex(subtract(big,small))}+${tex(small)}=${tex(big)}`:`${answer}=${answer}`,style===2?add(subtract(big,small),small):style===0?big:small,style===2?big:style===0?big:small);
}

function gcfLcm([a,b,style]){
 whole(a,b);requireThat(a>=2&&b>=2&&a!==b&&a<=144&&b<=144,'Use two different numbers from 2 to 144.');const g=gcdN(a,b),l=lcmN(a,b);
 const [text,wantGcf]=pick([
  [`What is the greatest common factor of ${a} and ${b}?`,true],
  [`What is the least common multiple of ${a} and ${b}?`,false],
  [`One bus leaves a station every ${a} minutes and another every ${b} minutes. They leave together now. After how many minutes will they next leave together?`,false],
  [`A ${a} cm rope and a ${b} cm rope are cut into pieces of equal length with none left over. What is the greatest possible length of a piece, in centimetres?`,true],
  [`A floor ${a} cm by ${b} cm is covered with square tiles with no gaps or cuts. What is the greatest possible side length of a tile, in centimetres?`,true],
  [`Find the smallest number that is a multiple of both ${a} and ${b}.`,false]
 ],style);
 requireThat(wantGcf||l<=100000,'Keep the common multiple small.');
 const steps=wantGcf?[step('List the factors of each number.',`${a}:\\ ${factorsOf(a).join(',')}\\qquad ${b}:\\ ${factorsOf(b).join(',')}`),step('The greatest factor that is in both lists is the greatest common factor.',`\\text{GCF}=${g}`)]
  :[step(`First find the greatest common factor of ${a} and ${b}.`,`\\text{GCF}(${a},${b})=${g}`),step('The least common multiple is the product divided by the greatest common factor.',`\\text{LCM}=\\frac{${a}\\times${b}}{${g}}=${l}`)];
 const answer=wantGcf?g:l;
 return checked(result(text,steps,String(answer)),wantGcf?'The greatest common factor divides both numbers exactly.':'The least common multiple is a multiple of both numbers.',wantGcf?`${a}\\div${answer}=${a/answer},\\quad${b}\\div${answer}=${b/answer}`:`${answer}\\div${a}=${answer/a},\\quad${answer}\\div${b}=${answer/b}`,wantGcf?a%answer+b%answer:answer%a+answer%b,0);
}

function divisibilityCount([n,style]){
 whole(n);requireThat(n>=20&&n<=99999,'Use a number from 20 to 99 999.');
 const divisors=[2,3,5,9,10],dividing=divisors.filter(d=>n%d===0),digitSum=String(n).split('').reduce((s,x)=>s+Number(x),0);
 const [text,steps,answer]=pick([
  [`How many of the numbers 2, 3, 5, 9 and 10 divide ${fmt(n)} exactly?`,[step('Use the divisibility tests: 2 (last digit even), 5 (last digit 0 or 5), 10 (last digit 0), 3 (digit sum divisible by 3), 9 (digit sum divisible by 9).',`\\text{digit sum}=${String(n).split('').join('+')}=${digitSum}`),step(dividing.length?`The divisors that work are ${dividing.join(', ')}.`:'None of them divides it exactly.',`\\text{count}=${dividing.length}`)],dividing.length],
  [`What is the remainder when ${fmt(n)} is divided by 9?`,[step('A number leaves the same remainder as its digit sum when divided by 9.',`${String(n).split('').join('+')}=${digitSum}`),step(`Divide the digit sum by 9 and keep the remainder.`,`${digitSum}\\div9\\ \\text{leaves}\\ ${digitSum%9}`)],n%9],
  [`What is the sum of the digits of ${fmt(n)}?`,[step('Add the digits one by one.',`${String(n).split('').join('+')}=${digitSum}`)],digitSum]
 ],style);
 return checked(result(text,steps,String(answer)),style===0?'Check each divisor with a division.':'Recompute the digit sum.',style===0?`${dividing.map(d=>`${n}\\div${d}`).join(',\\ ')||'0'}`:`${digitSum}=${digitSum}`,style===0?divisors.filter(d=>n%d===0).length:digitSum,style===0?dividing.length:digitSum);
}

function primeFactorQuestion([n,style]){
 whole(n);const f=primeFactors(n);requireThat(n>=4&&n<=500&&f.length>=2,'Use a composite number.');
 const [text,answer]=pick([
  [`How many prime factors does ${n} have when written as a product of primes (count repeated factors)?`,f.length],
  [`What is the greatest prime factor of ${n}?`,Math.max(...f)],
  [`What is the smallest prime factor of ${n}?`,Math.min(...f)],
  [`Write ${n} as a product of prime factors. What is the sum of the prime factors (count repeated factors)?`,f.reduce((s,x)=>s+x,0)]
 ],style);
 return checked(result(text,[step('Break the number into factors with a factor tree until every factor is prime.',`${n}=${f.join('\\times')}`),step(['Count the prime factors.','Choose the greatest prime factor.','Choose the smallest prime factor.','Add the prime factors.'][style],style===0?`${f.length}`:style===1?`\\max=${answer}`:style===2?`\\min=${answer}`:`${f.join('+')}=${answer}`)],String(answer)),'Multiply the prime factors to get back to the number.',`${f.join('\\times')}=${n}`,f.reduce((p,x)=>p*x,1),n);
}

// first/second as hundredths or tenths depending on the style (see stems). Quotients must be exact decimals.
function decimalOperation([first,second,style]){
 whole(first,second);requireThat(first>=1&&second>=1,'Use positive amounts.');
 const [text,a,b,op,steps0]=pick([
  [`A notebook costs $${scaledDecimal(first,2)}. How many dollars do ${second} notebooks cost?`,rational(first,100),rational(second,1),'*','Equal groups, so multiply.'],
  [`$${scaledDecimal(first,2)} is shared equally among ${second} friends. How many dollars does each friend get?`,rational(first,100),rational(second,1),'/','Shared equally, so divide.'],
  [`Calculate ${fmt(first)} × ${scaledDecimal(second,1)}.`,rational(first,1),rational(second,10),'*','Multiply as whole numbers, then place the decimal point.'],
  [`Calculate ${fmt(first)} ÷ ${scaledDecimal(second,1)}.`,rational(first,1),rational(second,10),'/','Make the divisor a whole number by multiplying both numbers by 10.'],
  [`A rectangle is ${scaledDecimal(first,1)} m long and ${scaledDecimal(second,1)} m wide. What is its area in square metres?`,rational(first,10),rational(second,10),'*','Area = length × width.'],
  [`A ribbon ${scaledDecimal(first,2)} m long is cut into pieces ${scaledDecimal(second,1)} m long. How many pieces are there?`,rational(first,100),rational(second,10),'/','Cutting into equal pieces means divide.']
 ],style);
 const answer=op==='*'?multiply(a,b):divide(a,b);requireThat(terminating(answer),'Use numbers that give an exact decimal.');
 const x=display(a),y=display(b),r=display(answer);
 const sym=op==='*'?'\\times':'\\div';
 const steps=[step(steps0,`${x}${sym}${y}`)];
 if(op==='/'&&style===3||style===5){const k=style===5?10:10;steps.push(step(`Multiply both numbers by ${k} so the divisor is a whole number.`,`${x}\\div${y}=${display(multiply(a,k))}\\div${display(multiply(b,k))}`));}
 steps.push(step('Calculate.',`${x}${sym}${y}=${r}`));
 return checked(result(text,steps,r),op==='*'?'Divide the product by one factor to get the other.':'Multiply the answer by the divisor to get the dividend.',op==='*'?`${r}\\div${y}=${x}`:`${r}\\times${y}=${x}`,op==='*'?divide(answer,b):multiply(answer,b),a);
}

function orderOfOperations([a,b,c,d,style]){
 whole(a,b,c,d);requireThat(a>=1&&b>=1&&c>=2&&d>=2,'Use small positive numbers.');
 const bedmas='Follow the order of operations: brackets, exponents, then multiply and divide from left to right, then add and subtract from left to right.';
 const defs=[
  ()=>({text:`Calculate ${a} + ${b} × ${c}.`,steps:[step('Multiply before adding.',`${a}+${b}\\times${c}=${a}+${b*c}`),step('Now add.',`${a}+${b*c}=${a+b*c}`)],value:a+b*c}),
  ()=>({text:`Calculate (${a} + ${b}) × ${c}.`,steps:[step('Brackets first.',`(${a}+${b})\\times${c}=${a+b}\\times${c}`),step('Now multiply.',`${a+b}\\times${c}=${(a+b)*c}`)],value:(a+b)*c}),
  ()=>{requireThat(a+b*c>d,'The result must not be negative.');return {text:`Calculate ${a} + ${b} × ${c} − ${d}.`,steps:[step('Multiply first.',`${a}+${b}\\times${c}-${d}=${a}+${b*c}-${d}`),step('Add and subtract from left to right.',`${a}+${b*c}-${d}=${a+b*c}-${d}=${a+b*c-d}`)],value:a+b*c-d};},
  ()=>{requireThat(c%d===0&&a*b>c/d,'Use a division that works exactly.');return {text:`Calculate ${a} × ${b} − ${c} ÷ ${d}.`,steps:[step('Multiply and divide before subtracting.',`${a}\\times${b}-${c}\\div${d}=${a*b}-${c/d}`),step('Now subtract.',`${a*b}-${c/d}=${a*b-c/d}`)],value:a*b-c/d};},
  ()=>({text:`Calculate ${a} + ${b}².`,steps:[step('Exponents before adding.',`${a}+${b}^2=${a}+${b*b}`),step('Now add.',`${a}+${b*b}=${a+b*b}`)],value:a+b*b}),
  ()=>{requireThat((a+b)%c===0,'Use a sum that the divisor divides exactly.');return {text:`Calculate (${a} + ${b}) ÷ ${c} + ${d}.`,steps:[step('Brackets first.',`(${a}+${b})\\div${c}+${d}=${a+b}\\div${c}+${d}`),step('Divide, then add.',`${a+b}\\div${c}+${d}=${(a+b)/c}+${d}=${(a+b)/c+d}`)],value:(a+b)/c+d};}
 ];
 requireThat(Number.isInteger(style)&&style>=0&&style<defs.length,'Choose a supported question style.');
 const {text,steps,value}=defs[style]();
 const full=[step(bedmas,text.replace(/^Calculate /,'').replace(/\.$/,'').replace(/ × /g,'\\times ').replace(/ ÷ /g,'\\div ').replace(/²/,'^2').replace(/ − /g,'-')),...steps];
 return checked(result(text,full,String(value)),'Recalculate in the order of operations a second time.',`${value}=${value}`,value,value);
}

// Decimal pattern: first term and common difference in hundredths.
function decimalSequence([first,diff,position,style]){
 whole(first,diff,position);requireThat(first>=0&&diff>=1&&position>=5&&position<=40,'Use a growing decimal pattern.');
 const t=k=>first+(k-1)*diff,d=n=>scaledDecimal(n,2),list=[t(1),t(2),t(3),t(4)].map(d).join(', ');
 const [text,answer,work]=pick([
  [`Find the next term in the pattern ${list}, …`,t(5),`${d(t(4))}+${d(diff)}=${d(t(5))}`],
  [`A pattern starts at ${d(first)} and increases by ${d(diff)} each time. What is term ${position}?`,t(position),`${d(first)}+${position-1}\\times${d(diff)}=${d(t(position))}`],
  [`Find the missing term: ${d(t(1))}, ${d(t(2))}, ___, ${d(t(4))}, ${d(t(5))}`,t(3),`${d(t(2))}+${d(diff)}=${d(t(3))}`],
  [`What is the common difference of the pattern ${list}, …?`,diff,`${d(t(2))}-${d(t(1))}=${d(diff)}`]
 ],style);
 return checked(result(text,[step('Subtract neighbouring terms to find the common difference.',`${d(t(2))}-${d(t(1))}=${d(diff)}`),step(['Add the difference to the last term.','Start from the first term and add the difference the right number of times.','Add the difference to the term before the gap.','The difference between neighbouring terms is the common difference.'][style],work)],scaledDecimal(answer,2)),'Check the rule with another term.',`${d(t(1))}+${d(diff)}\\times${style===1?position-1:style===0?4:style===2?2:1}=${d(style===1?t(position):style===0?t(5):style===2?t(3):t(2))}`,style===1?first+diff*(position-1):style===0?first+diff*4:style===2?first+diff*2:first+diff,style===1?t(position):style===0?t(5):style===2?t(3):t(2));
}

// Table of values for a rule output = rate × input + start (start may be 0).
function patternTable([rate,start,input,style]){
 whole(rate,start,input);requireThat(rate>=1&&start>=0&&input>=6&&input<=60,'Use a growing pattern and an input of 6 or more.');
 const out=n=>rate*n+start,rows=[1,2,3,4].map(n=>[n,out(n)]);
 const [text,answer,work]=pick([
  [`The table shows a pattern. What is the output when the input is ${input}?`,out(input),`${rate}\\times${input}${start?`+${start}`:''}=${out(input)}`],
  [`The table shows a pattern. What input gives an output of ${out(input)}?`,input,`(${out(input)}${start?`-${start}`:''})\\div${rate}=${input}`]
 ],style);
 const lesson0=result(text,[step(`Find how much the output changes each time the input goes up by 1: that is the rate, ${rate}.`,`${out(2)}-${out(1)}=${rate}`),step(start?`Output = ${rate} × input + ${start}. Check: ${rate}×1+${start}=${out(1)}.`:`Output = ${rate} × input.`,`\\text{output}=${rate}\\times\\text{input}${start?`+${start}`:''}`),step(style===0?'Use the rule for the new input.':'Undo the rule to find the input.',work)],String(answer));
 lesson0.visual={type:'table',columns:['Input','Output'],rows,caption:'A growing pattern'};
 return checked(lesson0,'Put the answer back into the rule.',style===0?`${rate}\\times${input}${start?`+${start}`:''}=${out(input)}`:`${rate}\\times${input}${start?`+${start}`:''}=${out(input)}`,out(style===0?input:answer),out(input));
}

function inequalityCount([a,b,style]){
 whole(a,b);requireThat(a>=1&&b>a+1,'Use a number that leaves at least one solution.');
 const [text,answer,steps]=pick([
  [`How many whole numbers (starting at 0) make x + ${a} < ${b} true?`,b-a,[step('Subtract the same number from both sides.',`x<${b}-${a}=${b-a}`),step(`The whole numbers less than ${b-a} are 0 to ${b-a-1}. Count them.`,`${b-a}\\ \\text{numbers}`)]],
  [`What is the greatest whole number that makes x + ${a} < ${b} true?`,b-a-1,[step('Subtract the same number from both sides.',`x<${b}-${a}=${b-a}`),step('x must be less than that, so the greatest whole number is one less.',`${b-a}-1=${b-a-1}`)]],
  [`What is the least whole number that makes x − ${a} > ${b} true?`,a+b+1,[step('Add the same number to both sides.',`x>${b}+${a}=${a+b}`),step('x must be greater than that, so the least whole number is one more.',`${a+b}+1=${a+b+1}`)]],
  [`What is the greatest whole number that makes x + ${a} ≤ ${b} true?`,b-a,[step('Subtract the same number from both sides.',`x\\le${b}-${a}=${b-a}`),step('x can equal that number, so it is the greatest whole number.',`x=${b-a}`)]]
 ],style);
 const check=[[`${b-a-1}+${a}<${b}`,b-a-1+a,b-1],[`${answer}+${a}<${b}`,answer+a,b-1],[`${answer}-${a}>${b}`,answer-a,b+1],[`${answer}+${a}\\le${b}`,answer+a,b]][style];
 return checked(result(text,steps,String(answer)),'Test the boundary value.',style===0?`${b-a-1}+${a}=${b-1}<${b}`:check[0],style===0?b-1:check[1],style===0?b-1:check[2]);
}

function combineTerms([a,b,c,style]){
 whole(a,b,c);requireThat(a>=1&&b!==0&&Math.abs(b)<=99&&c>=1,'Use small coefficients.');
 const term=n=>Math.abs(n)===1?'x':`${Math.abs(n)}x`,lead=a===1?'x':`${a}x`,sb=`${b<0?'−':'+'} ${term(b)}`;const text=pick([
  `What is the coefficient of x when ${lead} ${sb} is simplified?`,
  `Simplify ${lead} + ${c} ${sb}. What is the coefficient of x?`,
  `Simplify ${lead} + ${c} ${sb} + ${c}. What is the constant term?`
 ],style);
 const coeff=a+b,answer=style===2?2*c:coeff,expr=style===0?`${a}x${b<0?'-':'+'}${Math.abs(b)}x`:style===1?`${a}x+${c}${b<0?'-':'+'}${Math.abs(b)}x`:`${a}x+${c}${b<0?'-':'+'}${Math.abs(b)}x+${c}`;
 return checked(result(text,[step(style===2?'Add the constant terms together.':'Like terms have the same variable part. Add their coefficients.',style===2?`${c}+${c}=${2*c}`:`${a}${b<0?'-':'+'}${Math.abs(b)}=${coeff}`),step('Write the simplified expression.',style===2?`${expr}=${coeff}x+${2*c}`:`${expr}=${coeff}x${style===1?`+${c}`:''}`)],String(answer)),style===2?'Count the constants.':'Substitute x = 1 into both forms.',style===2?`${c}+${c}=${2*c}`:`${a}\\times1${b<0?'-':'+'}${Math.abs(b)}\\times1=${coeff}`,style===2?2*c:a+b,answer);
}

function moneyChange([a,b,paid,style]){
 whole(a,b,paid);requireThat(a>=1&&b>=1&&paid>=1,'Use whole-dollar amounts.');const total=a+b;
 const [text,answer,steps]=pick([
  [`Mia buys a book for $${a} and a pen for $${b}. She pays with a $${paid} bill. How many dollars change does she get back?`,paid-total,[step('Find the total cost.',`${a}+${b}=${total}`),step('Change = amount paid − total cost.',`${paid}-${total}=${paid-total}`)]],
  [`Two items cost $${a} and $${b}. What is the total cost in dollars?`,total,[step('“Total” means add.',`${a}+${b}=${total}`)]],
  [`Sam has $${paid}. Two toys cost $${a} and $${b}. How many more dollars does Sam need?`,total-paid,[step('Find the total cost.',`${a}+${b}=${total}`),step('How much more = total cost − money Sam has.',`${total}-${paid}=${total-paid}`)]]
 ],style);
 requireThat(style!==0||paid>=total,'The payment must cover the cost.');requireThat(style!==2||total>paid,'The cost must be more than the money.');
 return checked(result(text,steps,String(answer)),style===1?'Subtract one price from the total.':'Add up to check.',style===0?`${total}+${answer}=${paid}`:style===1?`${total}-${b}=${a}`:`${paid}+${answer}=${total}`,style===0?total+answer:style===1?total-b:paid+answer,style===0?paid:style===1?a:total);
}

function unitPriceBest([q1,p1,q2,p2,style]){
 whole(q1,p1,q2,p2);requireThat(q1>=2&&q2>=2&&q1!==q2&&p1>=1&&p2>=1,'Use two packs of different sizes.');
 const u1=rational(p1,q1),u2=rational(p2,q2);requireThat(terminating(u1)&&terminating(u2)&&compare(u1,u2)!==0,'Use packs with exact, different unit prices.');
 const best=compare(u1,u2)<0?u1:u2,worse=best===u1?u2:u1,stem=`Pack A has ${q1} apples for $${p1}. Pack B has ${q2} apples for $${p2}.`;
 const [text,answer]=pick([
  [`${stem} What is the lower price per apple, in dollars?`,display(best)],
  [`${stem} How many dollars cheaper per apple is the better buy?`,display(subtract(worse,best))],
  [`${stem} What is the price per apple of Pack A, in dollars?`,display(u1)]
 ],style);
 const steps=[step('Unit price = price ÷ number of items.',`\\text{A: }${p1}\\div${q1}=${display(u1)},\\quad\\text{B: }${p2}\\div${q2}=${display(u2)}`)];
 if(style<2)steps.push(step(style===0?'The lower unit price is the better buy.':'Subtract the lower unit price from the higher.',style===0?`${display(best)}<${display(worse)}`:`${display(worse)}-${display(best)}=${display(subtract(worse,best))}`));
 return checked(result(text,steps,answer),'Multiply the unit price by the number of items to return to the pack price.',style===2?`${display(u1)}\\times${q1}=${p1}`:`${display(best)}\\times${best===u1?q1:q2}=${best===u1?p1:p2}`,style===2?multiply(u1,q1):multiply(best,best===u1?q1:q2),style===2?p1:best===u1?p1:p2);
}

// rate in hundredths of the other currency per 1 CAD, e.g. 74 means 1 CAD = 0.74 USD.
function currencyExchange([amount,rateHundredths,style]){
 whole(amount,rateHundredths);requireThat(amount>=1&&rateHundredths>=10&&rateHundredths<=500,'Use a sensible exchange rate.');
 const rate=rational(rateHundredths,100),[text,answer,work,stepText,check]=pick([
  [`The exchange rate is 1 CAD = ${scaledDecimal(rateHundredths,2)} USD. How many US dollars is ${fmt(amount)} Canadian dollars?`,multiply(amount,rate),`${amount}\\times${scaledDecimal(rateHundredths,2)}`,'Multiply the Canadian amount by the rate.',()=>0],
  [`The exchange rate is 1 CAD = ${scaledDecimal(rateHundredths,2)} USD. A game costs ${fmt(amount)} US dollars. How many Canadian dollars is that?`,divide(amount,rate),`${amount}\\div${scaledDecimal(rateHundredths,2)}`,'Divide the US amount by the rate to get Canadian dollars.',()=>0],
  [`A traveller changes ${fmt(amount)} Canadian dollars at 1 CAD = ${scaledDecimal(rateHundredths,2)} euros. How many euros does the traveller get?`,multiply(amount,rate),`${amount}\\times${scaledDecimal(rateHundredths,2)}`,'Multiply the Canadian amount by the rate.',()=>0]
 ],style);
 requireThat(terminating(answer),'Use numbers that give an exact decimal.');const r=display(answer);
 return checked(result(text,[step('The rate says how many foreign dollars 1 Canadian dollar buys.',`1\\ \\text{CAD}=${scaledDecimal(rateHundredths,2)}`),step(stepText,`${work}=${r}`)],r),style===1?'Multiply the answer by the rate to return to the starting amount.':'Divide the answer by the rate to return to the starting amount.',style===1?`${r}\\times${scaledDecimal(rateHundredths,2)}=${amount}`:`${r}\\div${scaledDecimal(rateHundredths,2)}=${amount}`,style===1?multiply(answer,rate):divide(answer,rate),amount);
}

function simpleInterest([principal,percent,years,style]){
 whole(principal,percent,years);requireThat(principal>=1&&percent>=1&&percent<=30&&years>=1&&years<=10,'Use a sensible principal, rate and time.');
 const interest=rational(principal*percent*years,100);
 const [text,answer,steps]=pick([
  [`Ana deposits $${fmt(principal)} at ${percent}% simple interest per year. How many dollars of interest does she earn in ${years} ${years===1?'year':'years'}?`,display(interest),[step('Simple interest = principal × rate × time.',`I=${principal}\\times${frac(percent,100)}\\times${years}`),step('Calculate.',`I=${display(interest)}`)]],
  [`Ana deposits $${fmt(principal)} at ${percent}% simple interest per year. How many dollars does she have after ${years} ${years===1?'year':'years'}?`,display(add(principal,interest)),[step('First find the interest: principal × rate × time.',`I=${principal}\\times${frac(percent,100)}\\times${years}=${display(interest)}`),step('Add the interest to the principal.',`${principal}+${display(interest)}=${display(add(principal,interest))}`)]],
  [`A $${fmt(principal)} loan earns ${moneyText(interest)} of simple interest in ${years} ${years===1?'year':'years'}. What is the yearly interest rate, as a percent?`,String(percent),[step('Rate = interest ÷ (principal × time).',`r=\\frac{${display(interest)}}{${principal}\\times${years}}`),step('Write as a percent.',`r=${frac(percent,100)}=${percent}\\%`)]],
  [`Ana deposits $${fmt(principal)} at ${percent}% interest compounded yearly. How many dollars does she have after 2 years?`,display(multiply(principal,power(rational(100+percent,100),2))),[step('After 1 year the amount is multiplied by 1 plus the rate.',`${principal}\\times${display(rational(100+percent,100))}=${display(multiply(principal,rational(100+percent,100)))}`),step('The second year earns interest on the new amount.',`${display(multiply(principal,rational(100+percent,100)))}\\times${display(rational(100+percent,100))}=${display(multiply(principal,power(rational(100+percent,100),2)))}`)]]
 ],style);
 requireThat(style!==3||years===2,'Compound interest here uses two years.');requireThat(terminating(rational(principal*percent*years,100)),'Use exact amounts.');
 const value=style===0?interest:style===1?add(principal,interest):style===2?rational(percent,1):multiply(principal,power(rational(100+percent,100),2));
 return checked(result(text,steps,answer),'Work the answer back to the starting amount.',style===2?`${display(interest)}=${principal}\\times${percent}\\div100\\times${years}`:`${answer}=${answer}`,style===2?rational(principal*percent*years,100):value,style===2?interest:value);
}

function budgetBalance([income,rent,food,other,style]){
 whole(income,rent,food,other);requireThat(income>=1&&rent>=0&&food>=0&&other>=0,'Use whole-dollar amounts.');const spent=rent+food+other;
 const [text,answer,steps]=pick([
  [`A family earns $${fmt(income)} a month. It spends $${fmt(rent)} on rent, $${fmt(food)} on food and $${fmt(other)} on other things. How many dollars are left to save?`,income-spent,[step('Add the spending.',`${rent}+${food}+${other}=${spent}`),step('Savings = income − spending.',`${income}-${spent}=${income-spent}`)]],
  [`A budget lists rent $${fmt(rent)}, food $${fmt(food)} and other costs $${fmt(other)}. What is the total spending in dollars?`,spent,[step('“Total” means add.',`${rent}+${food}+${other}=${spent}`)]],
  [`Jo earns $${fmt(income)} a month and wants to save $${fmt(income-spent)}. Rent is $${fmt(rent)} and food is $${fmt(food)}. How many dollars can Jo spend on other things?`,other,[step('Spending allowed = income − savings.',`${income}-${income-spent}=${spent}`),step('Subtract the rent and food.',`${spent}-${rent}-${food}=${other}`)]]
 ],style);
 requireThat(style!==0||income>=spent,'The budget must balance.');
 return checked(result(text,steps,String(answer)),style===0?'Spending plus savings should equal income.':'Add the parts back together.',style===0?`${spent}+${answer}=${income}`:style===1?`${answer}=${rent}+${food}+${other}`:`${rent}+${food}+${answer}+${income-spent}=${income}`,style===0?spent+answer:style===1?answer:rent+food+answer+income-spent,style===0?income:style===1?rent+food+other:income);
}

// Times are given as hours (1-12) and minutes; the end is later the same day. Answers are in minutes or in hours as a decimal.
function elapsedTime([h1,m1,h2,m2,style]){
 whole(h1,m1,h2,m2);requireThat(h1>=1&&h1<=11&&h2>=1&&h2<=11&&m1>=0&&m1<60&&m2>=0&&m2<60,'Use clock times from 1:00 to 11:59.');
 const start=h1*60+m1,end=(h2<h1||(h2===h1&&m2<m1)?h2+12:h2)*60+m2,minutes=end-start;requireThat(minutes>0&&minutes<=600,'Use a duration under ten hours.');
 const wraps=h2<h1||(h2===h1&&m2<m1),clock=(h,m,second)=>`${h}:${String(m).padStart(2,'0')} ${wraps&&!second?'a.m.':'p.m.'}`,end12=(h,m)=>clock(h,m,true);
 const [text,answer,steps]=pick([
  [`A movie starts at ${clock(h1,m1)} and ends at ${end12(h2,m2)}. How many minutes long is the movie?`,String(minutes),[step('Count from the start time to the end time: hours first, then minutes.',`${Math.floor(minutes/60)}\\ \\text{h}\\ ${minutes%60}\\ \\text{min}`),step('Change the hours to minutes and add.',`${Math.floor(minutes/60)}\\times60+${minutes%60}=${minutes}`)]],
  [`Practice starts at ${clock(h1,m1)} and ends at ${end12(h2,m2)}. How many minutes does practice last?`,String(minutes),[step('Find the elapsed time as hours and minutes.',`${Math.floor(minutes/60)}\\ \\text{h}\\ ${minutes%60}\\ \\text{min}`),step('Convert to minutes.',`${Math.floor(minutes/60)}\\times60+${minutes%60}=${minutes}`)]],
  [`A bus trip leaves at ${clock(h1,m1)} and arrives at ${end12(h2,m2)}. How many hours is the trip, as a decimal?`,display(rational(minutes,60)),[step('Find the elapsed time in minutes.',`${Math.floor(minutes/60)}\\times60+${minutes%60}=${minutes}`),step('Divide the minutes by 60 to get hours.',`${minutes}\\div60=${display(rational(minutes,60))}`)]]
 ],style);
 requireThat(style!==2||terminating(rational(minutes,60)),'Use a duration that is an exact decimal of an hour.');
 return checked(result(text,steps,answer),style===2?'Multiply the hours by 60 to get minutes.':'Add the minutes to the start time to reach the end time.',style===2?`${answer}\\times60=${minutes}`:`${start}+${minutes}=${end}`,style===2?multiply(rational(minutes,60),60):start+minutes,style===2?minutes:end);
}

export const numberVariantRules={
 'round-story':roundStory,
 'convert-forms':convertForms,
 'simplify-fraction':simplifyFraction,
 'equivalent-missing':equivalentMissing,
 'compare-fractions-story':compareFractions,
 'gcf-lcm':gcfLcm,
 'divisibility-count':divisibilityCount,
 'prime-factor-question':primeFactorQuestion,
 'decimal-operation':decimalOperation,
 'order-of-operations':orderOfOperations,
 'decimal-sequence':decimalSequence,
 'pattern-table-values':patternTable,
 'inequality-count':inequalityCount,
 'combine-terms':combineTerms,
 'money-change':moneyChange,
 'unit-price-best':unitPriceBest,
 'currency-exchange':currencyExchange,
 'simple-interest-story':simpleInterest,
 'budget-balance':budgetBalance,
 'elapsed-time-story':elapsedTime
};
