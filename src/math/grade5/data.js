import {pick,decimal,fraction,step,lesson,table,bars,line,numeric,choice} from './common.js';
import {rational,sum,safeInteger,multiply} from '../core/exact.js';
import {tex} from '../core/format.js';
import {summarizeData} from '../core/relationships.js';
export function simulateCoin(trials,rng=Math.random){if(!Number.isInteger(trials)||trials<1||trials>200)throw Error('Use 1 to 200 trials.');let heads=0;for(let i=0;i<trials;i++)if(rng()<0.5)heads++;return heads;}

// One statistical method for odd/even samples, with age-appropriate explanations of the middle.
function statisticsLesson(raw,dec){
 const scale=dec?10:1,fmt=v=>dec?decimal(v,1):String(v),facts=summarizeData(raw.map(n=>rational(n,scale))),
  sorted=facts.sorted.map(n=>safeInteger(multiply(n,scale))),modes=facts.modes.map(n=>safeInteger(multiply(n,scale))),
  mean=tex(facts.mean),even=raw.length%2===0,median=even?tex(facts.median):fmt(sorted[Math.floor(raw.length/2)]),max=facts.modeFrequency;
 const steps=even?[
  step('Sort the data. With four values there are two middle values.',sorted.map(fmt).join('\\le ')),
  step('Average the two middle values to get the median.',`\\text{median}=\\frac{${fmt(sorted[1])}+${fmt(sorted[2])}}2=${median}`),
  step('Divide the total by the number of data values to get the mean.',`\\text{mean}=\\frac{${raw.map(fmt).join('+')}}4=${mean}`),
  step(modes.length?`The most frequent ${modes.length===1?'value is':'values are'} ${modes.map(fmt).join(', ')}.`:'There is no mode because no value repeats.')
 ]:[
  step('Put the values in order; the middle of five values is the median.',sorted.map(fmt).join('\\le ')),
  step(`The median is ${median}. Find the mean by sharing the total equally.`,`\\text{mean}=\\frac{${raw.map(fmt).join('+')}}{5}=${mean}`),
  step(modes.length?`The most frequent ${modes.length===1?'value is':'values are'} ${modes.map(fmt).join(', ')}; ${modes.length===1?'it occurs':'each occurs'} ${max} times.`:'All values occur equally often, so there is no mode.'),
  step('The mean shares the total; the median locates the middle; modes identify the most frequent values.')
 ];
 return lesson(`Find the mean, median, and mode of ${raw.map(fmt).join(', ')}.`,steps,{answer:{mean,median,modes:modes.map(fmt)}});
}

