import {pick,decimal,step,lesson,table,line,numeric,choice} from './common.js';
import {safeInteger,rational} from '../../core/exact.js';
import {tex} from '../../core/format.js';
import {linear} from '../../core/terms.js';
import {divisionFacts,linearSolution,substituteLinear,linearSequence,groupsNeeded} from '../../core/relationships.js';

const sequence=(start,increment,count)=>linearSequence(start,increment,count).map(safeInteger);
function inverseEquationLesson([a,b],division=false){
 const coefficient=division?rational(1,a):rational(1),constant=division?0:-a,
  solution=linearSolution(coefficient,constant,b),answer=safeInteger(solution.result),check=tex(substituteLinear(coefficient,constant,answer)),
  left=division?`\\frac{x}{${a}}`:`x-${a}`,undo=division?`\\times${a}`:`+${a}`;
 return lesson(`Solve x ${division?'÷':'−'} ${a} = ${b}, then verify.`,[
  step(division?'Multiply both sides by the same nonzero divisor.':'Add the same amount to both sides.',`${left}${undo}=${b}${undo}`),
  step(division?'The division is undone.':'The subtraction is undone.',`x=${answer}`),
  step('Substitute the answer into the original equation.',division?`\\frac{${answer}}{${a}}=${check}`:`${answer}-${a}=${check}`)
 ],{formula:`${left}=${b}`,answer,response:numeric(answer)});
}

