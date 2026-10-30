import {define,requireThat,round,graph} from './common.js';

const clean=n=>Number.isInteger(n)?String(n):String(n);
const median=a=>{const m=a.length>>1;return a.length%2?a[m]:(a[m-1]+a[m])/2;};
/** Five-number summary using the "exclude the median" quartile method taught in Ontario classrooms. */
export function fiveNumbers(values){
 const a=[...values].sort((x,y)=>x-y),h=a.length>>1,lower=a.slice(0,h),upper=a.slice(a.length%2?h+1:h);
 return {min:a[0],q1:median(lower),median:median(a),q3:median(upper),max:a.at(-1),sorted:a};
}
const SHUFFLE=[3,0,6,2,5,1,4,7];
const dataset=(start,gaps)=>{
 const values=[start];for(const g of gaps)if(g>0)values.push(values.at(-1)+g);
 requireThat(values.length>=7&&new Set(values).size===values.length,'Use seven or eight different values.');
 const display=values.map((v,i)=>[SHUFFLE[i%8]+Math.floor(i/8)*8,v]).sort((a,b)=>a[0]-b[0]).map(p=>p[1]);
 return {values,display};
};
const summary=(f)=>`\\min=${f.min},\\;Q_1=${f.q1},\\;\\text{median}=${f.median},\\;Q_3=${f.q3},\\;\\max=${f.max}`;
const box=(f,caption)=>({type:'secondary-boxplot',min:f.min,q1:f.q1,median:f.median,q3:f.q3,max:f.max,caption});

// ---------- D1.2 Quartiles and box plots ----------
define('sec-quartiles',['start','g1','g2','g3','g4','g5','g6','g7'],[[2,40],[1,9],[1,9],[1,9],[1,9],[1,9],[1,9],[0,9]],[12,3,2,4,1,5,2,0],[
 (...p)=>{const {values,display}=dataset(p[0],p.slice(1));const f=fiveNumbers(values);return {prompt:`Find the median of these test scores: ${display.join(', ')}.`,steps:[['Order the data from least to greatest.',f.sorted.join(',\\;')],[values.length%2?'With an odd number of values the median is the middle one.':'With an even number of values the median is the mean of the two middle values.',`\\text{median}=${f.median}`]],answer:f.median};},
 (...p)=>{const {values,display}=dataset(p[0],p.slice(1));const f=fiveNumbers(values);return {prompt:`Find the first quartile Q1 of these values: ${display.join(', ')}.`,steps:[['Order the data.',f.sorted.join(',\\;')],['Q1 is the median of the lower half (the median itself is left out when the count is odd).',summary(f)]],answer:f.q1,visual:box(f,'Box plot of the data')};},
 (...p)=>{const {values,display}=dataset(p[0],p.slice(1));const f=fiveNumbers(values);return {prompt:`Find the third quartile Q3 of these values: ${display.join(', ')}.`,steps:[['Order the data.',f.sorted.join(',\\;')],['Q3 is the median of the upper half.',summary(f)]],answer:f.q3};},
 (...p)=>{const {values,display}=dataset(p[0],p.slice(1));const f=fiveNumbers(values),iqr=f.q3-f.q1;return {prompt:`What is the interquartile range (IQR) of these values: ${display.join(', ')}?`,steps:[['Order the data and find the quartiles.',summary(f)],['IQR = Q3 − Q1.',`${f.q3}-${f.q1}=${iqr}`]],answer:iqr,visual:box(f,'Box plot of the data')};},
 (...p)=>{const {values,display}=dataset(p[0],p.slice(1));const f=fiveNumbers(values);return {prompt:`What is the range of these values: ${display.join(', ')}?`,steps:[['Range = greatest value − least value.',`${f.max}-${f.min}=${f.max-f.min}`]],answer:f.max-f.min};},
 (...p)=>{const {values,display}=dataset(p[0],p.slice(1));const f=fiveNumbers(values),iqr=f.q3-f.q1,fence=f.q3+1.5*iqr;return {prompt:`Values above Q3 + 1.5 × IQR are treated as outliers. What is this upper fence for ${display.join(', ')}?`,steps:[['Find Q1 and Q3.',summary(f)],['IQR = Q3 − Q1.',`${f.q3}-${f.q1}=${iqr}`],['Upper fence = Q3 + 1.5 × IQR.',`${f.q3}+1.5(${iqr})=${fence}`]],answer:Number.isInteger(fence)?fence:fence.toFixed(1)};},
 (...p)=>{const {values}=dataset(p[0],p.slice(1));const f=fiveNumbers(values),spread=f.q3-f.q1,fence=f.q3+1.5*spread,outlier=values.some(v=>v>fence);const lastGap=values.at(-1)-values.at(-2);return {prompt:`The box plot shows data with Q1 = ${f.q1}, median = ${f.median} and Q3 = ${f.q3}, and a maximum of ${f.max}. Is the maximum an outlier by the 1.5 × IQR rule? Answer yes or no.`,steps:[['Upper fence = Q3 + 1.5 × IQR.',`${f.q3}+1.5(${spread})=${fence}`],[`Compare the maximum ${f.max} with ${fence}.`,`${f.max}${outlier?'>':'\\le'}${fence}`],[outlier?'It is above the fence, so it is an outlier.':'It does not exceed the fence, so it is not an outlier.']],answer:outlier?'yes':'no',options:['yes','no'],visual:box(f,'A box plot with its five-number summary')};},
 (...p)=>{const {values,display}=dataset(p[0],p.slice(1));const f=fiveNumbers(values),total=values.reduce((x,y)=>x+y,0),mean=total/values.length;return {prompt:`Find the mean of these values, to the nearest tenth: ${display.join(', ')}.`,steps:[['Add the values.',`${values.join('+')}=${total}`],['Divide by how many values there are.',`${total}\div${values.length}=${mean.toFixed(3)}\ldots`],[`The mean is about ${round(mean,1)}. Compare it with the median ${f.median}: an extreme value pulls the mean more than the median.`]],answer:round(mean,1)};}
]);

