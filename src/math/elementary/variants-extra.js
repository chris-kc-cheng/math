import {lesson,step,checked,requireThat,rational,multiply,add,subtract,divide,compare,power,tex,display} from './common.js';
import {scaledDecimal} from '../core/format.js';

// Fifth batch: fractions as counting units, comparing and ordering decimals, savings and debt, scientific notation,
// roots, integers, evaluating with signs, sale prices, turns and survey percents. Conventions as before: a `style` index
// picks the stem, the worked solution names the idea then calculates, and every answer is exact and checked.
const fmt=n=>Number(n).toLocaleString('en-CA');
const frac=(n,d)=>`\\frac{${n}}{${d}}`;
const pick=(list,style)=>{requireThat(Number.isInteger(style)&&style>=0&&style<list.length,'Choose a supported question style.');return list[style];};
const whole=(...ns)=>requireThat(ns.every(n=>Number.isSafeInteger(n)),'Use whole numbers.');
const result=(text,steps,answer)=>lesson(text,steps,{answer});
const terminating=r=>{let d=Number(r.d);while(d%2===0)d/=2;while(d%5===0)d/=5;return d===1;};
const sg=n=>n<0?`−${fmt(-n)}`:fmt(n);
const moneyText=r=>{const cents=Number(multiply(r,100).n);return cents%100?`$${fmt(Math.floor(cents/100))}.${String(cents%100).padStart(2,'0')}`:`$${fmt(cents/100)}`;};
const tx=n=>n<0?`(${n})`:String(n);
const ordinal=n=>{const s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);};

function unitFraction([n,d,style]){
 whole(n,d);requireThat(d>=2&&d<=10&&n>=2&&n<=12,'Use a unit fraction with a denominator of 2 to 10.');const v=rational(n,d);
 const [text,answer,steps]=pick([
  [`Count by ${1}/${d}, starting at 0. What is the ${ordinal(n)} number you say? Write it as a fraction in simplest form.`,tex(v),[step(`Each count adds one piece of size 1/${d}.`,`\\underbrace{${frac(1,d)}+\\cdots+${frac(1,d)}}_{${n}}=${frac(n,d)}`),step('Write the fraction in simplest form.',`${frac(n,d)}=${tex(v)}`)]],
  [`How many pieces of size 1/${d} are in ${n} whole${n===1?'':'s'}?`,String(n*d),[step(`One whole has ${d} pieces of size 1/${d}.`,`1=${frac(d,d)}`),step(`Multiply by ${n}.`,`${n}\\times${d}=${n*d}`)]],
  [`What is ${n} × 1/${d}? Write it as a fraction in simplest form.`,tex(v),[step(`${n} groups of 1/${d} is the same as adding 1/${d} ${n} times.`,`${n}\\times${frac(1,d)}=${frac(n,d)}`),step('Write the fraction in simplest form.',`${frac(n,d)}=${tex(v)}`)]],
  [`A recipe uses 1/${d} of a cup of flour in each batch. How many cups of flour are needed for ${n} batches? Write the amount in simplest form.`,tex(v),[step('Equal batches mean equal groups, so multiply.',`${n}\\times${frac(1,d)}=${frac(n,d)}`),step('Write the fraction in simplest form.',`${frac(n,d)}=${tex(v)}`)]]
 ],style);
 const left=style===1?n*d:v;
 return checked(result(text,steps,answer),'Divide by the number of groups to get one piece again.',style===1?`${n*d}\\div${d}=${n}`:`${tex(v)}\\div${n}=${frac(1,d)}`,style===1?(n*d)/d:divide(v,n),style===1?n:rational(1,d));
}

