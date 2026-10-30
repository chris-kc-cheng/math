import {rational,multiply,subtract,compare,add} from '../core/exact.js';
import {tex,fixed} from '../core/format.js';
import {fitLine} from '../core/relationships.js';
import {pick,step,lesson,table,numeric} from '../lesson.js';
export const makePairs=(start,rate,outlier)=>Array.from({length:5},(_,i)=>[i+1,(start+rate*i+(i===4?outlier:0))/10]);
const graph=points=>({type:'points',points,xLabel:'Time (s)',yLabel:'Distance (m)',caption:'Paired continuous measurements · supplied sample data'});
export function describeRelationship(points){const fit=fitLine(points),strength=compare(fit.rSquared,rational(64,100))>=0?'strong':compare(fit.rSquared,rational(4,100))>0?'weak':'none';return {fit,strength,direction:strength==='none'?'no clear direction':fit.direction>0?'positive':'negative'};}
export function drawProbability(red,blue,replacement){const total=red+blue;if(total<2||red<0||blue<0)throw Error('Use at least two counters.');return multiply(rational(red,total),rational(replacement?red:Math.max(0,red-1),replacement?total:total-1));}
export function simulateDraws(red,blue,replacement,trials,rng=Math.random){if(![red,blue,trials].every(Number.isSafeInteger)||red<0||blue<0||red+blue<2||trials<1||trials>200)throw Error('Use nonnegative counter counts and 1 to 200 trials.');let successes=0;for(let i=0;i<trials;i++){const first=rng()<red/(red+blue),second=rng()<(replacement?red:Math.max(0,red-(first?1:0)))/(red+blue-(replacement?0:1));if(first&&second)successes++;}return successes;}
const pairGenerator=r=>[pick(r,50,80),pick(r,-5,5),pick(r,0,1)?0:pick(r,-20,40)];
export const dataRules8={
 'g8-data-variables':{
  generate:r=>[pick(r,0,1)],
  solve:([two])=>lesson(two?'Which data would let you investigate a relationship between time spent practising and accuracy?':'Which data would let you describe the distribution of learners’ heights?',[
   step(two?'Record both measurements for each learner. Keeping them paired makes it possible to investigate a relationship.':'One height measurement per learner is one-variable data.'),
   step('Choose data that answers the actual question; record units, collection method, and a suitable sample.')
  ],{answer:two?'Two variables':'One variable',response:{kind:'choice',options:['One variable','Two variables'],answer:two?'Two variables':'One variable'}})
 },
 'g8-paired-data':{
  generate:pairGenerator,
  solve:([start,rate,outlier])=>{const points=makePairs(start,rate,outlier);return lesson('Organize the supplied paired measurements, then explore a scatter plot. For a real investigation, collect both measurements at each observation.',[
   step('Keep each pair in the same row and record the measurement units.',undefined,table(['Time (s)','Distance (m)'],points,'Supplied measurements: one pair per observation')),
   step('Use a scatter plot for two quantitative variables. A bar graph of categories would answer a different question.',undefined,graph(points)),
   step('Use an honest scale, title, axis labels, and source. Measurement error and the way a sample was collected affect conclusions.')
  ],{answer:points,builder:{kind:'paired-data',points}});}
 },
 'g8-data-story':{
  generate:pairGenerator,
  solve:([start,rate,outlier])=>{const points=makePairs(start,rate,outlier),description=describeRelationship(points);return lesson('Create an infographic that tells a justified story about the supplied paired measurements.',[
   step(`These measurements show ${description.strength==='none'?'no clear linear relationship':`a ${description.strength} ${description.direction} linear relationship`}.`,undefined,graph(points)),
   step('Include the sample size, units, a table or scatter plot, and the source. Do not turn an association into a claim of cause and effect.',undefined,table(['Time (s)','Distance (m)'],points,'Source: supplied practice data')),
   step('Write a headline supported by the evidence, and describe any outlier or limitation.')
  ],{answer:description.strength,builder:{kind:'infographic'}});}
 },
 'g8-correlation':{
  generate:pairGenerator,
  solve:([start,rate,outlier])=>{const points=makePairs(start,rate,outlier),clean=makePairs(start,rate,0),current=describeRelationship(points),original=describeRelationship(clean);return lesson('Describe the direction and strength of the relationship. Compare with and without the changed final reading.',[
   step('Look for points following a rising or falling straight-line trend.',undefined,graph(points)),
   step(`With the changed reading: ${current.strength}, ${current.direction}. Without it: ${original.strength}, ${original.direction}.`),
   step('Outliers can change a trend. Association does not establish causation. Strength labels summarize this sample, not a universal cut-off.')
  ],{answer:{strength:current.strength,direction:current.direction}});}
 },
 'g8-venn':{
  generate:r=>{const overlap=pick(r,1,5),onlyA=pick(r,1,8),onlyB=pick(r,1,8),neither=pick(r,0,5);return [onlyA,onlyB,overlap,neither];},
  solve:([a,b,both,neither])=>{const total=a+b+both+neither,union=a+b+both;return lesson(`A survey has ${a} in only A, ${b} in only B, ${both} in both, and ${neither} in neither. Find P(A or B).`,[
   step('Put the overlap in both circles, but count each learner only once.',undefined,{type:'venn',onlyA:a,onlyB:b,both,neither,caption:'Mutually exclusive regions of a two-set Venn diagram'}),
   step('Add all regions to get the population. Add the three inside regions for the union.',`${a}+${b}+${both}+${neither}=${total},\\quad P(A\\cup B)=\\frac{${union}}{${total}}=${tex(rational(union,total))}`)
  ],{answer:tex(rational(union,total))});}
 },
 'g8-dependent-probability':{
  generate:r=>[pick(r,1,6),pick(r,1,6),pick(r,0,1)],
  solve:([red,blue,replacement])=>{const total=red+blue,secondRed=replacement?red:Math.max(0,red-1),secondTotal=replacement?total:total-1,result=drawProbability(red,blue,replacement);return lesson(`Draw two counters from ${red} red and ${blue} blue counters, ${replacement?'replacing':'not replacing'} the first. Find P(both red).`,[
   step(replacement?'Replacement keeps the second probability unchanged, so these draws are independent.':'Without replacement, the second chance depends on the first draw.',undefined,{type:'probability-tree',red,blue,replacement,caption:'Two draws: branch probabilities depend on whether the first counter is replaced'}),
   step('Multiply probabilities along the red–red path.',`P(RR)=\\frac{${red}}{${total}}\\times\\frac{${secondRed}}{${secondTotal}}=${tex(result)}`),
   step('Compare the theoretical probability with repeated simulated trials. An experiment can differ from its prediction.')
  ],{answer:tex(result),builder:{kind:'draw-experiment',red,blue,replacement}});}
 }
};
