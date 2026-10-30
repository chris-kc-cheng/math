import {lesson,step,checked,requireThat,rational,multiply,add,subtract,divide,tex,display} from './common.js';
import {bars,table} from '../lesson.js';

// Fourth batch: reading data displays, probability experiments, measurement of circles and solids, polygons, coordinates,
// scale, ratio sharing and how a mean changes. Conventions as in variants.js: a `style` index picks the stem, the worked
// solution names the idea then calculates, and the answer is exact and checked a second way. π is taken as 3.14 where used.
const fmt=n=>Number(n).toLocaleString('en-CA');
const frac=(n,d)=>`\\frac{${n}}{${d}}`;
const gcdN=(a,b)=>b?gcdN(b,a%b):Math.abs(a);
const pick=(list,style)=>{requireThat(Number.isInteger(style)&&style>=0&&style<list.length,'Choose a supported question style.');return list[style];};
const whole=(...ns)=>requireThat(ns.every(n=>Number.isSafeInteger(n)),'Use whole numbers.');
const result=(text,steps,answer,visual)=>({...lesson(text,steps,{answer}),...(visual?{visual}:{})});
const terminating=r=>{let d=Number(r.d);while(d%2===0)d/=2;while(d%5===0)d/=5;return d===1;};
const PI='3.14',pi=rational(314,100);

// form: 0 bar graph, 1 frequency table. The four activities are fixed so every question reads the same way.
const ACTIVITIES=['Soccer','Hockey','Swimming','Dance'];
function chartRead([a,b,c,d,style,form]){
 whole(a,b,c,d,style,form);const counts=[a,b,c,d];requireThat(counts.every(n=>n>=1&&n<=100)&&[0,1].includes(form),'Use counts from 1 to 100.');
 const total=a+b+c+d,high=Math.max(...counts),low=Math.min(...counts),mean=rational(total,4);
 requireThat(style!==0||counts.filter(n=>n===high).length===1,'The most popular activity must be clear.');requireThat(style!==2||a>b,'Soccer must have more than Hockey.');requireThat(style!==3||terminating(mean),'Use a mean that is an exact decimal.');requireThat(style!==5||high!==low,'Use different counts.');
 const [text,answer,steps]=pick([
  [`The ${form?'table':'graph'} shows how many students chose each activity. How many students chose the most popular activity?`,String(high),[step('Find the greatest value in the data.',counts.join(',\\ ')),step('That is the most popular activity.',`\\max=${high}`)]],
  [`The ${form?'table':'graph'} shows how many students chose each activity. How many students are there in all?`,String(total),[step('“In all” means add the counts for every activity.',`${a}+${b}+${c}+${d}=${total}`)]],
  [`The ${form?'table':'graph'} shows how many students chose each activity. How many more students chose Soccer than Hockey?`,String(a-b),[step('Read the Soccer and Hockey values.',`\\text{Soccer}=${a},\\quad\\text{Hockey}=${b}`),step('“How many more” means subtract.',`${a}-${b}=${a-b}`)]],
  [`The ${form?'table':'graph'} shows how many students chose each activity. What is the mean number of students per activity?`,display(mean),[step('Add all the values.',`${a}+${b}+${c}+${d}=${total}`),step('Divide by the number of activities, 4.',`${total}\\div4=${display(mean)}`)]],
  [`The ${form?'table':'graph'} shows how many students chose each activity. What is the range of the data?`,String(high-low),[step('Find the greatest and least values.',`\\text{greatest}=${high},\\quad\\text{least}=${low}`),step('Range = greatest − least.',`${high}-${low}=${high-low}`)]],
  [`The ${form?'table':'graph'} shows how many students chose each activity. What fraction of the students chose Soccer? Write it in simplest form.`,tex(rational(a,total)),[step('Fraction = part ÷ total. First find the total.',`${a+b+c+d}`),step('Write the fraction in simplest form.',`${frac(a,total)}=${tex(rational(a,total))}`)]]
 ],style);
 const visual=form?table(['Activity','Students'],ACTIVITIES.map((n,i)=>[n,counts[i]]),'Activity chosen by students'):bars(ACTIVITIES,[{name:'Students',values:counts}],'Activity chosen by students','students');
 const back=[[`${high}\\in\\{${counts.join(',')}\\}`,1,1],[`${total}-${b}-${c}-${d}=${a}`,total-b-c-d,a],[`${a-b}+${b}=${a}`,a-b+b,a],[`${display(mean)}\\times4=${total}`,multiply(mean,4),total],[`${low}+${high-low}=${high}`,low+high-low,high],[`${tex(rational(a,total))}\\times${total}=${a}`,multiply(rational(a,total),total),a]][style];
 return checked(result(text,steps,answer,visual),'Check the answer against the data.',...back);
}

