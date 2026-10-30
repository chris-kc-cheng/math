import {lesson,step,checked,requireThat,rational,multiply,add,subtract,divide,tex,display} from './common.js';
import {scaledDecimal} from '../core/format.js';

// Second batch of question styles. Each rule takes a `style` index (one stem and key-word hint per style) and shows the
// working a textbook would: name the relationship, apply it, then check. All arithmetic is exact.
const fmt=n=>Number(n).toLocaleString('en-CA');
const signed=n=>n<0?`−${fmt(-n)}`:fmt(n);
// Textbook style: a negative second operand is bracketed, a positive one is not.
const second=n=>n<0?`(${signed(n)})`:signed(n);
const terminating=r=>{let d=Number(r.d);while(d%2===0)d/=2;while(d%5===0)d/=5;return d===1;};
const texInt=n=>n<0?`(${n})`:String(n);
const frac=(n,d)=>`\\frac{${n}}{${d}}`;
const gcdN=(a,b)=>b?gcdN(b,a%b):Math.abs(a);
const lcmN=(a,b)=>a/gcdN(a,b)*b;
const ordinal=n=>{const s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);};
const pick=(list,style)=>{requireThat(Number.isInteger(style)&&style>=0&&style<list.length,'Choose a supported question style.');return list[style];};
const whole=(...ns)=>requireThat(ns.every(n=>Number.isSafeInteger(n)),'Use whole numbers.');
const result=(text,steps,answer,extra={})=>lesson(text,steps,{answer,...extra});

function fractionOf([num,den,total,style,exact]){
 whole(num,den,total);requireThat(num>=1&&den>=2&&num<den&&total>=1,'Use a proper fraction and a positive whole.');requireThat(!exact||total%den===0,'Use a whole that the denominator divides exactly.');
 const [text,hint]=pick([
  [`What is ${num}/${den} of ${total}?`,'“Of” with a fraction means multiply.'],
  [`A class has ${total} students. ${num}/${den} of them walk to school. How many students walk?`,'“Of the students” means find a fraction of the whole.'],
  [`Find ${num}/${den} of ${total} centimetres.`,'“Find a fraction of” means multiply the fraction by the whole.'],
  [`A box holds ${total} crayons. ${num}/${den} of the crayons are red. How many crayons are red?`,'“Of the crayons” means find a fraction of the whole.'],
  [`Jade had $${total}. She spent ${num}/${den} of it. How many dollars did she spend?`,'“Spent a fraction of” means find that fraction of the whole.']
 ],style);
 const answer=rational(num*total,den),shown=display(answer),steps=[];
 if(total%den===0){const part=total/den;steps.push(step(`${hint} Split the whole into ${den} equal parts and find the size of one part.`,`${total}\\div${den}=${part}`),step(`Take ${num} of those parts.`,`${num}\\times${part}=${num*part}`));}
 else steps.push(step(`${hint} Multiply the fraction by the whole.`,`${frac(num,den)}\\times${total}=${frac(num*total,den)}`),step('Write the answer in simplest form.',`${frac(num*total,den)}=${shown}`));
 return checked(result(text,steps,shown),'Dividing the answer by the fraction should give the whole again.',`${shown}\\div${frac(num,den)}=${total}`,divide(answer,rational(num,den)),total);
}