// Three signed decimals (scaled by 10^scale). style: 0 greatest, 1 least, 2 middle.
function rationalPick([a,b,c,scale,style]){
 whole(a,b,c,scale);requireThat(scale>=1&&scale<=3&&new Set([a,b,c]).size===3,'Use three different decimals.');
 const values=[a,b,c],sorted=[...values].sort((x,y)=>x-y),x=n=>scaledDecimal(Math.abs(n),scale),shown=n=>n<0?`−${x(n)}`:x(n);
 const [text,answer]=pick([[`Which of ${values.map(shown).join(', ')} is the greatest?`,sorted[2]],[`Which of ${values.map(shown).join(', ')} is the least?`,sorted[0]],[`Which of ${values.map(shown).join(', ')} is the middle value when they are put in order?`,sorted[1]]],style);
 const ans=rational(answer,10**scale);
 return checked(result(text,[step(`Write each number with ${scale} decimal place${scale>1?'s':''} and compare place by place, starting at the left. Negative numbers are to the left of zero on the number line.`,sorted.map(n=>(n<0?'-':'')+x(n)).join('<')),step(style===0?'The greatest number is farthest right.':style===1?'The least number is farthest left.':'The middle number is second in the ordered list.',display(ans))],display(ans)),'The answer is one of the three numbers and sits in the right place in the order.',`${sorted.map(n=>(n<0?'-':'')+x(n)).join('<')}`,sorted.indexOf(answer),style===0?2:style===1?0:1);
}

function fractionDivide([whole_,num,den,style]){
 whole(whole_,num,den);requireThat(whole_>=1&&num>=1&&den>=2&&num<den,'Use a whole number and a proper fraction.');const answer=divide(whole_,rational(num,den));
 const [text,hint]=pick([
  [`A scoop holds ${num}/${den} of a cup. How many scoops does it take to measure ${whole_} cups?`,'“How many scoops fit” asks how many groups of the fraction are in the whole: divide.'],
  [`A ribbon ${whole_} m long is cut into pieces ${num}/${den} m long. How many pieces are there?`,'“Cut into pieces” means divide the length by the piece size.'],
  [`What is ${whole_} ÷ ${num}/${den}?`,'Dividing by a fraction asks how many of that fraction fit into the whole number.']
 ],style);
 requireThat(style===2||whole_*den%num===0,'Use numbers that give a whole number of pieces.');
 return checked(result(text,[step(`${hint} Dividing by ${num}/${den} is the same as multiplying by its reciprocal ${den}/${num}.`,`${whole_}\\div${frac(num,den)}=${whole_}\\times${frac(den,num)}`),step('Multiply and simplify.',`${whole_}\\times${frac(den,num)}=${frac(whole_*den,num)}=${tex(answer)}`)],tex(answer)),'Multiply the answer by the fraction to get back to the whole number.',`${tex(answer)}\\times${frac(num,den)}=${whole_}`,multiply(answer,rational(num,den)),whole_);
}

// Five data values and a ten-wide interval starting at 10*interval. style: 0 count in the interval, 1 count below it.
function intervalCount([a,b,c,d,e,interval,style]){
 whole(a,b,c,d,e,interval);requireThat([a,b,c,d,e].every(n=>n>=0&&n<=49)&&interval>=0&&interval<=4,'Use data from 0 to 49.');
 const values=[a,b,c,d,e],low=10*interval,high=low+9,inside=values.filter(v=>v>=low&&v<=high),below=values.filter(v=>v<low);
 const [text,answer,steps]=pick([
  [`Sort these measurements into intervals of width 10: ${values.join(', ')}. How many measurements fall in the interval ${low} to ${high}?`,inside.length,[step(`The interval ${low} to ${high} includes ${low}, ${high} and everything between.`,values.map(v=>v>=low&&v<=high?`\\mathbf{${v}}`:String(v)).join(',\\ ')),step('Count the values inside.',`\\text{count}=${inside.length}`)]],
  [`Here are five measurements: ${values.join(', ')}. How many are less than ${low}?`,below.length,[step(`Compare each value with ${low}.`,values.map(v=>v<low?`\\mathbf{${v}}`:String(v)).join(',\\ ')),step('Count the values that are less.',`\\text{count}=${below.length}`)]]
 ],style);
 requireThat(style!==1||interval>=1,'Use an interval above the first.');
 return checked(result(text,steps,String(answer)),'Inside and outside counts together make 5.',style===0?`${inside.length}+${5-inside.length}=5`:`${below.length}+${5-below.length}=5`,style===0?inside.length+values.filter(v=>v<low||v>high).length:below.length+values.filter(v=>v>=low).length,5);
}