// style: 0 experimental probability, 1 as a percent, 2 how many did not happen, 3 prediction for 100 more tries
function experimentalProbability([successes,trials,style]){
 whole(successes,trials);requireThat(trials>=5&&successes>=1&&successes<trials,'Use a result that happened some of the time.');const p=rational(successes,trials);
 const [text,answer,steps]=pick([
  [`A coin is tossed ${trials} times and lands heads ${successes} times. What is the experimental probability of heads, as a fraction in simplest form?`,tex(p),[step('Experimental probability = number of times it happened ÷ number of trials.',`P=${frac(successes,trials)}`),step('Write the fraction in simplest form.',`${frac(successes,trials)}=${tex(p)}`)]],
  [`A spinner is spun ${trials} times and lands on red ${successes} times. What is the experimental probability of red, as a percent?`,display(multiply(p,100)),[step('Experimental probability = number of times it happened ÷ number of trials.',`P=${frac(successes,trials)}`),step('Multiply by 100 to write it as a percent.',`${frac(successes,trials)}\\times100=${display(multiply(p,100))}\\%`)]],
  [`A coin is tossed ${trials} times and lands heads ${successes} times. How many times does it land tails?`,String(trials-successes),[step('Every toss is heads or tails, so tails = trials − heads.',`${trials}-${successes}=${trials-successes}`)]],
  [`In a test, a die lands on a six ${successes} times in ${trials} rolls. At this rate, how many sixes would you expect in 100 rolls?`,display(multiply(p,100)),[step('Find the experimental probability.',`P=${frac(successes,trials)}=${tex(p)}`),step('Multiply by the number of rolls.',`${tex(p)}\\times100=${display(multiply(p,100))}`)]]
 ],style);
 requireThat(style!==1&&style!==3||terminating(multiply(p,100)),'Use a result that gives an exact decimal.');
 return checked(result(text,steps,answer),style===2?'Heads plus tails should equal the number of tosses.':'Multiply the answer by the number of trials to return to the count.',style===2?`${successes}+${trials-successes}=${trials}`:style===0?`${tex(p)}\\times${trials}=${successes}`:style===1?`${display(multiply(p,100))}\\%\\times${trials}\\div100=${successes}`:`${display(multiply(p,100))}\\div100\\times${trials}=${successes}`,style===2?successes+trials-successes:style===0?multiply(p,trials):style===1?multiply(divide(multiply(p,100),100),trials):multiply(divide(multiply(p,100),100),trials),style===2?trials:successes);
}

function sampleSpace([a,b,style]){
 whole(a,b);requireThat(a>=2&&b>=2&&a<=12&&b<=12,'Use two sets of 2 to 12 choices.');
 const [text,answer,hint]=pick([
  [`A spinner has ${a} equal sections and a fair coin is tossed. How many different outcomes are possible in all?`,a*2,`${a} spinner results, each with 2 coin results.`],
  [`A shop sells ${a} kinds of shirts and ${b} kinds of pants. How many different outfits of one shirt and one pair of pants can you make?`,a*b,`Each of the ${a} shirts can go with each of the ${b} pants.`],
  [`A lunch special has ${a} choices of sandwich and ${b} choices of drink. How many different meals can you order?`,a*b,`Each sandwich can go with each drink.`],
  [`Two spinners are spun. The first has ${a} equal sections and the second has ${b}. How many different outcomes are possible?`,a*b,`Each result of the first spinner can happen with each result of the second.`],
  [`Two spinners are spun. The first has ${a} equal sections and the second has ${b}. What is the probability of getting one particular pair of results? Write a fraction.`,`\\frac{1}{${a*b}}`,`There are ${a}×${b} equally likely outcomes and 1 favourable outcome.`]
 ],style);
 const outcomes=style===0?a*2:a*b;
 const steps=[step(`Use the multiplication principle: multiply the number of choices. ${hint}`,style===0?`${a}\\times2=${a*2}`:`${a}\\times${b}=${a*b}`)];
 if(style===4)steps.push(step('Probability = favourable ÷ possible.',`P=${frac(1,a*b)}`));
 return checked(result(text,steps,String(answer)),style===4?'The probabilities of all the outcomes add to 1.':'Divide by one number of choices to get the other.',style===4?`${a*b}\\times${frac(1,a*b)}=1`:style===0?`${outcomes}\\div2=${a}`:`${outcomes}\\div${a}=${b}`,style===4?rational(1,1):style===0?outcomes/2:outcomes/a,style===4?1:style===0?a:b);
}