function fractionStory([n1,d1,n2,d2,style]){
 whole(n1,d1,n2,d2);requireThat(d1>=2&&d2>=2&&n1>=1&&n2>=1&&n1<d1&&n2<d2,'Use proper fractions.');
 const [text,hint,op]=pick([
  [`Ava ate ${n1}/${d1} of a pizza at lunch and ${n2}/${d2} of it at dinner. How much of the pizza did she eat altogether?`,'“Altogether” means add.','+'],
  [`A jug holds ${n1}/${d1} of a litre of juice. ${n2}/${d2} of a litre is poured out. How much juice is left?`,'“Poured out” and “left” mean subtract.','-'],
  [`What is ${n1}/${d1} + ${n2}/${d2}?`,'The sign tells us to add.','+'],
  [`Find the difference between ${n1}/${d1} and ${n2}/${d2}.`,'“Difference” means subtract the smaller from the larger.','d'],
  [`A recipe uses ${n1}/${d1} of a cup of milk and ${n2}/${d2} of a cup of water. How much liquid is that in all?`,'“In all” means add.','+'],
  [`How much more is ${n1}/${d1} than ${n2}/${d2}?`,'“How much more” means subtract.','-']
 ],style);
 requireThat(op==='+'||n1*d2!==n2*d1,'Use two different fractions.');requireThat(op!=='-'||n1*d2>n2*d1,'The first fraction must be larger.');
 const swap=op==='d'&&n1*d2<n2*d1,[l1,d,l2,e]=swap?[n2,d2,n1,d1]:[n1,d1,n2,d2];
 const left=rational(l1,d),right=rational(l2,e),sub=op!=='+',sign=sub?'-':'+',lcd=lcmN(d,e),p=l1*lcd/d,q=l2*lcd/e,top=sub?p-q:p+q,answer=sub?subtract(left,right):add(left,right);
 const steps=d===e?[step(`${hint} The denominators match, so ${sub?'subtract':'add'} the numerators.`,`${frac(l1,d)}${sign}${frac(l2,d)}=${frac(top,d)}`)]
  :[step(`${hint} The denominators differ, so use the common denominator ${lcd}.`,`${frac(l1,d)}=${frac(p,lcd)},\\quad${frac(l2,e)}=${frac(q,lcd)}`),step(sub?'Subtract the numerators and keep the denominator.':'Add the numerators and keep the denominator.',`${frac(p,lcd)}${sign}${frac(q,lcd)}=${frac(top,lcd)}`)];
 if(gcdN(top,lcd)>1)steps.push(step('Write the answer in simplest form.',`${frac(top,lcd)}=${tex(answer)}`));
 const check=sub?['Add the smaller fraction back to the answer.',`${tex(answer)}+${tex(right)}=${tex(left)}`,add(answer,right),left]:['Subtract one fraction from the sum to get the other.',`${tex(answer)}-${tex(right)}=${tex(left)}`,subtract(answer,right),left];
 return checked(result(text,steps,tex(answer)),...check);
}

function decimalStory([first,second,places,style]){
 whole(first,second,places);requireThat([1,2,3].includes(places)&&first>0&&second>0,'Use decimals with 1 to 3 places.');
 const x=scaledDecimal(first,places),y=scaledDecimal(second,places);
 const [text,hint,op]=pick([
  [`Sam buys a pen for $${x} and a notebook for $${y}. How many dollars does Sam spend in all?`,'“In all” means add.','+'],
  [`A ribbon is ${x} m long. ${y} m is cut off. How many metres long is the piece that is left?`,'“Cut off” and “left” mean subtract.','-'],
  [`Find the sum of ${x} and ${y}.`,'“Sum” means add.','+'],
  [`Find the difference between ${x} and ${y}.`,'“Difference” means subtract the smaller from the larger.','d'],
  [`A tank holds ${x} L of water. ${y} L more is poured in. How many litres are in the tank now?`,'“More is poured in” means add.','+']
 ],style);
 requireThat(style!==0||places===2,'Dollar amounts use two decimal places.');requireThat(op!=='-'||first>=second,'The first number must not be smaller than the second.');requireThat(op!=='d'||first!==second,'Use two different numbers.');
 const sub=op!=='+',high=op==='d'?Math.max(first,second):first,low=op==='d'?Math.min(first,second):second,value=sub?high-low:first+second;
 const sign=sub?'-':'+',a=scaledDecimal(sub?high:first,places),b=scaledDecimal(sub?low:second,places),r=scaledDecimal(value,places),name=['tenths','hundredths','thousandths'][places-1];
 return checked(result(text,[step(`${hint} Line up the decimal points so that ${name} match ${name}.`,`${a}${sign}${b}`),step(sub?'Subtract each place from right to left, regrouping when needed.':'Add each place from right to left, regrouping when needed.',`${a}${sign}${b}=${r}`)],r),sub?'Add the smaller number back to the answer.':'Subtract one number from the total to get the other.',sub?`${r}+${b}=${a}`:`${r}-${b}=${a}`,sub?value+low:value-second,sub?high:first);
}