export const algebraRules={
 'equation-subtract':{
  generate:r=>[pick(r,1,40),pick(r,1,50)],
  solve:values=>inverseEquationLesson(values)
 },
 'equation-divide':{
  generate:r=>[pick(r,2,10),pick(r,1,10)],
  solve:values=>inverseEquationLesson(values,true)
 },
 'inequality-operation':{
  generate:r=>{const a=pick(r,2,5),type=pick(r,0,2),limit=pick(r,a+1,9);return [a,limit,type,pick(r,0,1)];},
  solve:([a,limit,type,greater])=>{const sign=greater?'>':'<',rhs=type===0?limit-a:type===1?limit*a:limit,threshold=type===2?limit*a:limit,expression=type===0?`x-${a}`:type===1?`${a}x`:`\\frac{x}{${a}}`,values=Array.from({length:51},(_,i)=>i).filter(x=>greater?x>threshold:x<threshold),operation=type===0?`add ${a}`:type===1?`divide by ${a}`:`multiply by ${a}`;return lesson(`Find whole-number solutions from 0 to 50 for ${type===0?`x − ${a}`:type===1?`${a}x`:`x ÷ ${a}`} ${sign} ${rhs}.`,[
   step(`On both sides, ${operation}. This uses a positive number, so the comparison direction stays the same.`,`x${sign}${threshold}`),
   step('The boundary is excluded. Mark the allowed whole numbers.',undefined,{type:'inequality',max:50,boundary:threshold,greater,values,caption:`Solutions from 0 to 50: ${values.join(', ')}`}),
   step('Substitute an allowed value to check the original inequality.')
  ],{formula:`${expression}${sign}${rhs}`,answer:values.join(', ')});}
 },
 'pattern-type':{
  generate:r=>[pick(r,1,8),pick(r,1,5),pick(r,0,2)],
  solve:([a,d,type])=>{const values=type===0?[a,a+d,a,a+d,a]:sequence(type===1?a:a+5*d,type===1?d:-d,5),name=['repeating','growing','shrinking'][type];
   return lesson(`What kind of pattern is ${values.join(', ')}?`,[
    step(type===0?'The same two-number unit repeats.':`Each term changes by ${type===1?'+':'−'}${d}.`),
    step(`This is a ${name} pattern.`,undefined,table(['Term','Value'],values.map((v,i)=>[i+1,v]),'Look for what changes and what repeats'))
   ],{answer:name,response:choice(['repeating','growing','shrinking'],type)});}
 },
 'pattern-table':{
  generate:r=>[pick(r,1,5),pick(r,1,5),pick(r,0,1)],
  solve:([a,d,shrinking])=>{const values=sequence(shrinking?a+4*d:a,shrinking?-d:d,5);return lesson(`A tile pattern starts at ${values[0]} tiles and ${shrinking?'removes':'adds'} ${d} tiles each time. Make a table and graph.`,[
   step(`${shrinking?'Remove':'Add'} ${d} for each new term.`,undefined,table(['Term','Tiles'],values.map((v,i)=>[i+1,v]),'Tile counts')),
   step('The horizontal axis is the term number; the vertical axis counts tiles.',undefined,{type:'points',points:values.map((y,i)=>[i+1,y]),caption:'Growing tile pattern',xLabel:'Term',yLabel:'Tiles'})
  ],{answer:values.join(', ')});}
 },
 'pattern-missing':{
  generate:r=>[pick(r,1,10),pick(r,1,10),pick(r,0,1)],
  solve:([a,d,shrink])=>{const values=sequence(shrink?a+4*d:a,shrink?-d:d,5);return lesson(`Find the missing term: ${values[0]}, ${values[1]}, __, ${values[3]}, ${values[4]}.`,[
   step(`The difference between neighbouring terms is ${shrink?'−':'+'}${d}.`,`${values[1]}-${values[0]}=${shrink?-d:d}`),
   step('Apply the same rule at the missing position.',`${values[1]}${shrink?'-':'+'}${d}=${values[2]}`)
  ],{answer:values[2],response:numeric(values[2])});}
 },
 'decimal-pattern':{
  generate:r=>[pick(r,10,100),pick(r,1,10)],
  solve:([a,d])=>{const vals=sequence(a,d,5);return lesson(`Continue this pattern: ${vals.slice(0,3).map(n=>decimal(n)).join(', ')}, …`,[
   step(`Add ${d} hundredths, or ${decimal(d)}, each time.`),
   step('Use the same step through tenths and whole-number boundaries.',undefined,table(['Term','Hundredths','Decimal'],vals.map((v,i)=>[i+1,v,decimal(v)]),'The same values in two forms'))
  ],{answer:decimal(vals[3]),response:numeric(decimal(vals[3]))});}
 },
 'words-expression':{
  generate:r=>[pick(r,2,6),pick(r,1,10)],
  solve:([a,b])=>lesson(`Write an expression for “${a} equal groups of a number, plus ${b}”.`,[
   step('Use n to stand for the unknown number.',undefined,{type:'groups',groups:a,extra:b,caption:'Each box stands for the same unknown number'}),
   step(`The ${a} groups give ${a}n; then add ${b}.`,linear(a,b,'n'))
  ],{answer:linear(a,b,'n')})
 },
 'evaluate-expression':{
  generate:r=>[pick(r,2,9),pick(r,1,10),pick(r,0,10)],
  solve:([a,b,n])=>{
   const spaced=linear(a,b,'n').replace(/(?<=.)([+-])/g,' $1 '),product=a===1?String(n):`${a}\\times${n}`;
   if(a===1&&!b)throw Error('Use a real expression, not just n.');
   return lesson(`Find ${spaced} when n = ${n}.`,[
    step('Replace the letter with its given value.',b?`${product}+${b}`:product),
    step(b?(a===1?'Add.':'Multiply first, then add.'):'Multiply.',b?`${a*n}+${b}=${a*n+b}`:`${a}\\times${n}=${a*n}`)
   ],{answer:a*n+b,response:numeric(a*n+b)});
  }
 },
 'inequality':{
  generate:r=>[pick(r,1,15),pick(r,16,50),pick(r,0,1)],
  solve:([a,b,greater])=>{const limit=b-a,values=Array.from({length:51},(_,i)=>i).filter(x=>greater?x+a>b:x+a<b);return lesson(`Find whole numbers from 0 to 50 that satisfy x + ${a} ${greater?'>':'<'} ${b}.`,[
   step(`Subtract ${a} from both sides. The comparison direction stays the same.`,`x${greater?'>':'<'}${limit}`),
   step('Use an open endpoint because the boundary itself does not satisfy a strict inequality.',undefined,{type:'inequality',max:50,boundary:limit,greater,values,caption:`Whole-number solutions: ${values.join(', ')}`}),
   step('Check the closest allowed value and the boundary.',`${greater?limit+1:limit-1}+${a}=${greater?b+1:b-1},\\quad${limit}+${a}=${b}`)
  ],{answer:values.join(', ')});}
 },
 'coding-condition':{
  generate:r=>[pick(r,0,100),pick(r,2,5)],
  solve:([n,d])=>{const facts=divisionFacts(n,d),q=safeInteger(facts.quotient),remainder=safeInteger(facts.remainder),match=remainder===0;return lesson(`Build a rule that checks whether ${n} can be shared equally in groups of ${d}.`,[
   step('A remainder of zero means the groups are equal.',undefined,{type:'code',caption:'A conditional program',lines:[`number ← ${n}`,`IF remainder(number ÷ ${d}) = 0`,`  SAY "equal groups"`,'ELSE','  SAY "parts left over"']}),
   step('Run the condition. Only its matching branch runs.',`${n}=${d}\\times${q}+${remainder}`),
   step(`The output is “${match?'equal groups':'parts left over'}”.`)
  ],{answer:match?'equal groups':'parts left over',response:{kind:'choice',options:['equal groups','parts left over'],answer:match?'equal groups':'parts left over'},builder:{kind:'condition',number:n,divisor:d}});}
 },
 'coding-loop':{
  generate:r=>[pick(r,1,5),pick(r,1,5),pick(r,2,6)],
  solve:([start,increment,times])=>{const vals=sequence(start+increment,increment,times);return lesson(`A program starts at ${start}, adds ${increment}, then displays the result, ${times} times. What happens if you change the increment?`,[
   step('Read the order: add first, display second.',undefined,{type:'code',caption:'A loop program',lines:[`value ← ${start}`,`REPEAT ${times} TIMES`,`  value ← value + ${increment}`,'  DISPLAY value']}),
   step('Trace each trip through the loop.',undefined,table(['Loop','Displayed value'],vals.map((v,i)=>[i+1,v]),'Trace the program')),
   step(`If the increment increases by 1, the last value increases by ${times}.`,`${start}+${times}\\times${increment}=${vals.at(-1)}`)
  ],{answer:vals.at(-1),response:numeric(vals.at(-1)),builder:{kind:'loop',start,increment,times}});}
 },
 'seating-model':{
  generate:r=>[pick(r,15,40),pick(r,3,8),pick(r,1,5)],
  solve:([people,capacity,extra])=>{const tables=safeInteger(groupsNeeded(people,capacity)),revised=safeInteger(groupsNeeded(people+extra,capacity));return lesson(`Plan tables for ${people} learners. Each table seats ${capacity}. Later, ${extra} more learners arrive. Revise your plan.`,[
   step('Assume every seat is usable and nobody shares a seat. Count full tables and any remaining learners.',`${people}=${capacity}\\times${Math.floor(people/capacity)}+${people%capacity}`),
   step(`Use ${tables} tables so everyone has a seat. Rounding down could leave someone standing.`,`${tables}\\times${capacity}=${tables*capacity}`),
   step('Test the changed situation and revise if needed.',undefined,table(['Plan','Learners','Tables','Seats'],[['First',people,tables,tables*capacity],['Revised',people+extra,revised,revised*capacity]],'Check the model against the situation')),
   step('Discuss space for walkways and whether every table really has this many usable seats. A model may need new assumptions.')
  ],{answer:revised,response:numeric(revised)});}
 }
};