// radius r; π is 3.14. Styles 6 and 7 start from the circumference.
function circleStory([r,style]){
 whole(r);requireThat(r>=1&&r<=50,'Use a radius from 1 to 50.');const d=2*r;
 const C=multiply(pi,d),A=multiply(multiply(pi,r),r);
 const [text,answer,steps]=pick([
  [`A circle has a diameter of ${d} cm. What is its circumference in centimetres? Use π ≈ ${PI}.`,display(C),[step('Circumference = π × diameter.',`C=${PI}\\times${d}`),step('Calculate.',`C=${display(C)}\\ \\text{cm}`)]],
  [`A circle has a radius of ${r} cm. What is its circumference in centimetres? Use π ≈ ${PI}.`,display(C),[step('The diameter is twice the radius.',`d=2\\times${r}=${d}`),step('Circumference = π × diameter.',`C=${PI}\\times${d}=${display(C)}\\ \\text{cm}`)]],
  [`A circle has a radius of ${r} cm. What is its area in square centimetres? Use π ≈ ${PI}.`,display(A),[step('Area = π × radius × radius.',`A=${PI}\\times${r}\\times${r}`),step('Calculate.',`A=${display(A)}\\ \\text{cm}^2`)]],
  [`A circle has a radius of ${r} cm. What is its diameter in centimetres?`,String(d),[step('The diameter is twice the radius.',`d=2\\times${r}=${d}\\ \\text{cm}`)]],
  [`A circle has a diameter of ${d} cm. What is its radius in centimetres?`,String(r),[step('The radius is half the diameter.',`r=${d}\\div2=${r}\\ \\text{cm}`)]],
  [`A circle has a diameter of ${d} cm. What is its area in square centimetres? Use π ≈ ${PI}.`,display(A),[step('The radius is half the diameter.',`r=${d}\\div2=${r}`),step('Area = π × radius × radius.',`A=${PI}\\times${r}\\times${r}=${display(A)}\\ \\text{cm}^2`)]],
  [`A circle has a circumference of ${display(C)} cm. What is its radius in centimetres? Use π ≈ ${PI}.`,String(r),[step('Circumference = π × diameter, so diameter = circumference ÷ π.',`d=${display(C)}\\div${PI}=${d}`),step('The radius is half the diameter.',`r=${d}\\div2=${r}\\ \\text{cm}`)]],
  [`A circle has a circumference of ${display(C)} cm. What is its diameter in centimetres? Use π ≈ ${PI}.`,String(d),[step('Diameter = circumference ÷ π.',`d=${display(C)}\\div${PI}=${d}\\ \\text{cm}`)]]
 ],style);
 const verify=[[`${PI}\\times${d}=${display(C)}`,multiply(pi,d),C],[`${PI}\\times${d}=${display(C)}`,multiply(pi,d),C],[`${PI}\\times${r}\\times${r}=${display(A)}`,multiply(multiply(pi,r),r),A],[`${d}\\div2=${r}`,d/2,r],[`2\\times${r}=${d}`,2*r,d],[`${PI}\\times${r}^2=${display(A)}`,multiply(pi,r*r),A],[`${PI}\\times${d}=${display(C)}`,multiply(pi,d),C],[`${PI}\\times${d}=${display(C)}`,multiply(pi,d),C]][style];
 return checked(result(text,steps,answer),'Check by working the formula forwards.',...verify);
}