function percentStory([percent,amount,style]){
 whole(percent,amount);requireThat(percent>=1&&percent<=100&&amount>=1,'Use a percent from 1 to 100.');
 const [text,hint,kind]=pick([
  [`What is ${percent}% of ${fmt(amount)}?`,'“Of” with a percent means multiply by that percent.','part'],
  [`A jacket costs $${fmt(amount)} and is ${percent}% off. How many dollars is the discount?`,'The discount is the percent of the price.','part'],
  [`A jacket costs $${fmt(amount)} and is ${percent}% off. What is the sale price in dollars?`,'Find the discount, then subtract it from the price.','less'],
  [`A restaurant bill is $${fmt(amount)}. A ${percent}% tip is added. How many dollars is the tip?`,'The tip is the percent of the bill.','part'],
  [`A town has ${fmt(amount)} people. ${percent}% of them are children. How many children live in the town?`,'“Percent of the people” means find that percent of the whole.','part'],
  [`A bike costs $${fmt(amount)}. The price goes up by ${percent}%. What is the new price in dollars?`,'Find the increase, then add it to the price.','more']
 ],style);
 requireThat(style!==3||percent<=30,'A tip is a small percent.');requireThat(![1,2].includes(style)||percent<=75,'A discount is at most 75%.');
 const part=rational(percent*amount,100),answer=kind==='less'?subtract(amount,part):kind==='more'?add(amount,part):part;
 const steps=[step(`${hint} ${percent}% means ${percent} out of 100.`,`${percent}\\%=${frac(percent,100)}`),step(`Multiply the amount by ${percent}/100.`,`${frac(percent,100)}\\times${amount}=${display(part)}`)];
 if(kind!=='part')steps.push(step(kind==='less'?'Subtract the discount from the price.':'Add the increase to the price.',kind==='less'?`${amount}-${display(part)}=${display(answer)}`:`${amount}+${display(part)}=${display(answer)}`));
 return checked(result(text,steps,display(answer)),'The percent part times 100 should equal the percent times the amount.',`${display(part)}\\times100=${percent}\\times${amount}`,multiply(part,100),percent*amount);
}

function unitRate([quantity,total,quantity2,style]){
 whole(quantity,total,quantity2);requireThat(quantity>=2&&total>=1&&quantity2>=2&&quantity2!==quantity,'Use two different quantities of 2 or more.');
 const [text,hint,scaled]=pick([
  [`${quantity} pens cost $${fmt(total)}. What is the cost of one pen in dollars?`,'“One” unit means find the unit rate: divide the total by the number of units.',false],
  [`${quantity} pens cost $${fmt(total)}. At the same price, what do ${quantity2} pens cost in dollars?`,'First find the unit rate, then multiply by the new number of units.',true],
  [`A cyclist rides ${fmt(total)} km in ${quantity} hours at a steady speed. How many kilometres does the cyclist ride in 1 hour?`,'“In 1 hour” asks for the unit rate: divide the distance by the time.',false],
  [`A printer prints ${fmt(total)} pages in ${quantity} minutes. At the same rate, how many pages does it print in ${quantity2} minutes?`,'First find pages per minute, then multiply by the new number of minutes.',true],
  [`${quantity} kg of apples cost $${fmt(total)}. What is the price of 1 kg in dollars?`,'“Price of 1 kg” is the unit rate: divide the cost by the mass.',false],
  [`A tap fills ${fmt(total)} L in ${quantity} minutes. How many litres does it fill per minute?`,'“Per minute” is the unit rate: divide the amount by the time.',false]
 ],style);
 const unit=rational(total,quantity);requireThat(terminating(unit),'Use a total that divides into an exact decimal.');const answer=scaled?multiply(unit,quantity2):unit,steps=[step(hint,`${total}\\div${quantity}=${display(unit)}`)];
 if(scaled)steps.push(step(`Multiply the unit rate by ${quantity2}.`,`${display(unit)}\\times${quantity2}=${display(answer)}`));
 return checked(result(text,steps,display(answer)),'Multiply the unit rate by the original quantity to get back to the total.',`${display(unit)}\\times${quantity}=${total}`,multiply(unit,quantity),total);
}

