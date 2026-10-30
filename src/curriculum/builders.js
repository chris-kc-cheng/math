import {renderVisual} from './visuals.js';
import {money} from '../math/families/grade5/common.js';
import {safeInteger,sum} from '../math/core/exact.js';
import {balance,linearSequence,divisionFacts} from '../math/core/relationships.js';
import {simulateCoin} from '../math/families/grade5/data.js';
import {spatialRules} from '../math/families/grade5/spatial.js';
import {analyzeReadings} from '../math/families/grade8/algebra.js';
import {drawProbability,simulateDraws} from '../math/families/grade8/data.js';
import {fitLine} from '../math/core/relationships.js';
import {plain} from '../math/core/format.js';
import {el} from '../ui/dom.js';
const field=(parent,label,value,min,max)=>{const wrap=el('label',label),input=el('input');input.type='number';input.value=value;input.min=min;input.max=max;input.step=1;wrap.append(input);parent.append(wrap);return input;};

export function mountBuilder(host,builder){
 if(!builder)return;
 const details=el('details'),summary=el('summary',builder.kind==='infographic'?'Create your own headline':'Explore it yourself'),form=el('form'),result=el('div');details.className='practice-builder';details.append(summary,form,result);result.setAttribute('aria-live','polite');host.append(details);
 let run;
 if(builder.kind==='data-analysis'){
  const inputs=builder.readings.map((n,i)=>field(form,`Reading ${i+1}`,n,-100,100)),threshold=field(form,'Threshold',builder.threshold,-100,100);
  run=()=>{const readings=inputs.map(input=>+input.value),facts=analyzeReadings(readings,+threshold.value);result.append(el('p',`${facts.count} of ${facts.total} readings exceed ${threshold.value}. One scan checks each reading once.`));renderVisual(result,{type:'table',columns:['Reading','Above threshold?'],rows:readings.map(n=>[n,n>+threshold.value?'Yes':'No']),caption:'Trace your modified data-analysis program'});};
 }else if(builder.kind==='paired-data'){
  const inputs=builder.points.map((p,i)=>{const input=field(form,`Distance at ${i+1}s`,p[1],0,100);input.step='0.1';return input;});
  run=()=>{const points=inputs.map((input,i)=>[i+1,+input.value]),fit=fitLine(points);renderVisual(result,{type:'points',points,xLabel:'Time (s)',yLabel:'Distance (m)',caption:'Your paired measurements · source: entered values'});result.append(el('p',`Fitted line: y = (${plain(fit.gradient)})x + (${plain(fit.intercept)}). This summarizes this sample; it does not prove causation.`));};
 }else if(builder.kind==='draw-experiment'){
  const red=field(form,'Red counters',builder.red,0,12),blue=field(form,'Blue counters',builder.blue,0,12),trials=field(form,'Pairs of draws',40,1,200),label=el('label','Replacement'),select=el('select');
  for(const [value,text] of [['0','Without replacement'],['1','With replacement']]){const option=el('option',text);option.value=value;select.append(option);}select.value=String(builder.replacement);label.append(select);form.append(label);
  run=()=>{if(+red.value + +blue.value<2){result.append(el('p','Use at least two counters.'));return;}const replacement=select.value==='1',successes=simulateDraws(+red.value,+blue.value,replacement,+trials.value);result.append(el('p',`${successes} red–red outcomes in ${trials.value} independent trials of two draws. Experimental probability ${successes}/${trials.value}; theoretical ${plain(drawProbability(+red.value,+blue.value,replacement))}. The bag resets for each trial.`));};
 }else if(builder.kind==='loop'){
  const start=field(form,'Start',builder.start,0,20),increment=field(form,'Add each time',builder.increment,0,10),times=field(form,'Repeat',builder.times,1,10);
  run=()=>{const values=linearSequence(+start.value + +increment.value,+increment.value,+times.value).map(safeInteger);renderVisual(result,{type:'table',columns:['Loop','Output'],rows:values.map((n,i)=>[i+1,n]),caption:'Program trace: add, then display'});};
 }else if(builder.kind==='condition'){
  const n=field(form,'Number',builder.number,0,100),d=field(form,'Group size',builder.divisor,2,12),label=el('label','Condition'),select=el('select');
  for(const text of ['remainder = 0','remainder ≠ 0']){const option=el('option',text);select.append(option);}label.append(select);form.append(label);
  run=()=>{const remainder=safeInteger(divisionFacts(+n.value,+d.value).remainder),condition=select.selectedIndex===0?remainder===0:remainder!==0;result.append(el('p',`Remainder: ${remainder}. The condition is ${condition?'true':'false'}, so the ${condition?'IF':'ELSE'} branch runs.`));};
 }else if(builder.kind==='budget'){
  const income=field(form,'Income (cents)',builder.income,0,100000),needs=field(form,'Needs (cents)',builder.needs,0,100000),wants=field(form,'Wants (cents)',builder.wants,0,100000);
  run=()=>{const remaining=safeInteger(balance(+income.value,[+needs.value,+wants.value]));result.append(el('p',remaining>=0?`Savings available: ${money(remaining)}. Your budget balances if you save the remainder.`:`Spending exceeds income by ${money(-remaining)}. Revise a category or explain another source of income.`));};
 }else if(builder.kind==='angle'){
  const angle=field(form,'Angle in degrees',builder.angle,0,180);run=()=>renderVisual(result,{type:'angles',angles:[+angle.value],protractor:true,caption:'Your constructed angle'});
 }else if(builder.kind==='survey'){
  const labels=['Walking','Bus','Cycling'],inputs=labels.map((label,i)=>field(form,label,builder.counts[i],0,100));
  run=()=>{const counts=inputs.map(input=>+input.value),total=safeInteger(sum(counts));if(total===0){result.append(el('p','Collect at least one response.'));return;}renderVisual(result,{type:'table',columns:['Travel','Count','Relative frequency'],rows:counts.map((n,i)=>[labels[i],n,`${n}/${total}`]),caption:'Your collected responses'});};
 }else if(builder.kind==='graph'){
  const labels=['A: walk','A: bus','B: walk','B: bus'],inputs=labels.map((label,i)=>field(form,label,builder.counts[i],0,100));
  run=()=>{const [a,b,c,d]=inputs.map(input=>+input.value);renderVisual(result,{type:'bars',labels:['Class A','Class B'],series:[{name:'Walking',values:[a,c]},{name:'Bus',values:[b,d]}],unit:'responses',caption:'Your stacked-bar graph · source: your entered counts'});};
 }else if(builder.kind==='coin'){
  const trials=field(form,'Number of tosses',builder.total,1,200);
  run=()=>{const heads=simulateCoin(+trials.value);result.append(el('p',`${heads} heads in ${trials.value} simulated tosses. Experimental probability: ${heads}/${trials.value}. Theoretical probability: 1/2.`));};
 }else if(builder.kind==='coordinates'){
  const x=field(form,'x coordinate',builder.x,0,10),y=field(form,'y coordinate',builder.y,0,10);
  run=()=>renderVisual(result,{type:'points',points:[[+x.value,+y.value]],caption:'Your plotted point',xLabel:'x',yLabel:'y'});
 }else if(builder.kind==='triangle'){
  const inputs=builder.sides.map((n,i)=>field(form,`Side ${i+1} (cm)`,n,1,20));
  run=()=>{const [a,b,c]=inputs.map(input=>+input.value);if(a+b<=c||a+c<=b||b+c<=a){result.append(el('p','These sides cannot make a triangle. Any two sides must add to more than the third.'));return;}const resultLesson=spatialRules['triangle-sides'].solve([a,b,c]);renderVisual(result,resultLesson.steps[2].visual);result.append(el('p',resultLesson.steps[3].text));};
 }else if(builder.kind==='infographic'){
  const label=el('label','Your headline'),input=el('input');input.maxLength=140;input.required=true;label.append(input);form.append(label);
  run=()=>{renderVisual(result,{type:'infographic',headline:input.value,statistic:'Check your claim against the data above.',caption:'Your data story'});result.append(el('p','Does the graph support this headline? Review its scope and source with a parent or partner.'));};
 }
 if(!run)return;
 const submit=el('button',builder.kind==='budget'?'Test budget':builder.kind==='infographic'?'Preview':'Run');submit.type='submit';form.append(submit);
 form.onsubmit=event=>{event.preventDefault();if(!form.reportValidity())return;result.replaceChildren();run();};
}