// Dimensions l, w, h in cm; styles 7 and 8 use a cylinder with radius l and height h (π ≈ 3.14).
function solidMeasure([l,w,h,style]){
 whole(l,w,h);requireThat(l>=1&&w>=1&&h>=1&&l<=30&&w<=30&&h<=30,'Use dimensions from 1 to 30.');
 const V=l*w*h,SA=2*(l*w+l*h+w*h),cube=l*l*l,cubeSA=6*l*l,cyl=multiply(multiply(pi,l*l),h),lateral=multiply(pi,2*l*h),totalCyl=add(lateral,multiply(pi,2*l*l));
 const [text,answer,steps]=pick([
  [`A rectangular prism is ${l} cm long, ${w} cm wide and ${h} cm high. What is its volume in cubic centimetres?`,String(V),[step('Volume = length × width × height.',`V=${l}\\times${w}\\times${h}=${V}\\ \\text{cm}^3`)]],
  [`A rectangular prism is ${l} cm long, ${w} cm wide and ${h} cm high. What is its surface area in square centimetres?`,String(SA),[step('Add the areas of the three pairs of faces.',`${l}\\times${w}=${l*w},\\quad${l}\\times${h}=${l*h},\\quad${w}\\times${h}=${w*h}`),step('Surface area = 2 × (sum of the three face areas).',`2\\times(${l*w}+${l*h}+${w*h})=${SA}\\ \\text{cm}^2`)]],
  [`A cube has edges of ${l} cm. What is its volume in cubic centimetres?`,String(cube),[step('Volume of a cube = edge × edge × edge.',`V=${l}\\times${l}\\times${l}=${cube}\\ \\text{cm}^3`)]],
  [`A cube has edges of ${l} cm. What is its surface area in square centimetres?`,String(cubeSA),[step('A cube has 6 equal square faces.',`${l}\\times${l}=${l*l}`),step('Multiply by 6.',`6\\times${l*l}=${cubeSA}\\ \\text{cm}^2`)]],
  [`A rectangular prism has a volume of ${V} cm³. Its length is ${l} cm and its width is ${w} cm. What is its height in centimetres?`,String(h),[step('Volume = length × width × height, so height = volume ÷ (length × width).',`h=${V}\\div(${l}\\times${w})=${V}\\div${l*w}=${h}\\ \\text{cm}`)]],
  [`A box is ${l} cm by ${w} cm by ${h} cm. How many 1 cm cubes fit inside it with no gaps?`,String(V),[step('Each 1 cm cube has a volume of 1 cm³, so count the volume.',`${l}\\times${w}\\times${h}=${V}`)]],
  [`A tank is ${l} cm by ${w} cm by ${h} cm. How many millilitres of water does it hold when full? (1 cm³ = 1 mL)`,String(V),[step('Volume = length × width × height.',`V=${l}\\times${w}\\times${h}=${V}\\ \\text{cm}^3`),step('1 cm³ holds 1 mL.',`${V}\\ \\text{cm}^3=${V}\\ \\text{mL}`)]],
  [`A cylinder has a radius of ${l} cm and a height of ${h} cm. What is its volume in cubic centimetres? Use π ≈ ${PI}.`,display(cyl),[step('Volume = area of the base × height, and the base is a circle.',`V=${PI}\\times${l}^2\\times${h}`),step('Calculate.',`V=${PI}\\times${l*l}\\times${h}=${display(cyl)}\\ \\text{cm}^3`)]],
  [`A can has a base area of ${l*w} cm² and a height of ${h} cm. What is its volume in cubic centimetres?`,String(V),[step('Volume = base area × height.',`V=${l*w}\\times${h}=${V}\\ \\text{cm}^3`)]],
  [`A cylinder has a radius of ${l} cm and a height of ${h} cm. What is the area of its curved surface in square centimetres? Use π ≈ ${PI}.`,display(lateral),[step('The curved surface unrolls into a rectangle. Its length is the circumference of the base and its width is the height.',`C=2\\times${PI}\\times${l}=${display(multiply(pi,2*l))}`),step('Area = circumference × height.',`A=${display(multiply(pi,2*l))}\\times${h}=${display(lateral)}\\ \\text{cm}^2`)]],
  [`A cylinder has a radius of ${l} cm and a height of ${h} cm. What is its total surface area in square centimetres? Use π ≈ ${PI}.`,display(totalCyl),[step('Add the areas of the two circular ends.',`2\\times${PI}\\times${l}^2=${display(multiply(pi,2*l*l))}`),step('Add the area of the curved surface (circumference × height).',`${display(multiply(pi,2*l))}\\times${h}=${display(lateral)}`),step('Add them together.',`${display(multiply(pi,2*l*l))}+${display(lateral)}=${display(totalCyl)}\\ \\text{cm}^2`)]]
 ],style);
 const verify=[[`${V}\\div${l*w}=${h}`,V/(l*w),h],[`${SA}\\div2=${l*w+l*h+w*h}`,SA/2,l*w+l*h+w*h],[`\\sqrt[3]{${cube}}=${l}`,Math.round(Math.cbrt(cube)),l],[`${cubeSA}\\div6=${l*l}`,cubeSA/6,l*l],[`${l}\\times${w}\\times${h}=${V}`,l*w*h,V],[`${l}\\times${w}\\times${h}=${V}`,l*w*h,V],[`${l}\\times${w}\\times${h}=${V}`,l*w*h,V],[`${display(cyl)}\\div${PI}=${l*l*h}`,divide(cyl,pi),l*l*h],[`${V}\\div${h}=${l*w}`,V/h,l*w],[`${display(lateral)}\\div${PI}\\div2=${l*h}`,divide(divide(lateral,pi),2),l*h],[`${display(totalCyl)}-${display(lateral)}=${display(multiply(pi,2*l*l))}`,subtract(totalCyl,lateral),multiply(pi,2*l*l)]][style];
 return checked(result(text,steps,answer),'Check by working backwards.',...verify);
}