// Solve or evaluate m·n + b; for the "solve" styles the answer is n, for the "evaluate" styles it is the value.
function linearStory([m,b,x,style]){
 whole(m,b,x);requireThat(m>=1&&b>=0&&x>=0,'Use whole numbers for a multiply-then-add rule.');const value=m*x+b;
 const [text,kind]=pick([
  [`I think of a number, multiply it by ${m}, then add ${b}. The result is ${value}. What is my number?`,'solve'],
  [`A taxi charges $${b} to start and $${m} for each kilometre. A ride cost $${value}. How many kilometres was the ride?`,'solve'],
  [`Evaluate ${m}n + ${b} when n = ${x}.`,'eval'],
  [`A gym charges a $${b} sign-up fee plus $${m} each month. What is the total cost, in dollars, after ${x} months?`,'eval'],
  [`Solve ${m}n + ${b} = ${value}.`,'solve'],
  [`If y = ${m}x + ${b}, find y when x = ${x}.`,'eval']
 ],style);
 if(kind==='solve'){
  const steps=[step('Write an equation. Let n stand for the unknown number.',`${m}n+${b}=${value}`),step(`Undo the addition: subtract ${b} from both sides.`,`${m}n=${value}-${b}=${value-b}`)];
  steps.push(m===1?step('The unknown is alone.',`n=${x}`):step(`Undo the multiplication: divide both sides by ${m}.`,`n=${value-b}\\div${m}=${x}`));
  return checked(result(text,steps,String(x)),'Put the answer back into the rule.',`${m}\\times${x}+${b}=${value}`,m*x+b,value);
 }
 return checked(result(text,[step(`Replace the letter with ${x}.`,`${m}\\times${x}+${b}`),step('Multiply first, then add.',`${m*x}+${b}=${value}`)],String(value)),'Work the rule a second way: start with the added amount.',`${b}+${m}\\times${x}=${value}`,b+m*x,value);
}

function patternTerm([first,diff,position,style]){
 whole(first,diff,position);requireThat(diff>=1&&first>=0&&position>=5&&position<=100,'Use a growing pattern and a later term of 5 or more.');
 const t=k=>first+(k-1)*diff,list=[t(1),t(2),t(3),t(4)].join(', ');
 const [text,hint]=pick([
  [`Find the next term in the pattern ${list}, …`,'Find how much the pattern changes from one term to the next.'],
  [`A pattern starts at ${first} and increases by ${diff} each time. What is the ${ordinal(position)} term?`,'Each term is the term before it plus the same amount.'],
  [`In the pattern ${list}, …, which term number has the value ${t(position)}?`,'Count how many steps of the common difference it takes to reach the value.'],
  [`Find the missing term in the pattern ${t(1)}, ${t(2)}, ___, ${t(4)}, ${t(5)}.`,'The missing term is one step of the common difference after the term before it.'],
  [`Anna builds rows of blocks. Row 1 has ${first} blocks and each new row has ${diff} more blocks than the row before. How many blocks are in row ${position}?`,'Each row adds the same number of blocks to the row before.']
 ],style);
 const k=[5,position,0,3,position][style],answer=style===2?position:t(k);
 const work=[step('Add the difference to the last term shown.',`${t(4)}+${diff}=${t(5)}`),step(`Start from ${first} and add ${diff} a total of ${position-1} times.`,`${first}+${position-1}\\times${diff}=${t(position)}`),
  step('Subtract the first term, divide by the difference, then add 1 for the first term.',`(${t(position)}-${first})\\div${diff}+1=${position}`),step('Add the difference to the second term.',`${t(2)}+${diff}=${t(3)}`),
  step(`Row ${position} is ${position-1} rows after row 1.`,`${first}+${position-1}\\times${diff}=${t(position)}`)][style];
 return checked(result(text,[step(hint,`${t(2)}-${t(1)}=${diff}`),work],String(answer)),'Check the rule: first term + (term number − 1) × difference.',style===2?`${first}+(${answer}-1)\\times${diff}=${t(position)}`:`${first}+(${k}-1)\\times${diff}=${answer}`,style===2?first+(answer-1)*diff:first+(k-1)*diff,style===2?t(position):answer);
}

