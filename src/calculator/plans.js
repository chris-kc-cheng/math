import {runKeys} from './engine.js';
import {answerNumber} from '../math/verification.js';
import {compare,roundHalfUp} from '../math/core/exact.js';
import {decimalOrFraction} from '../math/core/format.js';

// Only trusted, bounded notation emitted by our own lesson generators is accepted.
// This is deliberately not a general LaTeX parser.
export function calculationKeys(input,nested=false){
 const text=String(input).replace(/×/g,'\\times').replace(/÷/g,'\\div').replace(/−/g,'-').replace(/\\(?:left|right|,|!|quad|qquad)/g,'').replace(/\\(?:text|mathrm)\{[^{}]*\}(?:\s*\^\{?[+-]?\d+\}?)?/g,'').replace(/\^\{\\circ\}|\^\\circ/g,'').replace(/\\circ/g,'').replace(/\s/g,'');let i=0;
 const group=(open,close)=>{if(text[i++]!==open)throw Error('Expected a grouped expression.');const start=i;let level=1;while(i<text.length&&level){if(text[i]===open)level++;if(text[i]===close)level--;i++;}if(level)throw Error('Unclosed expression.');return text.slice(start,i-1);};
 const keys=[];
 while(i<text.length){
  if(keys.length>160)throw Error('Calculation is too long.');
  const rest=text.slice(i),mixed=rest.match(/^(\d+)\\frac\{(\d+)\}\{(\d+)\}/);
  if(mixed){keys.push(...mixed[1],'2nd','7',...mixed[2],'down',...mixed[3],'right');i+=mixed[0].length;continue;}
  if(rest.startsWith('\\frac')){i+=5;const numerator=group('{','}'),denominator=group('{','}'),top=calculationKeys(numerator,true);
   // A plain number typed before n/d becomes the numerator (the guidebook's short form); anything else needs the template first.
   if(top.every(k=>numericKeys.has(k)))keys.push(...top,'fraction',...calculationKeys(denominator,true),'right');else keys.push('fraction',...top,'down',...calculationKeys(denominator,true),'right');continue;}
  if(rest.startsWith('\\sqrt')){i+=5;keys.push('2nd','square',...calculationKeys(group('{','}'),true),'right');continue;}
  const trig=rest.match(/^\\(sin|cos|tan)(\^\{-1\})?/);
  if(trig){
   i+=trig[0].length;let argument;
   if(text[i]==='(')argument=calculationKeys(group('(',')'),true);
   else if(text.startsWith('\\frac',i)){const start=i;i+=5;group('{','}');group('{','}');argument=calculationKeys(text.slice(start,i),true);}
   else{const number=(text.slice(i).match(/^\d+(?:\.\d+)?/)||[])[0];if(!number)throw Error('Unsupported trigonometric argument.');i+=number.length;argument=[...number];}
   // sin, cos and tan are multi-tap keys: a second press selects the inverse function.
   keys.push(trig[1],...(trig[2]?[trig[1]]:[]),...argument);if(i<text.length||nested)keys.push('right');continue;
  }
  const command=rest.match(/^\\(times|cdot|div|pi|%)/);if(command){keys.push(...({times:['*'],cdot:['*'],div:['/'],pi:['π'],'%':['2nd','/']}[command[1]]));i+=command[0].length;continue;}
  const c=text[i++];
  if(c==='^'){let exponent;if(text[i]==='{')exponent=group('{','}');else{exponent=(text.slice(i).match(/^-?\d+/)||[])[0];if(!exponent)throw Error('Unsupported exponent.');i+=exponent.length;}keys.push('^',...calculationKeys(exponent,true),'right');}
  else if(/[\d.()+*/]/.test(c))keys.push(c);
  else if(c==='-')keys.push(!keys.length||['(','+','-','*','/'].includes(keys.at(-1))?'neg':'-');
  else throw Error('Unsupported calculator notation.');
 }
 if(!keys.length)throw Error('An empty calculation is not supported.');return keys;
}
const numericKeys=new Set('0123456789.'.split(''));
export const keyCategory=key=>numericKeys.has(key)?'number':['+','-','*','/','^','square','fraction','π','EE','sin','cos','tan'].includes(key)?'operation':'navigation';
export const keyLabel=key=>({fraction:'n/d',square:'x²',toggle:'◀▶≈',neg:'(−)',enter:'enter',right:'→',left:'←',down:'↓','*':'×','/':'÷'}[key]||key);
export function calculatorPlan({template={},lesson={},input='',force=false}={}){
 if(input&&/\d\s*\/\s*\d/.test(input))input=input.replace(/(\d+)\s*\/\s*(\d+)/g,'\\frac{$1}{$2}');
 const grade=Number(template.skillId?.match(/^g(10|[1-9])-/)?.[1]||5),rule=template.rule||'',source=[input,lesson.formula,...(lesson.steps||[]).map(s=>s.math)].filter(Boolean),candidates=[];
 const scienceSource=[...source,...(lesson.verification?.steps||[]).map(s=>s.math).filter(Boolean)];if(/scientific/.test(rule))source.push(...scienceSource.filter(s=>/\\times\s*10\^/.test(s)));
 for(const math of source)for(const expression of String(math).split(/=|\\approx/)){
  try{const keyExpression=/percent|interest|tax|discount/.test(rule)?expression.replace(/\\frac\{(\d+)\}\{100\}/g,'$1\\%'):expression;const keys=calculationKeys(keyExpression);if(!keys.some(k=>keyCategory(k)==='operation'))continue;const state=runKeys([...keys,'enter']);if(state.error)continue;candidates.push({expression,keys:[...keys,'enter'],state});}catch{}
 }
 const features=new Set();for(const c of candidates)for(const k of c.keys)features.add(k);
 if(/fraction|mixed|equivalent/.test(rule))features.add('fraction');
 if(/percent|interest|tax|discount/.test(rule))features.add('percent');
 if(/scientific|powers-ten/.test(rule))features.add('EE');
 if(/decimal|money|cash|budget|rate|metric|percent|circle/.test(rule)||source.some(s=>/\d\.\d/.test(s)))features.add('.');
 if(features.has('fraction')&&/mixed|^fraction$/.test(rule))features.add('mixed');
 if(features.has('fraction')&&/convert|equiv|decimal|mixed|^fraction$/.test(rule))features.add('toggle');
 if(!features.size)for(const k of ['+','-','*','/','.'])features.add(k);
 const advanced=['^','square','π','EE','percent'].some(k=>features.has(k)),large=candidates.some(c=>/\d{3,}/.test(c.expression)&&c.keys.some(k=>['*','/'].includes(k))),complex=candidates.some(c=>c.keys.filter(k=>['*','/','+','-'].includes(k)).length>=3);
 const usesTrig=['sin','cos','tan'].some(k=>features.has(k)),recommended=Boolean(candidates.length&&(force||grade>=4&&(advanced||large||complex||usesTrig||/decimal|percent|interest|tax|pythagor|scientific|sec-(?:volume|appreciation|borrowing|unit-convert|rates-percent|quadratic-formula|power-value|scientific)/.test(rule))));
 let matching=[];try{const expected=answerNumber(lesson.answer),places=(String(lesson.answer).split('.')[1]||'').length;matching=candidates.filter(c=>compare(c.state.answer.value,expected)===0||places>0&&compare(roundHalfUp(c.state.answer.value,places),expected)===0);}catch{}
 // For powers the exponent key is the point of the lesson, so prefer it to repeated multiplication.
 const preferPower=/power|exponent/.test(rule),selected=[...(matching.length?matching:candidates)].sort((a,b)=>preferPower&&a.keys.includes('^')!==b.keys.includes('^')?(b.keys.includes('^')?1:-1):b.keys.length-a.keys.length)[0];
 const alternatives=[];if(selected&&/scientific/.test(rule)){
  const scientific=scienceSource.map(s=>String(s).match(/([+-]?\d+(?:\.\d+)?)\\times\s*10\^\{?(-?\d+)\}?/)).find(Boolean);
  if(scientific){const [,coefficient,exponent]=scientific,ee=[...calculationKeys(coefficient),'EE',...calculationKeys(exponent),'right','enter'];const eeState=runKeys(ee);if(!eeState.error){features.add('EE');features.add('mode');features.add('down');features.add('right');const number=decimalOrFraction(eeState.answer.value);alternatives.push({methodLabel:'EE entry',methodHint:'EE enters ×10 to a power. Use (−) for a negative exponent.',keys:ee},{methodLabel:'SCI display',methodHint:'In SCI display, the number after E is the power of ten.',keys:[...calculationKeys(number),'enter','mode','down','right','enter','clear','enter']});}}
 }
 // Vendor practice: set the angle mode before any trigonometry (MODE, enter on DEG, clear). sin/cos/tan are multi-tap: press twice for the inverse.
 const angleCheck=selected&&usesTrig;if(angleCheck){for(const k of ['mode','down','right','left','sin','cos','tan'])features.add(k);}
 // Grades 9–10 answers are usually decimals and bracketed, so keep the decimal point and brackets on the keypad.
 if(/^sec-/.test(rule)&&selected){for(const k of ['.','(',')'])features.add(k);}
 const hint=angleCheck?`First check the angle mode: MODE, enter on DEG, then clear. ${selected.keys.some((k,i)=>k===selected.keys[i-1]&&['sin','cos','tan'].includes(k))?'Press the function key twice for the inverse (sin⁻¹, cos⁻¹, tan⁻¹).':''}`.trim():undefined;
 return {recommended,features:[...features],title:template.title||'Your calculation',...(selected?{expression:selected.expression,keys:angleCheck?['mode','enter','clear',...selected.keys]:selected.keys,...(hint?{methodHint:hint}:{}),methodLabel:alternatives.length?'×10ⁿ':undefined,alternatives}:{}),id:(template.id||input||'calculator')+':'+(selected?.expression||'')};
}

let active={recommended:false,features:['+','-','*','/','.','(',')'],title:'Your calculation',id:'default'};const listeners=new Set();
export const currentCalculatorContext=()=>active;
export function setCalculatorContext(context,{onlyIfEmpty=false}={}){if(onlyIfEmpty&&active.id!=='default')return;active=context;listeners.forEach(fn=>fn(active));}
export const clearCalculatorContext=()=>setCalculatorContext({recommended:false,features:['+','-','*','/','.'],title:'Your calculation',id:'default'});
export function subscribeCalculator(fn){listeners.add(fn);return()=>listeners.delete(fn);}