// Outer rectangle a × b. Styles 0-2 use a corner c × d; styles 3-5 use bases or diagonals a, b and a height or nothing.
function compositeArea([a,b,c,d,style]){
 whole(a,b,c,d);requireThat(a>=3&&b>=3&&c>=1&&d>=1,'Use positive lengths.');
 const cornerFits=()=>requireThat(c<a&&d<b,'The cut-out corner must fit inside.'),evenDiagonals=()=>requireThat((a*b)%2===0,'Use diagonals with an even product.');
 const defs=[
  ()=>{cornerFits();return [`An L-shaped floor is made from a ${a} m by ${b} m rectangle with a ${c} m by ${d} m corner removed. What is the area of the floor in square metres?`,a*b-c*d,[step('Find the area of the whole rectangle.',`${a}\\times${b}=${a*b}`),step('Find the area of the removed corner and subtract.',`${a*b}-${c}\\times${d}=${a*b}-${c*d}=${a*b-c*d}\\ \\text{m}^2`)]];},
  ()=>{cornerFits();return [`An L-shaped garden is made from a ${a} m by ${b} m rectangle with a ${c} m by ${d} m corner removed. What is the perimeter of the garden in metres?`,2*(a+b),[step('Moving the removed corner inward does not change the distance around the shape.',`P=2\\times(${a}+${b})`),step('Calculate.',`P=${2*(a+b)}\\ \\text{m}`)]];},
  ()=>[`A shape is made by joining a ${a} cm by ${b} cm rectangle and a ${c} cm by ${d} cm rectangle with no overlap. What is its total area in square centimetres?`,a*b+c*d,[step('Find the area of each rectangle.',`${a}\\times${b}=${a*b},\\quad${c}\\times${d}=${c*d}`),step('Add the areas.',`${a*b}+${c*d}=${a*b+c*d}\\ \\text{cm}^2`)]],
  ()=>{requireThat(((a+b)*c)%2===0,'Use a trapezoid with an even area product.');return [`A trapezoid has parallel sides of ${a} cm and ${b} cm and a height of ${c} cm. What is its area in square centimetres?`,(a+b)*c/2,[step('Area of a trapezoid = (sum of the parallel sides) × height ÷ 2.',`A=\\frac{(${a}+${b})\\times${c}}{2}`),step('Calculate.',`A=\\frac{${(a+b)*c}}{2}=${(a+b)*c/2}\\ \\text{cm}^2`)]];},
  ()=>{evenDiagonals();return [`A rhombus has diagonals of ${a} cm and ${b} cm. What is its area in square centimetres?`,a*b/2,[step('Area of a rhombus = (diagonal × diagonal) ÷ 2.',`A=\\frac{${a}\\times${b}}{2}`),step('Calculate.',`A=\\frac{${a*b}}{2}=${a*b/2}\\ \\text{cm}^2`)]];},
  ()=>{evenDiagonals();return [`A kite has diagonals of ${a} cm and ${b} cm. What is its area in square centimetres?`,a*b/2,[step('Area of a kite = (diagonal × diagonal) ÷ 2.',`A=\\frac{${a}\\times${b}}{2}`),step('Calculate.',`A=\\frac{${a*b}}{2}=${a*b/2}\\ \\text{cm}^2`)]];}
 ];
 requireThat(Number.isInteger(style)&&style>=0&&style<defs.length,'Choose a supported question style.');
 const [text,answer,steps]=defs[style](),back=[[`${answer}+${c*d}=${a*b}`,answer+c*d,a*b],[`2\\times(${a}+${b})=${answer}`,2*(a+b),answer],[`${answer}-${c*d}=${a*b}`,answer-c*d,a*b],[`${answer}\\times2\\div${c}-${a}=${b}`,answer*2/c-a,b],[`${answer}\\times2=${a*b}`,answer*2,a*b],[`${answer}\\times2=${a*b}`,answer*2,a*b]][style];
 return checked(result(text,steps,String(answer)),'Check by working backwards.',...back);
}

const TRIPLES=[[3,4,5],[5,12,13],[8,15,17],[7,24,25],[20,21,29]];
function pythagorasStory([k,tripleIndex,style]){
 whole(k,tripleIndex);requireThat(k>=1&&k<=10&&tripleIndex>=0&&tripleIndex<TRIPLES.length,'Use a supported right triangle.');
 const [p,q,hyp]=TRIPLES[tripleIndex].map(n=>n*k);
 const [text,answer,steps]=pick([
  [`A ladder leans against a wall. Its foot is ${q} m from the wall and it reaches ${p} m up the wall. How long is the ladder, in metres?`,hyp,[step('The wall, the ground and the ladder make a right triangle. Use the Pythagorean theorem.',`c^2=${p}^2+${q}^2=${p*p}+${q*q}=${hyp*hyp}`),step('Take the square root.',`c=\\sqrt{${hyp*hyp}}=${hyp}\\ \\text{m}`)]],
  [`A ${hyp} m ladder reaches ${p} m up a wall. How far is the foot of the ladder from the wall, in metres?`,q,[step('The ladder is the hypotenuse. Subtract the squares of the known sides.',`b^2=${hyp}^2-${p}^2=${hyp*hyp}-${p*p}=${q*q}`),step('Take the square root.',`b=\\sqrt{${q*q}}=${q}\\ \\text{m}`)]],
  [`A rectangle is ${p} cm wide and ${q} cm long. What is the length of its diagonal, in centimetres?`,hyp,[step('The diagonal is the hypotenuse of a right triangle with the sides of the rectangle as legs.',`d^2=${p}^2+${q}^2=${hyp*hyp}`),step('Take the square root.',`d=\\sqrt{${hyp*hyp}}=${hyp}\\ \\text{cm}`)]],
  [`On a grid, how far is the point (${q}, ${p}) from the origin, in units?`,hyp,[step('Draw a right triangle with legs along the axes.',`d^2=${q}^2+${p}^2=${hyp*hyp}`),step('Take the square root.',`d=\\sqrt{${hyp*hyp}}=${hyp}`)]]
 ],style);
 return checked(result(text,steps,String(answer)),'Check the theorem with the three sides.',`${p}^2+${q}^2=${hyp}^2`,p*p+q*q,hyp*hyp);
}