function rectangleMeasure([a,b,style]){
 whole(a,b);requireThat(a>=1&&b>=1,'Use positive lengths.');
 const area=a*b,perimeter=2*(a+b);
 const [text,steps,answer]=pick([
  [`A rectangle is ${a} cm long and ${b} cm wide. What is its area in square centimetres?`,[step('Area of a rectangle = length × width.',`A=${a}\\times${b}=${area}\\ \\text{cm}^2`)],area],
  [`A rectangle is ${a} cm long and ${b} cm wide. What is its perimeter in centimetres?`,[step('Perimeter is the distance around: 2 × (length + width).',`P=2\\times(${a}+${b})=${perimeter}\\ \\text{cm}`)],perimeter],
  [`A square has sides of ${a} cm. What is its perimeter in centimetres?`,[step('A square has 4 equal sides.',`P=4\\times${a}=${4*a}\\ \\text{cm}`)],4*a],
  [`A square has sides of ${a} cm. What is its area in square centimetres?`,[step('Area of a square = side × side.',`A=${a}\\times${a}=${a*a}\\ \\text{cm}^2`)],a*a],
  [`A rectangle has an area of ${area} cm² and a length of ${a} cm. What is its width in centimetres?`,[step('Area = length × width, so width = area ÷ length.',`w=${area}\\div${a}=${b}\\ \\text{cm}`)],b],
  [`A rectangle has a perimeter of ${perimeter} cm and a length of ${a} cm. What is its width in centimetres?`,[step('The length and width together are half the perimeter.',`${perimeter}\\div2=${a+b}`),step('Subtract the known length.',`w=${a+b}-${a}=${b}\\ \\text{cm}`)],b]
 ],style);
 const back=[[`${answer}\\div${a}=${b}`,answer/a,b],[`${answer}\\div2-${a}=${b}`,answer/2-a,b],[`${answer}\\div4=${a}`,answer/4,a],[`\\sqrt{${answer}}=${a}`,Math.sqrt(answer),a],[`${a}\\times${answer}=${area}`,a*answer,area],[`2\\times(${a}+${answer})=${perimeter}`,2*(a+answer),perimeter]][style];
 return checked(result(text,steps,String(answer)),'Check by working backwards.',...back);
}

function areaFormula([base,height,style]){
 whole(base,height);requireThat(base>=1&&height>=1,'Use positive lengths.');
 const rect=base*height,tri=rect/2;
 requireThat(style===1||style===2||style===4||rect%2===0,'Use a base and height whose product is even for triangles.');
 const [text,steps,answer,verify]=pick([
  [`A triangle has a base of ${base} cm and a height of ${height} cm. What is its area in square centimetres?`,[step('A triangle is half of a parallelogram with the same base and height.',`A=\\frac{${base}\\times${height}}{2}=${tri}\\ \\text{cm}^2`)],tri,[`2\\times${tri}=${rect}`,2*tri,rect]],
  [`A parallelogram has a base of ${base} cm and a height of ${height} cm. What is its area in square centimetres?`,[step('Area of a parallelogram = base × height.',`A=${base}\\times${height}=${rect}\\ \\text{cm}^2`)],rect,[`${rect}\\div${height}=${base}`,rect/height,base]],
  [`A parallelogram has an area of ${rect} cm² and a base of ${base} cm. What is its height in centimetres?`,[step('Area = base × height, so height = area ÷ base.',`h=${rect}\\div${base}=${height}\\ \\text{cm}`)],height,[`${base}\\times${height}=${rect}`,base*height,rect]],
  [`A triangle has an area of ${tri} cm² and a base of ${base} cm. What is its height in centimetres?`,[step('Double the area to get the matching parallelogram.',`2\\times${tri}=${rect}`),step('Divide by the base.',`h=${rect}\\div${base}=${height}\\ \\text{cm}`)],height,[`\\frac{${base}\\times${height}}{2}=${tri}`,base*height/2,tri]],
  [`Two identical triangles, each with a base of ${base} cm and a height of ${height} cm, are put together to make a parallelogram. What is the area of the parallelogram in square centimetres?`,[step('Two identical triangles make a parallelogram with the same base and height.',`A=${base}\\times${height}=${rect}\\ \\text{cm}^2`)],rect,[`${rect}\\div${height}=${base}`,rect/height,base]]
 ],style);
 return checked(result(text,steps,String(answer)),'Check with the formula.',...verify);
}

