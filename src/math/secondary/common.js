import {lesson,step} from '../lesson.js';
import {requireThat} from '../elementary/common.js';
import {linear,sumOfTerms} from '../core/terms.js';
export {requireThat,linear,sumOfTerms};
export {rational,add,subtract,multiply,divide,compare,power,roundHalfUp,gcd,lcm} from '../core/exact.js';
export {tex,decimalOrFraction,scaledDecimal} from '../core/format.js';

// Grades 9–10 rules share one authoring shape. A style is a thunk that returns a question spec:
//   {prompt, steps:[[text, math?, visual?], ...], answer, formula?, visual?, options?, check?:[text, math, ok]}
// Only the chosen style runs, so a style may reject parameters it cannot use without affecting the others.
export const rules={},meta={};
/** Register a rule. `domains` has one entry per parameter: [min,max] for a range or {list:[...]} for allowed values. */
export function define(name,params,domains,example,styles){
 requireThat(params.length===domains.length&&params.length===example.length,`${name}: parameters, domains and example must align.`);
 rules[name]=values=>{
  requireThat(Array.isArray(values)&&values.length===params.length+1&&values.every(n=>Number.isSafeInteger(n)&&Math.abs(n)<=1000000),'Use bounded whole-number activity parameters.');
  const index=values.at(-1);requireThat(index>=0&&index<styles.length,'Choose a supported question style.');
  return make(styles[index](...values.slice(0,-1)));
 };
 // The last parameter of every rule is `style`, which picks the story, representation or unknown being asked for.
 meta[name]={params:[...params,'style'],domains:[...domains,{list:styles.map((_,i)=>i)}],example:[...example,0],styles:styles.length};
}
export const NUMBER_PATTERN=/^-?\d+(?:\.\d+)?$/;
export function make(spec){
 const {prompt,steps,answer,formula,visual,options,check}=spec;
 requireThat(prompt&&steps?.length&&answer!==undefined,'A question needs a prompt, steps and an answer.');
 const text=String(answer);
 const shown=String(prompt).replace(/\^2/g,'²').replace(/\^3/g,'³').replace(/ - /g,' − ');
 const response=options?{kind:'choice',options,answer:text}:NUMBER_PATTERN.test(text)?{kind:'number',answer:text}:undefined;
 if(options)requireThat(options.includes(text),'The answer must be one of the options.');
 // A graph marks the solution, so it belongs to the worked steps, not beside the question. Tables, box plots, triangles and code are data the question needs.
 const reveals=visual?.type==='secondary-graph',rows=steps.map((item,i)=>{const [t,m,v]=Array.isArray(item)?item:[item];return step(t,m,v||(reveals&&i===steps.length-1?visual:undefined));});
 const built=lesson(shown,rows,{formula,visual:reveals?undefined:visual,answer:text,response});
 if(!check)return built;
 const [checkText,math,valid]=check;
 return {...built,verification:{method:'Check the answer',valid:Boolean(valid),steps:[{stage:'verification',text:checkText,math,valid:Boolean(valid)}]}};
}
/** Round a computed number to `places` decimals. Refuses values that sit on a rounding tie, so no learner is marked wrong on a coin-flip. */
export function round(x,places=0){
 requireThat(Number.isFinite(x),'The value is not a real number.');
 const scale=10**places,shifted=Math.abs(x)*scale,fraction=shifted-Math.floor(shifted);
 requireThat(Math.abs(fraction-0.5)>1e-6,'Avoid a rounding tie.');
 const rounded=Math.round(shifted)/scale*(x<0?-1:1);
 return places?rounded.toFixed(places):String(Object.is(rounded,-0)?0:rounded);
}
export const unit=(n,word)=>`${n} ${word}`;
export const par=n=>n<0?`(${n})`:String(n);
/** a/b in lowest terms as an exact fraction string (or a whole number). */
export function frac(n,d=1){
 requireThat(Number.isInteger(n)&&Number.isInteger(d)&&d!==0,'Use whole-number fractions.');
 if(d<0){n=-n;d=-d;}
 let a=Math.abs(n),b=d;while(b)[a,b]=[b,a%b];
 const g=a||1;n/=g;d/=g;
 return d===1?String(n):`\\frac{${n}}{${d}}`;
}
export const fracOf=(n,d)=>{requireThat(d!==0,'The denominator cannot be zero.');if(d<0){n=-n;d=-d;}const g=gcd2(n,d);return [n/g,d/g];};
function gcd2(a,b){a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a||1;}
export const g2=gcd2;
export const choiceOptions=(...options)=>options;
export const isSquare=n=>n>=0&&Number.isInteger(Math.sqrt(n));
export const times=(a,b)=>`${a}\\times${par(b)}`;
// Whole-number arithmetic must stay exact: refuse parameter sets that leave the safe range.
export const exact=n=>{requireThat(Number.isSafeInteger(n),'The numbers are too large.');return n;};
/** Plot-ready sample points for y=f(x) on [min,max] in steps. */
export const sample=(f,min,max,step=0.5)=>{const out=[];for(let x=min;x<=max+1e-9;x+=step)out.push([Number(x.toFixed(4)),Number(f(x).toFixed(4))]);return out;};
export const graph=(caption,curves,extra={})=>({type:'secondary-graph',caption,curves,...extra});