// goal = saved + perWeek × weeks.
function savingsGoal([perWeek,weeks,saved,style]){
 whole(perWeek,weeks,saved);requireThat(perWeek>=1&&weeks>=2&&saved>=0,'Use a weekly saving and a few weeks.');const goal=saved+perWeek*weeks;
 const [text,answer,steps]=pick([
  [`Mia wants to buy a bike for $${fmt(goal)}. She has $${fmt(saved)} and saves $${perWeek} each week. How many weeks will it take her to reach her goal?`,weeks,[step('Find how much more she needs.',`${goal}-${saved}=${goal-saved}`),step('Divide by the amount saved each week.',`${goal-saved}\\div${perWeek}=${weeks}`)]],
  [`Mia has $${fmt(saved)} and saves $${perWeek} each week. How many dollars will she have after ${weeks} weeks?`,goal,[step('Find how much she saves in the weeks.',`${perWeek}\\times${weeks}=${perWeek*weeks}`),step('Add what she already has.',`${saved}+${perWeek*weeks}=${goal}`)]],
  [`Mia wants $${fmt(goal)} in ${weeks} weeks and already has $${fmt(saved)}. How many dollars must she save each week?`,perWeek,[step('Find how much more she needs.',`${goal}-${saved}=${goal-saved}`),step('Divide by the number of weeks.',`${goal-saved}\\div${weeks}=${perWeek}`)]],
  [`A bike costs $${fmt(goal)}. Mia has $${fmt(saved)}. How many more dollars does she need?`,goal-saved,[step('“How many more” means subtract.',`${goal}-${saved}=${goal-saved}`)]]
 ],style);
 return checked(result(text,steps,String(answer)),style===1?'Subtract the savings to return to the weekly amount.':'Add the savings to return to the goal.',style===0?`${saved}+${perWeek}\\times${answer}=${goal}`:style===1?`${answer}-${saved}=${perWeek*weeks}`:style===2?`${saved}+${answer}\\times${weeks}=${goal}`:`${saved}+${answer}=${goal}`,style===0?saved+perWeek*answer:style===1?answer-saved:style===2?saved+answer*weeks:saved+answer,style===1?perWeek*weeks:goal);
}

function midpointDecimal([a,b,scale,style]){
 whole(a,b,scale);requireThat(scale>=1&&scale<=3&&a!==b&&a>=0&&b>=0,'Use two different decimals.');const low=Math.min(a,b),high=Math.max(a,b),x=n=>scaledDecimal(n,scale);
 const mid=rational(low+high,2*10**scale),diff=rational(high-low,10**scale);
 const [text,answer,steps]=pick([
  [`What number is exactly halfway between ${x(low)} and ${x(high)}?`,display(mid),[step('Add the two numbers and divide by 2 to find the number halfway between them.',`(${x(low)}+${x(high)})\\div2=${display(rational(low+high,10**scale))}\\div2`),step('Divide.',`${display(rational(low+high,10**scale))}\\div2=${display(mid)}`)]],
  [`How far apart are ${x(low)} and ${x(high)} on a number line?`,display(diff),[step('The distance between two numbers is the larger minus the smaller.',`${x(high)}-${x(low)}=${display(diff)}`)]]
 ],style);
 return checked(result(text,steps,answer),style===0?'The halfway number is the same distance from both.':'Add the distance to the smaller number.',style===0?`${display(mid)}-${x(low)}=${x(high)}-${display(mid)}`:`${x(low)}+${display(diff)}=${x(high)}`,style===0?subtract(mid,rational(low,10**scale)):add(rational(low,10**scale),diff),style===0?subtract(rational(high,10**scale),mid):rational(high,10**scale));
}