// Styles 0-5 change to a smaller unit (multiply); styles 6-10 change to a larger unit (divide).
const conversions=[['m','cm',100],['km','m',1000],['kg','g',1000],['L','mL',1000],['cm','mm',10],['h','min',60],['cm','m',-100],['g','kg',-1000],['mL','L',-1000],['mm','cm',-10],['min','h',-60]];
function unitConvert([number,style]){
 whole(number);requireThat(number>=1,'Use a positive amount.');const [from,to,signedFactor]=pick(conversions,style),factor=Math.abs(signedFactor),larger=signedFactor>0;
 requireThat(style!==10||number%6===0,'Use whole minutes that give a terminating decimal.');
 const answer=larger?rational(number*factor,1):rational(number,factor),a=display(answer);
 const names={m:'metres',cm:'centimetres',mm:'millimetres',km:'kilometres',kg:'kilograms',g:'grams',L:'litres',mL:'millilitres',h:'hours',min:'minutes'},nouns={m:'length',cm:'length',mm:'length',km:'length',kg:'mass',g:'mass',L:'capacity',mL:'capacity',h:'time',min:'time'};
 const text=number%2?`Convert ${fmt(number)} ${names[from]} to ${names[to]}.`:`A ${nouns[from]} is ${fmt(number)} ${names[from]}. How many ${names[to]} is that?`;
 const unit=larger?`1\\text{ ${from}}=${factor}\\text{ ${to}}`:`${factor}\\text{ ${to}}=1\\text{ ${from}}`;
 return checked(result(text,[step(`Recall the relationship between the units. Changing to ${larger?'a smaller':'a larger'} unit means ${larger?'multiplying':'dividing'}.`,unit),step(larger?`Multiply by ${factor}.`:`Divide by ${factor}.`,larger?`${number}\\times${factor}=${a}`:`${number}\\div${factor}=${a}`)],a),larger?'Divide the answer by the factor to return to the start.':'Multiply the answer by the factor to return to the start.',larger?`${a}\\div${factor}=${number}`:`${a}\\times${factor}=${number}`,larger?divide(answer,factor):multiply(answer,factor),number);
}

function integerStory([a,b,style]){
 whole(a,b);requireThat(Math.abs(a)<=1000&&Math.abs(b)<=1000,'Keep the integers small.');
 const [text,kind]=pick([
  [`At dawn the temperature was ${signed(a)}°C. By noon it had risen by ${fmt(Math.abs(b))}°C. What is the temperature at noon, in °C?`,'rise'],
  [`At dawn the temperature was ${signed(a)}°C. By noon it had dropped by ${fmt(Math.abs(b))}°C. What is the temperature at noon, in °C?`,'drop'],
  [`Calculate ${signed(a)} + ${second(b)}.`,'add'],
  [`Calculate ${signed(a)} − ${second(b)}.`,'sub'],
  [`A bank account balance is ${signed(a)} dollars. A withdrawal of $${fmt(Math.abs(b))} is made. What is the new balance, in dollars?`,'drop'],
  [`How many degrees warmer is ${signed(a)}°C than ${signed(b)}°C?`,'sub']
 ],style);
 requireThat(!['rise','drop'].includes(kind)||b>=1,'A change in a story is a positive amount.');requireThat(style!==5||a>b,'The first temperature must be warmer.');
 const adding=kind==='rise'||kind==='add',answer=adding?a+b:a-b,opposite=texInt(-b);
 const steps=adding?[step(kind==='rise'?'A rise moves up the number line: add.':'Adding a positive moves right on the number line and adding a negative moves left.',`${texInt(a)}+${texInt(b)}=${answer}`)]
  :[step(kind==='drop'?'A drop moves down the number line: subtract.':'Subtracting a number is the same as adding its opposite.',`${texInt(a)}-${texInt(b)}=${texInt(a)}+${opposite}`),step('Now add the signed numbers.',`${texInt(a)}+${opposite}=${answer}`)];
 return checked(result(text,steps,String(answer)),adding?'Subtract the second number from the answer to get back to the first.':'Add the second number to the answer to get back to the first.',adding?`${answer}-${texInt(b)}=${a}`:`${answer}+${texInt(b)}=${a}`,adding?answer-b:answer+b,a);
}