// Reflections, rotations and translations of the point (x, y); styles 6 and 7 dilate from the origin by dx.
function transformPoint([x,y,dx,dy,style]){
 whole(x,y,dx,dy);requireThat(Math.abs(x)<=20&&Math.abs(y)<=20&&Math.abs(dx)<=20&&Math.abs(dy)<=20,'Keep the numbers small.');
 const pt=(a,b)=>`(${a}, ${b})`.replace(/-/g,'−'),sg=n=>n<0?`−${-n}`:String(n);
 requireThat(style<6||dx>=2,'A dilation scale factor is 2 or more.');
 const [text,answer,steps]=pick([
  [`The point ${pt(x,y)} is translated ${Math.abs(dx)} units ${dx>=0?'right':'left'} and ${Math.abs(dy)} units ${dy>=0?'up':'down'}. What is the x-coordinate of its image?`,x+dx,[step(`${dx>=0?'Right':'Left'} moves the x-coordinate ${dx>=0?'up':'down'} by ${Math.abs(dx)}.`,`x'=${sg(x)}${dx>=0?'+':'-'}${Math.abs(dx)}=${x+dx}`)]],
  [`The point ${pt(x,y)} is translated ${Math.abs(dx)} units ${dx>=0?'right':'left'} and ${Math.abs(dy)} units ${dy>=0?'up':'down'}. What is the y-coordinate of its image?`,y+dy,[step(`${dy>=0?'Up':'Down'} moves the y-coordinate ${dy>=0?'up':'down'} by ${Math.abs(dy)}.`,`y'=${sg(y)}${dy>=0?'+':'-'}${Math.abs(dy)}=${y+dy}`)]],
  [`The point ${pt(x,y)} is reflected in the y-axis. What is the x-coordinate of its image?`,-x,[step('A reflection in the y-axis changes the sign of the x-coordinate and keeps the y-coordinate.',`${pt(x,y)}\\to${pt(-x,y)}`)]],
  [`The point ${pt(x,y)} is reflected in the x-axis. What is the y-coordinate of its image?`,-y,[step('A reflection in the x-axis changes the sign of the y-coordinate and keeps the x-coordinate.',`${pt(x,y)}\\to${pt(x,-y)}`)]],
  [`The point ${pt(x,y)} is rotated 180° about the origin. What is the x-coordinate of its image?`,-x,[step('A 180° rotation about the origin changes the sign of both coordinates.',`${pt(x,y)}\\to${pt(-x,-y)}`)]],
  [`The point ${pt(x,y)} is rotated 180° about the origin. What is the y-coordinate of its image?`,-y,[step('A 180° rotation about the origin changes the sign of both coordinates.',`${pt(x,y)}\\to${pt(-x,-y)}`)]],
  [`The point ${pt(x,y)} is dilated by a scale factor of ${dx} from the origin. What is the x-coordinate of its image?`,x*dx,[step('A dilation from the origin multiplies each coordinate by the scale factor.',`${pt(x,y)}\\to${pt(`${sg(x)}\\times${dx}`,`${sg(y)}\\times${dx}`)}`),step('Calculate the x-coordinate.',`${sg(x)}\\times${dx}=${x*dx}`)]],
  [`The point ${pt(x,y)} is dilated by a scale factor of ${dx} from the origin. What is the y-coordinate of its image?`,y*dx,[step('A dilation from the origin multiplies each coordinate by the scale factor.',`${pt(x,y)}\\to${pt(`${sg(x)}\\times${dx}`,`${sg(y)}\\times${dx}`)}`),step('Calculate the y-coordinate.',`${sg(y)}\\times${dx}=${y*dx}`)]]
 ],style);
 const back=[[`${answer}-${sg(dx)}=${x}`,answer-dx,x],[`${answer}-${sg(dy)}=${y}`,answer-dy,y],[`-(${answer})=${x}`,-answer,x],[`-(${answer})=${y}`,-answer,y],[`-(${answer})=${x}`,-answer,x],[`-(${answer})=${y}`,-answer,y],[`${answer}\\div${dx}=${x}`,answer/dx,x],[`${answer}\\div${dx}=${y}`,answer/dx,y]][style];
 return checked(result(text,steps,String(answer)),'Undo the transformation to return to the start.',...back);
}