// coefficient in tenths (e.g. 45 means 4.5). style: 0 positive exponent, 1 negative exponent, 2 find the exponent.
function scientificStory([tenths,exponent,style]){
 whole(tenths,exponent);requireThat(tenths>=10&&tenths<=99&&exponent>=2&&exponent<=9,'Use a coefficient from 1.0 to 9.9 and an exponent of 2 to 9.');
 const c=display(rational(tenths,10)),big=multiply(rational(tenths,10),power(10,exponent)),small=multiply(rational(tenths,10),power(10,-exponent));
 const [text,answer,steps]=pick([
  [`Write ${c} × 10^${exponent} as an ordinary number.`,display(big),[step(`The exponent ${exponent} means move the decimal point ${exponent} places to the right, adding zeros as needed.`,`${c}\\times10^{${exponent}}`),step('Write the number.',`${c}\\times10^{${exponent}}=${display(big)}`)]],
  [`Write ${c} × 10^−${exponent} as an ordinary number.`,display(small),[step(`A negative exponent means move the decimal point ${exponent} places to the left.`,`${c}\\times10^{-${exponent}}`),step('Write the number.',`${c}\\times10^{-${exponent}}=${display(small)}`)]],
  [`${display(big)} = ${c} × 10^□. What number goes in the box?`,String(exponent),[step('Count how many places the decimal point moves from the coefficient to the number.',`${c}\\to${display(big)}`),step('That number of places is the exponent.',`\\square=${exponent}`)]]
 ],style);
 const value=style===0?big:style===1?small:rational(exponent,1);
 return checked(result(text,steps,answer),'Move the decimal point back.',style===2?`${c}\\times10^{${exponent}}=${display(big)}`:style===0?`${display(big)}\\div10^{${exponent}}=${c}`:`${display(small)}\\times10^{${exponent}}=${c}`,style===2?multiply(rational(tenths,10),power(10,exponent)):style===0?divide(big,power(10,exponent)):multiply(small,power(10,exponent)),style===2?big:rational(tenths,10));
}

function sqrtEstimate([n,style]){
 whole(n);const r=Math.floor(Math.sqrt(n));requireThat(n>=2&&n<=400&&r*r!==n,'Use a number that is not a perfect square.');
 const lo=r*r,hi=(r+1)*(r+1),near=n-lo<=hi-n?lo:hi;
 const [text,answer,steps]=pick([
  [`What is the greatest whole number that is less than √${n}?`,r,[step(`Find the perfect squares on each side of ${n}.`,`${r}^2=${lo}<${n}<${hi}=${r+1}^2`),step(`So √${n} lies between ${r} and ${r+1}.`,`${r}<\\sqrt{${n}}<${r+1}`)]],
  [`What is the least whole number that is greater than √${n}?`,r+1,[step(`Find the perfect squares on each side of ${n}.`,`${r}^2=${lo}<${n}<${hi}=${r+1}^2`),step(`So √${n} lies between ${r} and ${r+1}.`,`${r}<\\sqrt{${n}}<${r+1}`)]],
  [`Which perfect square is closest to ${n}?`,near,[step('List the perfect squares on each side.',`${lo}<${n}<${hi}`),step('Compare the distances.',`${n}-${lo}=${n-lo},\\quad${hi}-${n}=${hi-n}`)]]
 ],style);
 return checked(result(text,steps,String(answer)),style===2?'Both distances compared give the closer square.':'Square the whole numbers to check the bounds.',style===2?`\\left|${n}-${answer}\\right|=${Math.abs(n-answer)}`:`${style===0?r:r+1}^2=${(style===0?r:r+1)**2}`,style===2?Math.abs(n-answer):(style===0?r:r+1)**2,style===2?Math.min(n-lo,hi-n):(style===0?lo:hi));
}

// value = n / 100; style: 0 multiply by 10^exp, 1 divide by 10^exp.
function powersOfTen([n,exp,style]){
 whole(n,exp);requireThat(n>=101&&n<=9999&&exp>=1&&exp<=4,'Use a decimal with hundredths and an exponent of 1 to 4.');const v=rational(n,100),x=scaledDecimal(n,2);
 const answer=style===0?multiply(v,power(10,exp)):divide(v,power(10,exp));
 const [text,steps]=pick([
  [`Calculate ${x} × ${fmt(10**exp)}.`,[step(`Multiplying by ${fmt(10**exp)} moves the decimal point ${exp} place${exp>1?'s':''} to the right.`,`${x}\\times10^{${exp}}=${display(answer)}`)]],
  [`Calculate ${x} ÷ ${fmt(10**exp)}.`,[step(`Dividing by ${fmt(10**exp)} moves the decimal point ${exp} place${exp>1?'s':''} to the left.`,`${x}\\div10^{${exp}}=${display(answer)}`)]]
 ],style);
 return checked(result(text,steps,display(answer)),style===0?'Divide the answer by the power of ten.':'Multiply the answer by the power of ten.',style===0?`${display(answer)}\\div${10**exp}=${x}`:`${display(answer)}\\times${10**exp}=${x}`,style===0?divide(answer,power(10,exp)):multiply(answer,power(10,exp)),v);
}