function powerValue([base,exponent,style]){
 whole(base,exponent);requireThat(base>=2&&exponent>=2&&base**exponent<=1e9,'Keep the power within one billion.');
 const value=base**exponent,product=Array(exponent).fill(base).join('\\times');
 requireThat(![2,3,4].includes(style)||exponent===2,'Squares use an exponent of 2.');requireThat(style!==5||exponent===3,'A cube uses an exponent of 3.');
 const [text,steps,answer]=pick([
  [`Evaluate ${base}^${exponent}.`,[step(`The exponent ${exponent} tells how many times the base ${base} is used as a factor.`,`${base}^{${exponent}}=${product}`),step('Multiply.',`${product}=${value}`)],value],
  [`Write ${Array(exponent).fill(base).join(' × ')} as a power and then evaluate it.`,[step(`${base} is used ${exponent} times, so write it with exponent ${exponent}.`,`${product}=${base}^{${exponent}}`),step('Multiply to evaluate.',`${base}^{${exponent}}=${value}`)],value],
  [`What is ${base} squared?`,[step('Squared means multiply the number by itself.',`${base}^2=${base}\\times${base}=${value}`)],value],
  [`What is the square root of ${fmt(value)}?`,[step(`Find the number that multiplied by itself gives ${value}.`,`${base}\\times${base}=${value}`),step('That number is the square root.',`\\sqrt{${value}}=${base}`)],base],
  [`A square has sides of ${base} cm. What is its area in square centimetres?`,[step('Area of a square = side × side.',`A=${base}^2=${base}\\times${base}=${value}\\ \\text{cm}^2`)],value],
  [`A cube has edges of ${base} cm. What is its volume in cubic centimetres?`,[step('Volume of a cube = edge × edge × edge.',`V=${base}^3=${product}=${value}\\ \\text{cm}^3`)],value]
 ],style);
 return checked(result(text,steps,String(answer)),style===3?'Square the answer to return to the number.':'Evaluate the power a second way, one factor at a time.',style===3?`${base}^2=${value}`:`${base}^{${exponent}}=${value}`,style===3?base*base:Array(exponent).fill(base).reduce((x,y)=>x*y,1),value);
}

function angleRelation([a,b,style]){
 whole(a,b);requireThat(a>=1&&b>=1,'Use positive angles.');
 requireThat([a+b<180,a<90,a<180,a+b<180,a+b<360,a<180][style]??false,'Use angles that fit the diagram.');
 const [text,steps,answer]=pick([
  [`Two angles of a triangle are ${a}° and ${b}°. What is the third angle, in degrees?`,[step('The angles in a triangle add to 180°.',`${a}+${b}=${a+b}`),step('Subtract from 180°.',`180-${a+b}=${180-a-b}`)],180-a-b],
  [`Two angles are complementary. One is ${a}°. What is the other angle, in degrees?`,[step('Complementary angles add to 90°.',`90-${a}=${90-a}`)],90-a],
  [`Two angles are supplementary. One is ${a}°. What is the other angle, in degrees?`,[step('Supplementary angles add to 180°.',`180-${a}=${180-a}`)],180-a],
  [`Three angles lie along a straight line. Two of them are ${a}° and ${b}°. What is the third angle, in degrees?`,[step('Angles on a straight line add to 180°.',`${a}+${b}=${a+b}`),step('Subtract from 180°.',`180-${a+b}=${180-a-b}`)],180-a-b],
  [`Three angles meet at a point and fill the full turn. Two of them are ${a}° and ${b}°. What is the third angle, in degrees?`,[step('Angles around a point add to 360°.',`${a}+${b}=${a+b}`),step('Subtract from 360°.',`360-${a+b}=${360-a-b}`)],360-a-b],
  [`Two lines cross. One of the angles measures ${a}°. What is the angle opposite it, in degrees?`,[step('Opposite angles where two lines cross are equal.',`\\text{opposite angle}=${a}^\\circ`)],a]
 ],style);
 const total=[180,90,180,180,360,0][style],one=style===1||style===2;
 return checked(result(text,steps,String(answer)),style===5?'Opposite angles are equal.':'Add all the angles: they should give the total.',style===5?`${answer}=${a}`:one?`${a}+${answer}=${total}`:`${a}+${b}+${answer}=${total}`,style===5?answer:one?a+answer:a+b+answer,style===5?a:total);
}