// Scale: 1 cm on the drawing represents `factor` cm in real life.
function scaleLength([factor,length,style]){
 whole(factor,length);requireThat(factor>=2&&length>=1,'Use a scale factor of 2 or more.');const real=factor*length;
 const [text,answer,steps]=pick([
  [`A scale drawing uses a scale of 1 cm : ${factor} cm. A wall is ${length} cm long on the drawing. How long is the real wall, in centimetres?`,String(real),[step(`Every 1 cm on the drawing is ${factor} cm in real life, so multiply.`,`${length}\\times${factor}=${real}\\ \\text{cm}`)]],
  [`A scale drawing uses a scale of 1 cm : ${factor} cm. A room is ${real} cm long in real life. How long is it on the drawing, in centimetres?`,String(length),[step(`Every ${factor} cm in real life is 1 cm on the drawing, so divide.`,`${real}\\div${factor}=${length}\\ \\text{cm}`)]],
  [`On a map, 1 cm represents ${factor} km. Two towns are ${length} cm apart on the map. How many kilometres apart are they?`,String(real),[step(`Each centimetre stands for ${factor} km, so multiply.`,`${length}\\times${factor}=${real}\\ \\text{km}`)]],
  [`A model is built to a scale of 1 : ${factor}. A part of the model is ${length} cm long. How long is the real part, in centimetres?`,String(real),[step(`The scale 1 : ${factor} means the real part is ${factor} times as long.`,`${length}\\times${factor}=${real}\\ \\text{cm}`)]]
 ],style);
 return checked(result(text,steps,answer),style===1?'Multiply the drawing length by the scale factor.':'Divide the real length by the scale factor.',style===1?`${length}\\times${factor}=${real}`:`${real}\\div${factor}=${length}`,style===1?length*factor:real/factor,style===1?real:length);
}

function polygonAngle([sides,style]){
 whole(sides);requireThat(sides>=3&&sides<=20,'Use a polygon with 3 to 20 sides.');const sum=(sides-2)*180;
 requireThat(style!==1&&style!==2&&style!==4||(sum%sides===0&&360%sides===0),'Use a regular polygon with whole-degree angles.');
 const [text,answer,steps]=pick([
  [`What is the sum of the interior angles of a polygon with ${sides} sides, in degrees?`,sum,[step('A polygon with n sides can be split into n − 2 triangles, and each triangle has 180°.',`(${sides}-2)\\times180`),step('Calculate.',`${sides-2}\\times180=${sum}^\\circ`)]],
  [`What is the measure of each interior angle of a regular polygon with ${sides} sides, in degrees?`,sum/sides,[step('First find the sum of the interior angles: (n − 2) × 180°.',`(${sides}-2)\\times180=${sum}`),step('A regular polygon has equal angles, so divide by the number of sides.',`${sum}\\div${sides}=${sum/sides}^\\circ`)]],
  [`What is the measure of each exterior angle of a regular polygon with ${sides} sides, in degrees?`,360/sides,[step('The exterior angles of any polygon add to 360°.',`360\\div${sides}`),step('A regular polygon has equal exterior angles.',`360\\div${sides}=${360/sides}^\\circ`)]],
  [`The interior angles of a polygon add to ${sum}°. How many sides does the polygon have?`,sides,[step('Divide the sum by 180° and add 2.',`${sum}\\div180+2=${sum/180}+2=${sides}`)]],
  [`A regular polygon has ${sides} sides. How many degrees is each interior angle plus the exterior angle next to it?`,180,[step('An interior angle and its exterior angle lie along a straight line.',`${sum/sides}+${360/sides}=180`)]]
 ],style);
 return checked(result(text,steps,String(answer)),'Check with the angle sum.',style===0?`${sum}\\div180+2=${sides}`:style===3?`(${sides}-2)\\times180=${sum}`:`${answer}\\times${sides}=${answer*sides}`,style===0?sum/180+2:style===3?(sides-2)*180:answer*sides,style===0?sides:style===3?sum:style===1?sum:style===2?360:180*sides);
}

