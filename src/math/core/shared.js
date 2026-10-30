import {multiply} from './exact.js';

// Small helpers that every question family used to define for itself.
export const requireThat=(condition,message)=>{if(!condition)throw Error(message);};
// A question "style" index picks one stem from a list; anything else is rejected.
export const pickStyle=(list,style)=>{requireThat(Number.isInteger(style)&&style>=0&&style<list.length,'Choose a supported question style.');return list[style];};
export const whole=(...ns)=>requireThat(ns.every(n=>Number.isSafeInteger(n)),'Use whole numbers.');

// Number formatting for prompts: thousands separators the Canadian way.
export const fmt=n=>Number(n).toLocaleString('en-CA');
export const frac=(n,d)=>`\\frac{${n}}{${d}}`;
export const ordinal=n=>{const s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);};
export const moneyText=r=>{const cents=Number(multiply(r,100).n);return cents%100?`$${fmt(Math.floor(cents/100))}.${String(cents%100).padStart(2,'0')}`:`$${fmt(cents/100)}`;};
// Put spaces around the interior + and - of an expression: 3x+2 becomes 3x + 2.
export const spaceSigns=text=>text.replace(/(?<=.)([+-])/g,' $1 ');

// Whole-number helpers for small question parameters (exact rationals live in exact.js).
export const gcdN=(a,b)=>b?gcdN(b,a%b):Math.abs(a);
export const lcmN=(a,b)=>a/gcdN(a,b)*b;
// A fraction in lowest terms terminates as a decimal only when its denominator has no prime factors other than 2 and 5.
export const terminating=r=>{let d=Number(r.d);while(d%2===0)d/=2;while(d%5===0)d/=5;return d===1;};