function probabilityWord([favourable,total,style]){
 whole(favourable,total);requireThat(total>=2&&favourable>=1&&favourable<=total,'Use an event count within the total.');
 const [text,hint]=pick([
  [`A bag holds ${total} counters, and ${favourable} of them are red. One counter is taken without looking. What is the probability that it is red?`,'Each counter is equally likely to be taken.'],
  [`A spinner has ${total} equal sections and ${favourable} of them are shaded. What is the probability that the spinner lands on a shaded section?`,'The sections are equal, so each is equally likely.'],
  [`You hold ${favourable} of the ${total} raffle tickets. One ticket is drawn at random. What is the probability that you win?`,'Each ticket is equally likely to be drawn.'],
  [`A class has ${total} students and ${favourable} of them play soccer. One student is chosen at random. What is the probability that the student plays soccer?`,'Each student is equally likely to be chosen.'],
  [`A jar has ${total} marbles and ${favourable} of them are green. One marble is picked without looking. What is the probability that it is green?`,'Each marble is equally likely to be picked.'],
  [`A fair six-sided die is rolled. What is the probability of rolling a number less than ${favourable+1}?`,'A fair die has 6 equally likely outcomes.']
 ],style);
 requireThat(style!==5||(total===6&&favourable<=5),'A fair die has six outcomes.');
 const p=rational(favourable,total);
 return checked(result(text,[step(`${hint} Probability = favourable outcomes ÷ all possible outcomes.`,`P=${frac(favourable,total)}`),step('Write the fraction in simplest form.',`${frac(favourable,total)}=${tex(p)}`)],tex(p)),'Cross-multiply to check the fractions are equal.',`${favourable}\\times${p.d}=${p.n}\\times${total}`,multiply(favourable,p.d),multiply(p.n,total));
}

function meanMissing([a,b,c,d,mean]){
 whole(a,b,c,d,mean);requireThat(mean>=1&&[a,b,c,d].every(n=>n>=0),'Use whole-number data.');const known=a+b+c+d,missing=5*mean-known;requireThat(missing>=0,'The mean must be reachable.');
 return checked(result(`The mean of five numbers is ${mean}. Four of the numbers are ${a}, ${b}, ${c} and ${d}. What is the fifth number?`,[step('Mean = total ÷ number of values, so the total of five numbers is 5 × the mean.',`5\\times${mean}=${5*mean}`),step('Subtract the four known numbers from the total.',`${5*mean}-(${a}+${b}+${c}+${d})=${5*mean}-${known}=${missing}`)],String(missing)),'Find the mean of all five numbers.',`(${known}+${missing})\\div5=${mean}`,rational(known+missing,5),mean);
}

export const moreVariantRules={
 'fraction-of-quantity':fractionOf,
 'fraction-story':fractionStory,
 'fraction-story-like':([n1,n2,d,style])=>fractionStory([n1,d,n2,d,style]),
 'decimal-story':decimalStory,
 'percent-story':percentStory,
 'unit-rate':unitRate,
 'linear-story':linearStory,
 'pattern-term':patternTerm,
 'rectangle-measure-variants':rectangleMeasure,
 'area-formula':areaFormula,
 'unit-convert':unitConvert,
 'integer-story':integerStory,
 'power-value':powerValue,
 'angle-relation':angleRelation,
 'probability-word':probabilityWord,
 'mean-missing':meanMissing
};