// total = k (a + b); the ratio a : b.
function ratioShare([a,b,k,style]){
 whole(a,b,k);requireThat(a>=1&&b>=1&&a!==b&&k>=2&&gcdN(a,b)===1,'Use a ratio in lowest terms.');const total=k*(a+b);
 const [text,answer,steps]=pick([
  [`Paint is mixed in the ratio ${a} : ${b} (blue : white). There are ${k*a} mL of blue paint. How many millilitres of white paint are needed?`,k*b,[step(`The ratio ${a} : ${b} means ${a} parts blue for ${b} parts white. Find the value of one part.`,`${k*a}\\div${a}=${k}`),step('Multiply the white parts by the value of one part.',`${b}\\times${k}=${k*b}`)]],
  [`The ratio of boys to girls in a club is ${a} : ${b}. There are ${total} students in all. How many are boys?`,k*a,[step('Add the parts to find the total number of parts.',`${a}+${b}=${a+b}`),step('Divide the total by the parts to find one part, then take the boys’ share.',`${total}\\div${a+b}=${k},\\quad${a}\\times${k}=${k*a}`)]],
  [`The ratio of boys to girls in a club is ${a} : ${b}. There are ${total} students in all. How many are girls?`,k*b,[step('Add the parts to find the total number of parts.',`${a}+${b}=${a+b}`),step('Divide the total by the parts to find one part, then take the girls’ share.',`${total}\\div${a+b}=${k},\\quad${b}\\times${k}=${k*b}`)]],
  [`A fruit punch uses juice and soda in the ratio ${a} : ${b}. If ${k*b} L of soda is used, how many litres of juice are used?`,k*a,[step(`The soda is ${b} parts. Find the value of one part.`,`${k*b}\\div${b}=${k}`),step('Multiply the juice parts by the value of one part.',`${a}\\times${k}=${k*a}`)]],
  [`Two friends share $${fmt(total)} in the ratio ${a} : ${b}. How many dollars does the person with the larger share get?`,k*Math.max(a,b),[step('Add the parts to find the total number of parts.',`${a}+${b}=${a+b}`),step('Divide the money by the parts to find one part, then take the larger share.',`${total}\\div${a+b}=${k},\\quad${Math.max(a,b)}\\times${k}=${k*Math.max(a,b)}`)]]
 ],style);
 const check=style===0?[`${k*a}:${answer}=${a}:${b}`,k*a*b,answer*a]:style===1?[`${answer}+${k*b}=${total}`,answer+k*b,total]:style===2?[`${k*a}+${answer}=${total}`,k*a+answer,total]:style===3?[`${answer}:${k*b}=${a}:${b}`,answer*b,k*b*a]:[`${answer}+${k*Math.min(a,b)}=${total}`,answer+k*Math.min(a,b),total];
 return checked(result(text,steps,String(answer)),'Check the two amounts against the ratio and the total.',...check);
}

function meanChange([mean,count,value,style]){
 whole(mean,count,value);requireThat(mean>=1&&count>=2&&count<=12&&value>=0,'Use a mean and a small data set.');const total=mean*count;
 const [text,answerR,steps]=pick([
  [`The mean of ${count} numbers is ${mean}. A new number, ${value}, is added to the data. What is the new mean?`,rational(total+value,count+1),[step('Total of the original numbers = mean × how many numbers.',`${mean}\\times${count}=${total}`),step('Add the new number and divide by the new count.',`(${total}+${value})\\div${count+1}=${display(rational(total+value,count+1))}`)]],
  [`The mean of ${count} numbers is ${mean}. One of the numbers, ${value}, is removed. What is the mean of the remaining numbers?`,rational(total-value,count-1),[step('Total of the original numbers = mean × how many numbers.',`${mean}\\times${count}=${total}`),step('Subtract the removed number and divide by the new count.',`(${total}-${value})\\div${count-1}=${display(rational(total-value,count-1))}`)]],
  [`The mean of ${count} numbers is ${mean}. What is the sum of the numbers?`,rational(total,1),[step('Sum = mean × how many numbers.',`${mean}\\times${count}=${total}`)]]
 ],style);
 requireThat(style!==1||(count>=3&&value<=total),'Remove a number that was in the data.');requireThat(terminating(answerR),'Use numbers that give an exact decimal.');
 const answer=display(answerR);
 const check=style===0?[`${answer}\\times${count+1}=${total+value}`,multiply(answerR,count+1),total+value]:style===1?[`${answer}\\times${count-1}+${value}=${total}`,add(multiply(answerR,count-1),value),total]:[`${total}\\div${count}=${mean}`,total/count,mean];
 return checked(result(text,steps,answer),'Multiply back to the total.',...check);
}

export const spaceVariantRules={
 'chart-read':chartRead,
 'experimental-probability-story':experimentalProbability,
 'sample-space':sampleSpace,
 'circle-story':circleStory,
 'solid-measure':solidMeasure,
 'composite-area':compositeArea,
 'pythagoras-story':pythagorasStory,
 'transform-point':transformPoint,
 'scale-length':scaleLength,
 'polygon-angle':polygonAngle,
 'ratio-share':ratioShare,
 'mean-change':meanChange
};