// ---------- D1.3 Scatter plots, correlation and models ----------
const NOISE=[1,-1,0,2,-2,1,-1,0];
const scatter=(m,b,count=8,noise=1)=>Array.from({length:count},(_,i)=>[i+1,m*(i+1)+b+NOISE[i]*noise]);
const scatterVisual=(points,caption,xLabel='Hours',yLabel='Score')=>({type:'points',points,xLabel,yLabel,caption});
define('sec-correlation',['m','b','x'],[[-5,6],[10,40],[1,14]],[3,10,12],[
 (m,b,x)=>{requireThat(m!==0,'Use a nonzero slope.');const pts=scatter(m,b),p=pts[0],q=pts[5],rate=(q[1]-p[1])/(q[0]-p[0]);requireThat(Number.isInteger(rate),'Use two points with a whole-number rate.');return {prompt:`A line of best fit passes through (${p[0]}, ${p[1]}) and (${q[0]}, ${q[1]}). What is its slope?`,steps:[['Slope = rise ÷ run.',`\\frac{${q[1]}-${p[1]}}{${q[0]}-${p[0]}}`],[`${q[1]-p[1]}÷${q[0]-p[0]}=${rate}`]],answer:rate,visual:scatterVisual(pts,'A scatter plot')};},
 (m,b,x)=>{requireThat(m!==0&&x>=9,'Predict beyond the data.');const y=m*x+b;return {prompt:`A scatter plot is modelled by the line of best fit y = ${m}x ${b<0?'−':'+'} ${Math.abs(b)}. What does the model predict when x = ${x}?`,steps:[['Substitute x into the model.',`y=${m}(${x})+${b}=${y}`],['Because x = '+x+' is outside the data (1 to 8), this is an extrapolation, so be cautious.']],answer:y};},
 (m,b)=>{requireThat(m!==0,'Use a nonzero slope.');const kind=m>0?'positive':'negative';return {prompt:`In the scatter plot, y generally ${m>0?'increases':'decreases'} as x increases, and the points lie close to a line. Describe the correlation.`,steps:[['Look at the direction of the trend.',m>0?'Up to the right: positive.':'Down to the right: negative.'],['The points are close to a line, so the correlation is strong.']],answer:`strong ${kind}`,options:['strong positive','strong negative','weak positive','no correlation'],visual:scatterVisual(scatter(m,b),'A scatter plot')};},
 (m,b,x)=>{const inside=x<=8,pts=scatter(m||1,b);return {prompt:`The data in a scatter plot have x-values from 1 to 8. A model predicts y at x = ${x}. Is this an interpolation or an extrapolation?`,steps:[['Interpolation estimates inside the range of the data; extrapolation goes outside it.'],[`x = ${x} is ${inside?'inside':'outside'} the range 1 to 8.`]],answer:inside?'interpolation':'extrapolation',options:['interpolation','extrapolation']};},
 (m,b,x)=>{const r=[0.95,-0.9,0.35,-0.2,0.05,0.7][x%6],kind=Math.abs(r)>=0.7?'strong':Math.abs(r)>=0.3?'moderate':'weak';return {prompt:`A regression tool reports a correlation coefficient r = ${r}. Describe the strength of the linear relationship as strong, moderate or weak.`,steps:[['The closer |r| is to 1, the stronger the linear relationship. The sign tells the direction.'],[`|r| = ${Math.abs(r)} is ${kind}.`]],answer:kind,options:['strong','moderate','weak']};},
 (m,b,x)=>{requireThat(m!==0&&x<=8,'Use an observed point.');const pts=scatter(m,b),obs=pts[x-1][1],pred=m*x+b,res=obs-pred;requireThat(res!==0,'Use a point off the line.');return {prompt:`The model y = ${m}x ${b<0?'−':'+'} ${Math.abs(b)} is fitted to the data. At x = ${x} the observed y-value is ${obs}. What is the residual (observed − predicted)?`,steps:[['Predicted value from the model.',`${m}(${x})+${b}=${pred}`],['Residual = observed − predicted.',`${obs}-${pred}=${res}`]],answer:res,visual:scatterVisual(pts,'A scatter plot with the model line')};}
]);