export const dataRules={
 'statistics-even':{
  generate:r=>[pick(r,0,90),pick(r,0,90),pick(r,0,90),pick(r,0,90),pick(r,0,1)],
  solve:([a,b,c,d,dec])=>statisticsLesson([a,b,c,d],dec)
 },
 'sampling':{
  generate:r=>[pick(r,0,2),pick(r,3,8)],
  solve:([topic,classes])=>{const names=['favourite sport','library-book preferences','travel to school'],subject=names[topic];return lesson(`You want to learn about ${subject} across ${classes} classes. Which sample is fairer?`,[
   step('The population is all learners in those classes. A single club or one class can leave out important groups.'),
   step('Randomly choose some learners from each class. Give learners a fair chance to be included, and avoid leading questions.'),
   step('Compare the sample with the population: are different grades and groups represented? A larger biased sample can still be misleading.')
  ],{answer:'Random learners from every class',response:choice(['Only one club','Random learners from every class','Only your friends'],1)});}
 },
 'frequency-table':{
  generate:r=>[pick(r,1,12),pick(r,1,12),pick(r,1,12)],
  solve:v=>{const total=safeInteger(sum(v)),labels=['Walking','Bus','Cycling'];return lesson(`Organize a class travel survey: ${v[0]} walk, ${v[1]} take the bus, ${v[2]} cycle. Find relative frequencies.`,[
   step('Count all responses.',`${v.join('+')}=${total}`),
   step('Each relative frequency is its category count divided by the total.',undefined,table(['Travel','Count','Relative frequency'],v.map((n,i)=>[labels[i],n,`${n}/${total}`]),'Class travel survey · sample data')),
   step('The category fractions add up to one.',`\\frac{${v.join('+')}}{${total}}=1`)
  ],{answer:total,response:numeric(total),builder:{kind:'survey',counts:v}});}
 },
 'stacked-graph':{
  generate:r=>Array.from({length:4},()=>pick(r,2,12)),
  solve:([a,b,c,d])=>lesson(`Class A has ${a} walkers and ${b} bus riders. Class B has ${c} walkers and ${d} bus riders. Build a stacked-bar graph.`,[
   step('Use one stack per class and the same scale for both. Start the count axis at zero.',undefined,bars(['Class A','Class B'],[{name:'Walking',values:[a,c]},{name:'Bus',values:[b,d]}],'Travel to school · sample class survey')),
   step('The whole bar gives the class total; each colour gives a travel category.',`${a}+${b}=${a+b},\\quad${c}+${d}=${c+d}`),
   step('Stacked bars let us compare both totals and parts. Keep a title, legend, units, and a source so the graph is understandable.')
  ],{answer:`${a+b}, ${c+d}`,builder:{kind:'graph',counts:[a,b,c,d]}})
 },
 'infographic':{
  generate:r=>[pick(r,2,12),pick(r,2,12),pick(r,2,12)],
  solve:v=>{const total=safeInteger(sum(v)),max=Math.max(...v),labels=['Walk','Bus','Cycle'],leaders=labels.filter((_,i)=>v[i]===max);return lesson(`Make a travel-to-school infographic from ${v[0]} walking, ${v[1]} bus, and ${v[2]} cycling responses.`,[
   step('Choose one clear message supported by the data.',undefined,{type:'infographic',headline:`${leaders.join(' and ')} ${leaders.length>1?'share the highest count':'has the highest count'}`,statistic:`${total} responses`,caption:'Source: this sample class survey. This describes this sample, not every school.'}),
   step('Support the message with a labelled graph and include the source.',undefined,bars(labels,[{name:'Learners',values:v}],'Travel to school · sample survey')),
   step('Use readable labels and consistent scales. Do not imply that a sample proves something about every learner.')
  ],{answer:leaders.join(' and '),builder:{kind:'infographic'}});}
 },
 'statistics':{
  generate:r=>{const a=pick(r,0,90),b=pick(r,0,90);return [a,b,b,pick(r,0,90),pick(r,0,90),pick(r,0,1)];},
  solve:([a,b,c,d,e,dec])=>statisticsLesson([a,b,c,d,e],dec)
 },
 'misleading-graph':{
  generate:r=>{const a=pick(r,30,80);return [a,a+pick(r,1,6),a-2];},
  solve:([a,b,baseline])=>lesson(`Two groups have ${a} and ${b} responses. A graph starts its bars at ${baseline}. Is the visual impression fair?`,[
   step('A cut-off baseline makes the visible bar lengths look very different.',undefined,{...bars(['A','B'],[{name:'Responses',values:[a,b]}],`Cut-off baseline: ${baseline}`),baseline}),
   step('Show the same values with a zero baseline for an honest bar-length comparison.',undefined,bars(['A','B'],[{name:'Responses',values:[a,b]}],'Same data, baseline zero')),
   step(`The real difference is only ${b-a} responses. Ask who was surveyed and whether these results represent a wider group.`,`${b}-${a}=${b-a}`)
  ],{answer:b-a,response:numeric(b-a)})
 },
 'probability':{
  generate:r=>{const d=pick(r,2,12);return [pick(r,0,d),d,pick(r,2,8)];},
  solve:([n,d,k])=>lesson(`A bag has ${n} blue counters out of ${d} equal counters. Find P(blue) and predict blue draws in ${d*k} draws with replacement.`,[
   step('Count favourable outcomes and all equally likely outcomes.',`P(\\text{blue})=\\frac{${n}}{${d}}=${fraction(n,d)}`,line(1,[{value:n/d,label:`${n}/${d}`}],'0 means impossible; 1 means certain')),
   step('Multiply the chance by the number of draws. This predicts an average count, not a guarantee.',`\\frac{${n}}{${d}}\\times${d*k}=${n*k}`)
  ],{answer:fraction(n,d)})
 },
 'experimental-probability':{
  generate:r=>{const total=pick(r,10,30)*2;return [pick(r,0,total),total];},
  solve:([heads,total])=>lesson(`A fair coin gives ${heads} heads in ${total} tosses. Compare experimental and theoretical probabilities.`,[
   step('A fair coin has two equally likely outcomes.',`P(\\text{heads})=\\frac12`),
   step('Experimental probability uses the actual results.',`P_{\\text{experiment}}=\\frac{${heads}}{${total}}=${fraction(heads,total)}`),
   step('A short experiment need not match the theoretical chance. More trials often get closer, but do not guarantee an exact match.',undefined,table(['Probability','Fraction'],[['Theoretical','1/2'],['Experimental',`${heads}/${total}`]],'Compare the model with observed results'))
  ],{answer:fraction(heads,total),builder:{kind:'coin',total}})
 }
};