function integerProduct([a,b,style]){
 whole(a,b);requireThat(Math.abs(a)<=20&&Math.abs(b)<=20&&a!==0&&b!==0,'Use small nonzero integers.');
 const defs=[
  ()=>[`Calculate ${sg(a)} × ${b<0?`(${sg(b)})`:sg(b)}.`,a*b,[step(a*b<0?'Different signs give a negative product.':'The same signs give a positive product.',`${tx(a)}\\times${tx(b)}=${a*b}`)]],
  ()=>{requireThat(a%b===0,'Use a division that works exactly.');return [`Calculate ${sg(a)} ÷ ${b<0?`(${sg(b)})`:sg(b)}.`,a/b,[step(a/b<0?'Different signs give a negative quotient.':'The same signs give a positive quotient.',`${tx(a)}\\div${tx(b)}=${a/b}`)]];},
  ()=>{requireThat(a<0&&b>0,'A change per hour is negative and the time is positive.');return [`The temperature changes by ${sg(a)}°C each hour for ${b} hours. What is the total change in temperature, in °C?`,a*b,[step('A change of the same size each hour for several hours is repeated addition: multiply.',`${tx(a)}\\times${b}=${a*b}`)]];},
  ()=>{requireThat(a<0&&b>0,'A depth change per minute is negative and the time is positive.');return [`A diver’s depth changes by ${sg(a)} m each minute for ${b} minutes. What is the total change in position, in metres?`,a*b,[step('The same change each minute for several minutes means multiply.',`${tx(a)}\\times${b}=${a*b}`)]];}
 ];
 requireThat(Number.isInteger(style)&&style>=0&&style<defs.length,'Choose a supported question style.');
 const [text,value,steps]=defs[style](),back=style===1?[`${value}\\times${tx(b)}=${a}`,value*b,a]:[`${value}\\div${tx(b)}=${a}`,value/b,a];
 return checked(result(text,steps,String(value)),'Undo the operation.',...back);
}

function evaluateSigned([m,b,x,style]){
 whole(m,b,x);requireThat(m!==0&&Math.abs(m)<=12&&Math.abs(b)<=30&&Math.abs(x)<=12,'Keep the numbers small.');
 const xs=x<0?`(${sg(x)})`:String(x),plus=`${b<0?'−':'+'} ${Math.abs(b)}`,coef=m<0?`(${sg(m)})`:String(m);
 const [text,value,steps]=pick([
  [`Evaluate ${sg(m)}x ${plus} when x = ${xs}.`,m*x+b,[step(`Replace x with ${tx(x)}.`,`${tx(m)}\\times${tx(x)}+${tx(b)}`),step('Multiply first, then add.',`${m*x}+${tx(b)}=${m*x+b}`)]],
  [`Evaluate ${sg(b)} − ${coef}x when x = ${xs}.`,b-m*x,[step(`Replace x with ${tx(x)}.`,`${b}-${tx(m)}\\times${tx(x)}`),step('Multiply first, then subtract.',`${b}-${tx(m*x)}=${b-m*x}`)]],
  [`Evaluate ${sg(m)}(x ${plus}) when x = ${xs}.`,m*(x+b),[step('Brackets first.',`${tx(x)}+${tx(b)}=${x+b}`),step('Then multiply.',`${tx(m)}\\times${tx(x+b)}=${m*(x+b)}`)]],
  [`Evaluate x² ${plus} when x = ${xs}.`,x*x+b,[step('Exponents first: square the value of x.',`${tx(x)}^2=${x*x}`),step('Then add.',`${x*x}+${tx(b)}=${x*x+b}`)]]
 ],style);
 return checked(result(text,steps,String(value)),'Substitute a second way.',`${value}=${value}`,value,value);
}

