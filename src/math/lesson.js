import {rational} from './core/exact.js';
import {tex} from './core/format.js';
export {scaledDecimal as decimal,money} from './core/format.js';
export {equalDecimals as equalDecimal} from './core/exact.js';
export function fraction(n,d=1){if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||d<=0)throw Error('Use an exact fraction with a positive denominator.');return tex(rational(n,d));}
export const pick=(rng,min,max)=>min+Math.floor(rng()*(max-min+1));
export const step=(text,math,visual)=>({text,...(math!==undefined?{math}:{}),...(visual?{visual}:{})});
export const table=(columns,rows,caption)=>({type:'table',columns,rows,caption});
export const bars=(labels,series,caption,unit='responses')=>({type:'bars',labels,series,caption,unit});
export const line=(max,points,caption)=>({type:'line',max,points,caption});
export const polygon=(points,caption)=>({type:'polygon',points,caption});
export function lesson(prompt,steps,{formula,visual,answer,response,builder,reflection=false}={}){
 return {kind:'worked',prompt,formula,visual,answer,response,builder,reflection,steps:[step('Read the question.',formula),...steps]};
}
export const numeric=answer=>({kind:'number',answer:String(answer)});
export const choice=(options,correct)=>({kind:'choice',options,answer:options[correct]});
export function validateValues(values){
 if(!Array.isArray(values)||!values.length||values.length>30||!values.every(v=>Number.isSafeInteger(v)&&v>=0&&v<=1000000))throw Error('Use bounded nonnegative whole-number activity values.');
}
