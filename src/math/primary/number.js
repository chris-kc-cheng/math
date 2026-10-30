import {lesson,step,checked,table,requireThat,rational,tex,style,counters,blocks,shareBars,shareWords,partName,choiceLesson} from './common.js';
export const primaryNumberRules={
 'primary-count':([start,jump,jumps,mode])=>{
  requireThat(start>=0&&jump>=1&&jumps>=2&&jumps<=10,'Use a nonnegative start and 2–10 positive counting jumps.');requireThat(mode===0||mode===3||jump>=2,'Count by more than 1 when the question talks about jumps or turns.');
  const seq=Array.from({length:jumps+1},(_,i)=>start+i*jump),answer=seq.at(-1),shown=seq.slice(0,-1);
  const [prompt,hint]=style([
   [`What number comes next: ${shown.join(', ')}, __?`,`Each number is ${jump} more than the one before it.`],
   [`Start at ${start}. Make ${jumps} jumps of ${jump}. Which number do you reach?`,`Count forward ${jump} at a time, once for each jump.`],
   [`A counter starts at ${start}. It increases by ${jump} each turn. What does it show after ${jumps} turns?`,'Keep the starting count, then add the same amount on each turn.'],
   [`Fill the last space in this counting table: ${shown.join(', ')}, __.`,'Use the same counting step in every space.']
  ],mode);
  return checked(lesson(prompt,[step(hint,undefined,table(['Jump','Number'],seq.map((n,i)=>[i,n]),'A counting path')),step(`Add ${jump} for each of the ${jumps} jumps and write every number you reach.`,seq.join('\\to')),step(`The last number is ${answer}.`,`${start}+${jumps}\\times${jump}=${answer}`)],{answer:String(answer)}),`Count back ${jump} to check the last jump.`,`${answer}-${jump}=${answer-jump}`,answer-jump,seq.at(-2));
 },
 'primary-compose':([hundreds,tens,ones,mode])=>{
  requireThat(hundreds>=0&&hundreds<=10&&tens>=0&&tens<=20&&ones>=0&&ones<=20,'Use bounded base-ten parts.');const n=hundreds*100+tens*10+ones;requireThat(n>0&&(mode!==1||tens>0)&&(mode!==2||ones>0),'Use a number the question can ask about.');
  // Say only the places that are used: never "0 tens" and never "+0".
  const named=[[hundreds,'hundreds'],[tens,'tens'],[ones,'ones']].filter(([count])=>count>0).map(([count,word])=>`${count} ${word}`),list=named.length>1?`${named.slice(0,-1).join(', ')} and ${named.at(-1)}`:named[0],sum=[hundreds*100,tens*10,ones].filter(Boolean).join('+');
  const [prompt,answer,hint,math]=style([
   [`What number do ${list} make?`,n,'Count the value of each bundle, then add the loose ones.',named.length>1?`${sum}=${n}`:`${n}`],
   [`The model shows ${n}. What is the value of its tens bundles?`,tens*10,`Each ten is a bundle of 10 ones. Count ${tens} bundles by tens.`,`${Array.from({length:tens},()=>10).join('+')||0}=${tens*10}`],
   [`In ${n}, how many loose ones are shown in the model?`,ones,'Count just the small single blocks; keep the bundles separate.',`${ones}`],
   [`A number has ${list}. What is the number?`,n,'Put the place-value parts together.',named.length>1?`${sum}=${n}`:`${n}`]
  ],mode);
  return lesson(prompt,[step(hint,undefined,{type:'primary-blocks',number:n,parts:[hundreds,tens,ones],caption:'Given bundles and loose ones'}),step('Read the amount named in the question.',math)],{answer:String(answer)});
 },
 'primary-add-subtract':([a,b,subtract,method])=>{
  requireThat(a>0&&b>0&&(!subtract||a>b),'Use two positive amounts and a positive difference.');const answer=subtract?a-b:a+b,op=subtract?'-':'+';
  const [prompt,hint]=style([
   [subtract?`There are ${a} counters. Take away ${b}. How many remain?`:`Join ${a} counters and ${b} counters. How many altogether?`,subtract?`Start at ${a} and count back ${b}.`:`Start at ${a} and count on ${b}.`],
   [subtract?`Work out ${a} − ${b} by first reaching a ten.`:`Work out ${a} + ${b} by first making a ten.`,subtract?'Split the amount taken away so the first step reaches a ten.':'Split the second amount so the first step makes a ten.'],
   [subtract?`Subtract ${b} from ${a} using tens and ones.`:`Add ${a} and ${b} using tens and ones.`,subtract?'Regroup a ten as ten ones if there are not enough loose ones.':'Combine equal place values; ten ones can make a new ten.']
  ],method);
  let steps;
  if(method===1){const bridge=subtract?a%10:10-a%10;requireThat(bridge>0&&bridge<10&&b>bridge&&(!subtract||a>bridge),'This example must reach a ten.');const middle=subtract?a-bridge:a+bridge,rest=b-bridge;steps=[step(hint,`${b}=${bridge}+${rest}`),step(`Use ${bridge} to reach ${middle}.`,`${a}${op}${bridge}=${middle}`),...(rest?[step(`Now ${subtract?'take away':'add'} the remaining ${rest}.`,`${middle}${op}${rest}=${answer}`)]:[])];}
  else if(method===0){const small=b<=10,counts=small?Array.from({length:b},(_,i)=>subtract?a-i-1:a+i+1):[];steps=[step(hint,undefined,small&&a<=40?counters(a,`${a} counters before the change`):blocks(a)),step(small&&b?`Count ${subtract?'back':'on'}: ${counts.join(', ')}.`:`Combine the place values to ${subtract?'take away':'add'} ${b}.`,`${a}${op}${b}=${answer}`)];}
  else steps=[step(hint,undefined,table(['Amount','Hundreds','Tens','Ones'],[a,b].map(n=>[n,Math.floor(n/100),Math.floor(n/10)%10,n%10]),'Matching place values')),step(subtract?`After subtracting, ${answer} remain.`:`The combined amount is ${answer}.`,`${a}${op}${b}=${answer}`)];
  return checked(lesson(prompt,steps,{answer:String(answer)}),subtract?`Put the ${b} removed counters back.`:`Remove the ${b} added counters to check.`,`${answer}${subtract?'+':'-'}${b}=${a}`,subtract?answer+b:answer-b,a);
 },
 'primary-estimate':([count,bundle,mode])=>{
  requireThat(count>=1&&count<=200&&[5,10,20].includes(bundle),'Use a visible collection up to 200.');const groups=Math.floor(count/bundle),left=count%bundle;
  const prompt=style([`First estimate the collection, then count to check. How many counters are actually shown?`,`Use the groups of ${bundle} to count this collection. What is the exact count?`,`A learner estimates about ${Math.round(count/bundle)*bundle} counters. Count the picture to find the actual number.`],mode);
  return lesson(prompt,[step(`Estimate first: look at the groups of ${bundle}. The collection is close to ${Math.round(count/bundle)*bundle}.`,undefined,counters(count,'A supplied collection to estimate and count',bundle)),step(`Now count exactly: ${groups} full groups of ${bundle}${left?`, then ${left} loose`:''}. An estimate is close, not exact. The count is ${count}.`,`${Array(groups).fill(bundle).concat(left?[left]:[]).join('+')||0}=${count}`)],{answer:String(count),visual:counters(count,'Estimate before counting',bundle)});
 },
 'primary-fair-share':([items,friends,mode,grade])=>{
  requireThat(items>=1&&[2,3,4,5,6,8,10].includes(friends),'Use supported fair-sharing groups.');
  requireThat(grade!==1||[2,4].includes(friends)&&items%friends>=1&&items%friends<=2,'Grade 1 sharing uses two or four sharers and one or two leftover wholes.');const context=style(items===1?['pizza','clay bar','length of ribbon','sandwich']:['pizzas','equal clay bars','equal lengths of ribbon','sandwiches'],mode),whole=Math.floor(items/friends),left=items%friends,words=shareWords(items,friends);
  const first=whole?`Give each friend ${whole} whole${whole===1?'':'s'} first. ${left?`${left} whole${left===1?' is':'s are'} still to share.`:'Nothing is left to share.'}`:`There ${items===1?'is':'are'} not enough ${items===1?'for':'for'} every friend to get a whole one, so share ${items===1?'it':'them all'}.`;
  const steps=[
   step(first,undefined,{...shareBars(items,friends),wholeOnly:true,caption:'Whole items shared first; leftovers still need splitting'}),
   step(left?`Cut each ${whole?'leftover ':''}whole into ${friends} equal pieces. Every friend gets ${left} of these pieces.`:'Each friend already has a fair share.',undefined,shareBars(items,friends)),
   step(`Each friend gets ${words}.`,grade===3?`\\frac{${items}}{${friends}}=${tex(rational(items,friends))}`:undefined)
  ];
  const meta={visual:counters(items,'Equal whole items before sharing')};
  // Grades 1–2 describe shares in words (halves, fourths), so the answer is a phrase to choose, not a typed fraction.
  if(grade<3){
   const phrase=(w,l)=>l?`${w?`${w} whole${w===1?'':'s'} and `:''}${l} ${l===1?partName(friends).replace(/ves$/,'f').replace(/s$/,''):partName(friends)}`:`${w} whole${w===1?'':'s'}`;
   const correct=phrase(whole,left),extras=[phrase(whole+1,left),phrase(whole,left%friends+1===left?left+2:left%friends+1),phrase(Math.max(0,whole-1)||whole+2,left||1),phrase(left,whole)];
   const options=[...new Set([correct,...extras])].slice(0,4).sort((a,b)=>a.localeCompare(b));
   return choiceLesson(`Share ${items} ${context} equally among ${friends} friends. How much does each friend get?`,steps,correct,options,meta.visual);
  }
  return lesson(`Share ${items} ${context} equally among ${friends} friends. How much does each friend get?`,steps,{answer:tex(rational(items,friends)),visual:meta.visual});
 },
 'primary-equivalent-parts':([small,scale,covered,mode])=>{
  requireThat([2,3,5].includes(small)&&[2,4].includes(scale)&&covered>=1&&covered<small,'Use supported equal-sized wholes and proper shares.');const large=small*scale;requireThat([4,6,8,10].includes(large),'Use fourths, sixths, eighths, or tenths.');const pieces=covered*scale,answer=mode===3?covered:pieces;
  const prompt=style([`One whole is cut into ${small} equal parts. ${covered} ${partName(small)} is shaded. How many ${partName(large)} cover the same amount?`,`Two same-sized strips have ${small} and ${large} equal pieces. Match ${covered} of the larger pieces. How many smaller pieces do you need?`,`A fair share is ${covered} out of ${small} equal parts. Cut each part into ${scale} smaller pieces. How many smaller pieces are in that share?`,`${pieces} out of ${large} equal pieces are shaded. How many ${partName(small)} cover the same share?`],mode);
  return lesson(prompt,[step(`Each of the ${small} larger parts contains ${scale} smaller pieces.`,undefined,{type:'primary-equivalent',denominators:[small,large],numerators:[covered,pieces],caption:'Same-sized wholes; the shaded length is unchanged'}),step(mode===3?`Group the ${pieces} small pieces into larger parts of ${scale} pieces each: ${covered} larger parts.`:`Count the smaller pieces inside the shaded share: ${answer}.`,mode===3?undefined:`${Array(covered).fill(scale).join('+')}=${answer}`)],{answer:String(answer)});
 },
 'primary-unit-compare':([first,second,mode])=>{
  requireThat(first>=2&&second>=2&&first<=10&&second<=10&&first!==second,'Use different sharing counts, at most ten.');const bigger=Math.min(first,second),smaller=Math.max(first,second),answer=mode===1?smaller:bigger;
  return lesson(style([`Two same-sized cakes are shared among ${first} friends and ${second} friends. Which number of friends gives each person the bigger piece?`,`Share equal cakes among ${first} friends and ${second} friends. Which number of friends gives smaller individual pieces?`,`Who gets more from the same-sized whole: each of ${first} sharers or each of ${second} sharers? Give the number of sharers.`],mode),[step('Keep the whole the same size. More equal pieces mean smaller pieces.',undefined,{type:'primary-equivalent',denominators:[first,second],numerators:[1,1],caption:'One individual share from each same-sized whole'}),step(mode===1?`${smaller} friends get the smaller pieces.`:`${bigger} friends get the larger pieces.`)],{answer:String(answer)});
 },
 'primary-groups':([groups,size,denominator,ask,mode,grade])=>{
  requireThat(groups>=2&&groups<=10&&size>=1&&size<=10&&[1,2,3,4].includes(denominator),'Use small equal groups.');requireThat(denominator!==1||size>=2,'One counter in each group is not a grouping problem.');const total=rational(groups*size,denominator),answer=ask===0?tex(total):ask===1?String(groups):String(size),unit=denominator===1?'counters':partName(denominator);
  const prompt=ask===0?style([`There are ${groups} equal groups with ${size} ${unit} in each. How much is there altogether?`,`Make ${groups} groups of ${size} ${unit}. What is the total?`,`A tray has ${size} ${unit}. ${groups} equal trays hold how much altogether?`],mode):ask===1?style([`There are ${groups*size} counters, put into groups of ${size}. How many groups can be made?`,`A ribbon is ${groups*size} small units long. Cut it into equal pieces of ${size} units. How many pieces are made?`,`Each basket holds ${size} blocks. How many baskets hold ${groups*size} blocks?`],mode):style([`Share ${groups*size} counters equally among ${groups} friends. How many counters does each friend get?`,`Arrange ${groups*size} tiles in ${groups} equal rows. How many tiles are in one row?`,`Put ${groups*size} pencils equally into ${groups} boxes. How many pencils go into each box?`],mode);
  requireThat(ask===0||denominator===1,'Count whole objects when finding a group count.');
  if(ask===0&&denominator>1&&grade<3){
   const total=groups*size,correct=shareWords(total,denominator),options=[...new Set([correct,shareWords(total+1,denominator),shareWords(total+denominator,denominator),shareWords(Math.max(1,total-1),denominator)])].slice(0,4).sort((a,b)=>a.localeCompare(b));
   return choiceLesson(prompt,[step(`Draw ${groups} equal groups, each with ${size} ${unit}.`,undefined,shareBars(groups*size,denominator)),step(`Count all the ${unit} together. They make ${correct}.`)],correct,options);
  }
  const sum=Array(groups).fill(denominator===1?String(size):`\\frac{${size}}{${denominator}}`).join('+');
  return lesson(prompt,[step(`Draw ${groups} equal groups, each with ${size} ${unit}.`,undefined,denominator===1?{type:'primary-groups',groups,size,caption:'Equal groups; count each group once'}:shareBars(groups*size,denominator)),step(ask===0?`Add the equal groups. Together they make ${denominator===1?String(groups*size):shareWords(groups*size,denominator)}.`:ask===1?`Count the groups in the drawing: ${groups} ${groups===1?'group':'groups'}.`:`One equal group contains ${size} counters.`,ask===0?(denominator>1&&grade<3?undefined:denominator>1?`${sum}=\\frac{${groups*size}}{${denominator}}${tex(total)===`\\frac{${groups*size}}{${denominator}}`?'':'='+tex(total)}`:`${sum}=${tex(total)}`):grade>=3?`${groups*size}\\div${ask===1?size:groups}=${answer}`:undefined)],{answer});
 },
 'primary-parity':([n,mode])=>{requireThat(n>=0&&n<=200,'Use a whole number up to 200.');const odd=n%2===1,answer=odd?'odd':'even';return choiceLesson(style([`Is ${n} even or odd?`,`Can ${n} counters be paired with none left over? Choose even or odd.`,`Two friends share ${n} counters without breaking any. Is the starting count even or odd?`],mode),[step(`Make pairs. There are ${Math.floor(n/2)} full pairs${odd?' and one counter left over':', with none left over'}.`,undefined,counters(n,'Pair the counters',2)),step(odd?'One left over means odd.':'No leftovers means even.')],answer,['even','odd']);}
};
import {numberWords} from '../grade5/number.js';
Object.assign(primaryNumberRules,{
 'primary-read':([n,mode])=>{
  requireThat(n>=2&&n<=1000,'Use a bounded number at least two.');const words=numberWords(n);
  if(mode===1)return choiceLesson(`Which words name the number ${n}?`,[step('Read the value shown by the bundles and ones.',undefined,blocks(n)),step(`The number is ${words}.`)],words,[numberWords(n-2),words,numberWords(n-1)]);
  return lesson(style([`Write “${words}” using digits.`,``, `A bus is named “${words}”. What number should be on its sign?`],mode),[step(`Read each part of “${words}”.`,undefined,blocks(n)),step(`The digits are ${n}.`,String(n))],{answer:String(n)});
 },
 'primary-order':([a,b,c,mode])=>{
  requireThat(new Set([a,b,c]).size===3,'Use three different values.');const ordered=[a,b,c].sort((x,y)=>x-y),answer=mode===0?ordered.join(', '):String(ordered[[2,2,0,1][mode]]);
  return lesson(style([`Put ${a}, ${b}, and ${c} in order from least to greatest.`,`Which is greatest: ${a}, ${b}, or ${c}?`,`Which is least: ${a}, ${b}, or ${c}?`,`Which number belongs between the other two: ${a}, ${b}, or ${c}?`],mode),[step('Compare the amounts. Bundles show tens or hundreds; loose blocks show ones.',undefined,table(Math.max(a,b,c)<100?['Number','Tens','Ones']:['Number','Hundreds','Tens','Ones'],[a,b,c].map(n=>Math.max(a,b,c)<100?[n,Math.floor(n/10),n%10]:[n,Math.floor(n/100),Math.floor(n/10)%10,n%10]),'Compare from the largest place')),step(`From least to greatest: ${ordered.join(', ')}.`,mode===0?ordered.join('<'):answer)],{answer});
 }
});
Object.assign(primaryNumberRules,{
 'primary-scale':([quantity,factor,mode])=>{
  requireThat(quantity>=1&&quantity<=50&&[2,5,10].includes(factor),'Use scaling factors 2, 5, or 10.');const answer=quantity*factor;
  return checked(lesson(style([`One picture stands for ${factor} trees. How many trees do ${quantity} pictures stand for?`,`A model uses one block for ${factor} real seats. How many real seats do ${quantity} model blocks represent?`,`The rule matches 1 item to ${factor} items. What does it match ${quantity} items to?`],mode),[step(`For every one, count ${factor}.`,undefined,table(['Starting items','Scaled items'],[1,2,quantity].map(n=>[n,n*factor]),'A 1-to-many scaling rule')),step(`Scale ${quantity} by ${factor}.`,`${quantity}\\times${factor}=${answer}`)],{answer:String(answer)}),'Divide by the scale factor to recover the original count.',`${answer}\\div${factor}=${quantity}`,answer/factor,quantity);
 }
});