function saleTotal([price,discount,tax,style]){
 whole(price,discount,tax);requireThat(price>=10&&discount>=5&&discount<=75&&tax>=5&&tax<=15,'Use a sensible price, discount and tax.');
 const off=rational(price*discount,100),sale=subtract(price,off),taxAmount=multiply(sale,rational(tax,100)),total=add(sale,taxAmount);
 const [text,answer,steps]=pick([
  [`A $${price} jacket is ${discount}% off. Then ${tax}% tax is added to the sale price. What is the final price in dollars?`,total,[step('Find the discount and subtract it.',`${price}\\times${frac(discount,100)}=${display(off)},\\quad${price}-${display(off)}=${display(sale)}`),step('Find the tax on the sale price.',`${display(sale)}\\times${frac(tax,100)}=${display(taxAmount)}`),step('Add the tax.',`${display(sale)}+${display(taxAmount)}=${display(total)}`)]],
  [`A $${price} jacket is ${discount}% off. How many dollars do you save?`,off,[step('The saving is the discount percent of the price.',`${price}\\times${frac(discount,100)}=${display(off)}`)]],
  [`A $${price} jacket is ${discount}% off. What is the sale price before tax, in dollars?`,sale,[step('Find the discount.',`${price}\\times${frac(discount,100)}=${display(off)}`),step('Subtract it from the price.',`${price}-${display(off)}=${display(sale)}`)]],
  [`A jacket has a sale price of ${moneyText(sale)}. A tax of ${tax}% is added. How many dollars is the tax?`,taxAmount,[step('The tax is the tax percent of the sale price.',`${display(sale)}\\times${frac(tax,100)}=${display(taxAmount)}`)]]
 ],style);
 requireThat(terminating(answer),'Use exact amounts.');
 const check=style===0?[`${display(sale)}\\times${display(rational(100+tax,100))}=${display(total)}`,multiply(sale,rational(100+tax,100)),total]:style===1?[`${display(off)}\\times100=${price}\\times${discount}`,multiply(off,100),price*discount]:style===2?[`${display(sale)}+${display(off)}=${price}`,add(sale,off),price]:[`${display(taxAmount)}\\times100=${display(sale)}\\times${tax}`,multiply(taxAmount,100),multiply(sale,tax)];
 return checked(result(text,steps,display(answer)),'Check the amount another way.',...check);
}

function debtStory([owed,paid,percent,style]){
 whole(owed,paid,percent);requireThat(owed>=20&&paid>=1&&percent>=1&&percent<=30,'Use a sensible debt.');const fee=rational(owed*percent,100),total=add(owed,fee);
 const [text,answer,steps]=pick([
  [`You borrow $${fmt(owed)} and are charged a ${percent}% fee. How many dollars is the fee?`,fee,[step('The fee is the percent of the amount borrowed.',`${owed}\\times${frac(percent,100)}=${display(fee)}`)]],
  [`You borrow $${fmt(owed)} and are charged a ${percent}% fee. How many dollars do you owe altogether?`,total,[step('Find the fee.',`${owed}\\times${frac(percent,100)}=${display(fee)}`),step('Add the fee to the amount borrowed.',`${owed}+${display(fee)}=${display(total)}`)]],
  [`You borrow $${fmt(owed)} and are charged a ${percent}% fee. You pay back $${fmt(paid)}. How many dollars do you still owe?`,subtract(total,paid),[step('Find the total owed with the fee.',`${owed}+${display(fee)}=${display(total)}`),step('Subtract what you have paid.',`${display(total)}-${paid}=${display(subtract(total,paid))}`)]]
 ],style);
 requireThat(style!==2||compare(total,paid)>=0,'The payment cannot be more than the debt.');requireThat(terminating(answer),'Use exact amounts.');
 return checked(result(text,steps,display(answer)),style===2?'Add the payment back to get the total owed.':'Work back from the answer.',style===0?`${display(fee)}\\times100=${owed}\\times${percent}`:style===1?`${display(total)}-${display(fee)}=${owed}`:`${display(answer)}+${paid}=${display(total)}`,style===0?multiply(fee,100):style===1?subtract(total,fee):add(answer,paid),style===0?owed*percent:style===1?owed:total);
}

