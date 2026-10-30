import {lesson,step,checked,requireThat} from './common.js';

// Extra ways of asking the same skill: word problems, vocabulary ("sum", "decreased by"), missing-number boxes and
// place-value questions. Each rule takes a `style` index so one template yields several different stems, and each
// stem comes with the key-word hint a textbook would give for it.
const fmt=n=>Number(n).toLocaleString('en-CA');
const pickStyle=(stems,style)=>{requireThat(Number.isInteger(style)&&style>=0&&style<stems.length,'Choose a supported question style.');return stems[style];};
const positive=(...ns)=>requireThat(ns.every(n=>Number.isSafeInteger(n)&&n>=0),'Use whole numbers that are not negative.');
const operation=(symbol,a,b,answer)=>`${a}${symbol}${b}=${answer}`;

export const variantRules={
 'story-add':([a,b,style])=>{
  positive(a,b);const [text,hint]=pickStyle([
   [`Mia has ${fmt(a)} stickers. A friend gives her ${fmt(b)} more. How many stickers does Mia have now?`,'“Gives her more” means the amount grows, so add.'],
   [`A bus has ${fmt(a)} passengers. ${fmt(b)} more get on at the next stop. How many passengers are on the bus now?`,'“More get on” means the amount grows, so add.'],
   [`What is the sum of ${fmt(a)} and ${fmt(b)}?`,'“Sum” means the result of adding.'],
   [`Find the total of ${fmt(a)} and ${fmt(b)}.`,'“Total” means put the amounts together, so add.'],
   [`Increase ${fmt(a)} by ${fmt(b)}.`,'“Increase by” means add that amount.'],
   [`A library has ${fmt(a)} story books and ${fmt(b)} science books. How many books does it have altogether?`,'“Altogether” means put the amounts together, so add.']
  ],style);
  const total=a+b;
  return checked(lesson(text,[step(hint,`${a}+${b}`),step('Add the two numbers.',operation('+',a,b,total))],{answer:String(total)}),'Subtract one number from the total to get the other.',`${total}-${b}=${a}`,total-b,a);
 },
 'story-subtract':([a,b,style])=>{
  positive(a,b);requireThat(a>=b,'The first number must not be smaller than the second.');const [text,hint]=pickStyle([
   [`A shop has ${fmt(a)} apples. It sells ${fmt(b)} of them. How many apples are left?`,'“Sells” and “left” mean some are taken away, so subtract.'],
   [`Liam has $${fmt(a)}. He spends $${fmt(b)}. How many dollars does he have left?`,'“Spends” and “left” mean some are taken away, so subtract.'],
   [`What is ${fmt(a)} decreased by ${fmt(b)}?`,'“Decreased by” means take that amount away.'],
   [`Find the difference between ${fmt(a)} and ${fmt(b)}.`,'“Difference” means subtract the smaller number from the larger.'],
   [`How much more is ${fmt(a)} than ${fmt(b)}?`,'“How much more” compares two amounts, so subtract.'],
   [`What is ${fmt(a)} take away ${fmt(b)}?`,'“Take away” means subtract.']
  ],style);
  const difference=a-b;
  return checked(lesson(text,[step(hint,`${a}-${b}`),step('Subtract the second number from the first.',operation('-',a,b,difference))],{answer:String(difference)}),'Add the difference back to the number you subtracted.',`${difference}+${b}=${a}`,difference+b,a);
 },
 'story-multiply':([a,b,style])=>{
  positive(a,b);const [text,hint]=pickStyle([
   [`A classroom has ${fmt(a)} rows of ${fmt(b)} desks. How many desks are there?`,'Equal rows mean equal groups, so multiply.'],
   [`Each box holds ${fmt(b)} pencils. How many pencils are in ${fmt(a)} boxes?`,'“Each” and equal boxes mean equal groups, so multiply.'],
   [`What is the product of ${fmt(a)} and ${fmt(b)}?`,'“Product” means the result of multiplying.'],
   [`Find ${fmt(a)} groups of ${fmt(b)}.`,'“Groups of” means multiply.'],
   [`A bakery puts ${fmt(b)} muffins on each tray. It fills ${fmt(a)} trays. How many muffins is that?`,'“On each tray” and equal trays mean equal groups, so multiply.'],
   [`What is ${fmt(a)} times ${fmt(b)}?`,'“Times” means multiply.']
  ],style);
  const product=a*b;
  const steps=[step(hint,`${a}\\times${b}`),step('Multiply the two numbers.',operation('\\times',a,b,product))];
  return checked(lesson(text,steps,{answer:String(product)}),b===0?'Anything times zero is zero.':'Divide the product by one factor to get the other.',b===0?`${product}=0`:`${product}\\div${b}=${a}`,b===0?product:product/b,b===0?0:a);
 },
 'story-divide':([a,b,style])=>{
  positive(a,b);requireThat(b>=2&&a%b===0,'Use a divisor of 2 or more that divides the number exactly.');const [text,hint]=pickStyle([
   [`${fmt(a)} marbles are shared equally among ${fmt(b)} children. How many marbles does each child get?`,'“Shared equally” means divide.'],
   [`How many groups of ${fmt(b)} can be made from ${fmt(a)} cards?`,'“How many groups of” means divide the total by the group size.'],
   [`What is ${fmt(a)} divided by ${fmt(b)}?`,'“Divided by” means divide.'],
   [`Find the quotient of ${fmt(a)} and ${fmt(b)}.`,'“Quotient” means the result of dividing.'],
   [`A ribbon ${fmt(a)} cm long is cut into pieces ${fmt(b)} cm long. How many pieces are there?`,'Cutting a length into equal pieces means divide.'],
   [`${fmt(a)} students sit ${fmt(b)} to a table. How many tables do they need?`,'Equal tables of students mean divide the total by the number at each.']
  ],style);
  const quotient=a/b;
  return checked(lesson(text,[step(hint,`${a}\\div${b}`),step('Divide the first number by the second.',operation('\\div',a,b,quotient))],{answer:String(quotient)}),'Multiply the answer by the divisor to get back to the start.',`${quotient}\\times${b}=${a}`,quotient*b,a);
 },
 // form: 0 □+a=b, 1 a+□=b, 2 □−a=b, 3 a−□=b, 4 a×□=b, 5 □÷a=b
 'missing-number':([a,b,form])=>{
  positive(a,b);requireThat(Number.isInteger(form)&&form>=0&&form<6,'Choose a supported missing-number form.');
  const box='\\square',equations=[`${box}+${a}=${b}`,`${a}+${box}=${b}`,`${box}-${a}=${b}`,`${a}-${box}=${b}`,`${a}\\times${box}=${b}`,`${box}\\div${a}=${b}`];
  requireThat(form>=2||b>a,'The total must be larger than the part you know.');requireThat(form!==3||a>b,'The first number must be larger than the answer.');
  requireThat(form!==4||(a>=2&&b%a===0),'Use a factor that divides the product exactly.');requireThat(form!==5||a>=2,'Use a divisor of 2 or more.');
  const answer=[b-a,b-a,a+b,a-b,b/a,a*b][form];
  const how=['Undo the addition: subtract the known number from the total.','Undo the addition: subtract the known number from the total.','Undo the subtraction: add the known number to the result.','The box is what must be taken away from the first number: subtract the result from it.','Undo the multiplication: divide the product by the known factor.','Undo the division: multiply the result by the divisor.'][form];
  const work=[`${b}-${a}=${answer}`,`${b}-${a}=${answer}`,`${b}+${a}=${answer}`,`${a}-${b}=${answer}`,`${b}\\div${a}=${answer}`,`${b}\\times${a}=${answer}`][form];
  const back=[`${answer}+${a}=${b}`,`${a}+${answer}=${b}`,`${answer}-${a}=${b}`,`${a}-${answer}=${b}`,`${a}\\times${answer}=${b}`,`${answer}\\div${a}=${b}`][form];
  const left=[answer+a,a+answer,answer-a,a-answer,a*answer,answer/a][form];
  return checked(lesson('Find the missing number that makes the equation true.',[step('The box stands for the number we need to find.',equations[form]),step(how,work)],{formula:equations[form],answer:String(answer)}),'Put the answer in the box and check that both sides are equal.',back,left,b);
 },
 // ask: 0 greater, 1 less, 2 how much greater
 'compare-values':([a,b,ask])=>{
  positive(a,b);requireThat(a!==b,'Use two different numbers.');requireThat([0,1,2].includes(ask),'Choose a supported question.');
  const big=Math.max(a,b),small=Math.min(a,b),answer=ask===0?big:ask===1?small:big-small;
  const text=[`Which number is greater: ${fmt(a)} or ${fmt(b)}?`,`Which number is less: ${fmt(a)} or ${fmt(b)}?`,`How much greater is the larger of ${fmt(a)} and ${fmt(b)} than the smaller?`][ask];
  const lenA=String(a).length,lenB=String(b).length;
  const compareText=lenA!==lenB?'The number with more digits is greater.':'Compare digit by digit from the left. The first place where they differ decides.';
  const steps=[step(compareText,`${fmt(small)}<${fmt(big)}`.replace(/,/g,'\\,'))];
  steps.push(step(ask===0?'The greater number is the answer.':ask===1?'The smaller number is the answer.':'Subtract the smaller number from the larger.',ask===2?operation('-',big,small,answer):String(answer)));
  return checked(lesson(text,steps,{answer:String(answer)}),ask===2?'Add the difference to the smaller number to reach the larger.':'The answer is one of the two numbers and matches the comparison.',ask===2?`${small}+${answer}=${big}`:`${answer}=${answer}`,ask===2?small+answer:answer,ask===2?big:answer);
 },
 // ask: 0 value of the digit in a place, 1 which digit is in a place
 'digit-value':([n,place,ask])=>{
  positive(n,place);const digits=String(n),names=['ones','tens','hundreds','thousands','ten thousands','hundred thousands','millions','ten millions','hundred millions'];
  requireThat(place<digits.length&&place<names.length&&[0,1].includes(ask),'Use a place that the number has.');
  const digit=Number(digits[digits.length-1-place]);requireThat(ask===1||digit>0,'Choose a place whose digit is not zero.');
  const answer=ask===0?digit*10**place:digit;
  const text=ask===0?`In ${fmt(n)}, what is the value of the digit in the ${names[place]} place?`:`In ${fmt(n)}, which digit is in the ${names[place]} place?`;
  const steps=[step(`Count places from the right: ones, tens, hundreds, and so on. The ${names[place]} place holds the digit ${digit}.`,`${fmt(n)}`.replace(/,/g,'\\,'))];
  steps.push(ask===0?step(`The digit ${digit} is in the ${names[place]} place, so its value is ${digit} × ${10**place}.`,`${digit}\\times${10**place}=${answer}`):step(`The digit in the ${names[place]} place is ${digit}.`,String(digit)));
  return checked(lesson(text,steps,{answer:String(answer)}),ask===0?'Divide the value by the place value to get the digit back.':'Rebuild the digit from its place in the number.',ask===0?`${answer}\\div${10**place}=${digit}`:`${digit}=${digit}`,ask===0?answer/10**place:digit,digit);
 }
};