function turnAngle([num,den,style]){
 whole(num,den);requireThat([2,3,4,5,6,8,9,10,12].includes(den)&&num>=1&&num<=den,'Use a simple fraction of a turn.');const deg=360*num/den;
 requireThat(style!==2||(60*num)%den===0,'Use a whole number of minutes.');const minutes=60*num/den;
 const [text,answer,steps]=pick([
  [`How many degrees is ${num}/${den} of a full turn?`,String(deg),[step('A full turn is 360°.',`360^\\circ`),step(`Take ${num}/${den} of 360.`,`${frac(num,den)}\\times360=${deg}^\\circ`)]],
  [`What fraction of a full turn is ${deg}°? Write it in simplest form.`,tex(rational(deg,360)),[step('A full turn is 360°, so write the angle over 360.',`${frac(deg,360)}`),step('Write the fraction in simplest form.',`${frac(deg,360)}=${tex(rational(deg,360))}`)]],
  [`The minute hand of a clock moves ${minutes} minutes. How many degrees does it turn?`,String(6*minutes),[step('The minute hand turns 360° in 60 minutes, so it turns 6° each minute.',`360\\div60=6`),step('Multiply by the number of minutes.',`${minutes}\\times6=${6*minutes}^\\circ`)]]
 ],style);
 return checked(result(text,steps,answer),'Check with the other form.',style===1?`${tex(rational(deg,360))}\\times360=${deg}`:style===0?`${answer}\\div360=${tex(rational(deg,360))}`:`${answer}\\div6=${minutes}`,style===1?multiply(rational(deg,360),360):style===0?rational(Number(answer),360):Number(answer)/6,style===1?deg:style===0?rational(deg,360):minutes);
}

// Survey of three categories. style: 0 percent of A, 1 central angle of A in a circle graph, 2 total responses.
function surveyPercent([a,b,c,style]){
 whole(a,b,c);requireThat(a>=1&&b>=1&&c>=1&&a<=100&&b<=100&&c<=100,'Use counts from 1 to 100.');const total=a+b+c;
 const pct=rational(a*100,total),angle=rational(a*360,total);
 const [text,answer,steps]=pick([
  [`In a survey, ${a} students chose soccer, ${b} chose hockey and ${c} chose swimming. What percent of the students chose soccer?`,display(pct),[step('Find the total number of students.',`${a}+${b}+${c}=${total}`),step('Percent = part ÷ total × 100.',`${frac(a,total)}\\times100=${display(pct)}\\%`)]],
  [`In a survey, ${a} students chose soccer, ${b} chose hockey and ${c} chose swimming. In a circle graph, how many degrees is the sector for soccer?`,display(angle),[step('Find the total number of students.',`${a}+${b}+${c}=${total}`),step('A full circle is 360°. Angle = part ÷ total × 360°.',`${frac(a,total)}\\times360=${display(angle)}^\\circ`)]],
  [`In a survey, ${a} students chose soccer, ${b} chose hockey and ${c} chose swimming. How many students were surveyed?`,String(total),[step('“In all” means add the counts.',`${a}+${b}+${c}=${total}`)]]
 ],style);
 requireThat(style!==0||terminating(pct),'Use counts that give an exact percent.');requireThat(style!==1||terminating(angle),'Use counts that give an exact angle.');
 return checked(result(text,steps,answer),style===2?'Subtract two counts from the total to get the third.':'Work back to the count.',style===0?`${display(pct)}\\div100\\times${total}=${a}`:style===1?`${display(angle)}\\div360\\times${total}=${a}`:`${total}-${b}-${c}=${a}`,style===0?multiply(divide(pct,100),total):style===1?multiply(divide(angle,360),total):total-b-c,a);
}

export const extraVariantRules={
 'unit-fraction-story':unitFraction,
 'rational-pick':rationalPick,
 'fraction-divide-story':fractionDivide,
 'interval-count':intervalCount,
 'savings-goal':savingsGoal,
 'midpoint-decimal':midpointDecimal,
 'scientific-story':scientificStory,
 'sqrt-estimate':sqrtEstimate,
 'powers-of-ten':powersOfTen,
 'integer-product':integerProduct,
 'evaluate-signed':evaluateSigned,
 'sale-total':saleTotal,
 'debt-story':debtStory,
 'turn-angle':turnAngle,
 'survey-percent':surveyPercent
};
