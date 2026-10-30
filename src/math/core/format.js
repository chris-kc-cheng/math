import {integer,value,roundHalfUp,multiply,integerResult} from './exact.js';

// rawFraction may contain trusted teaching notation such as "3+2"; it never evaluates it.
export const rawFraction=(n,d)=>`\\frac{${n}}{${d}}`;
export function tex(number){const {n,d}=value(number);return d===1n?String(n):rawFraction(n,d);}
export function plain(number){const {n,d}=value(number);return d===1n?String(n):`${n}/${d}`;}
// Prefer an exact terminating decimal when the teaching context already uses decimals.
export function decimalOrFraction(number){
 const v=value(number);let denominator=v.d,twos=0,fives=0;
 while(denominator%2n===0n){denominator/=2n;twos++;}while(denominator%5n===0n){denominator/=5n;fives++;}
 const places=Math.max(twos,fives);if(denominator!==1n||places>100)return tex(v);
 return scaledDecimal(v.n*(10n**BigInt(places)/v.d),places);
}
export function scaledDecimal(n,places=2){
 n=integer(n);if(!Number.isInteger(places)||places<0||places>100)throw Error('Use 0 to 100 decimal places.');
 const sign=n<0n?'-':'',digits=String(n<0n?-n:n).padStart(places+1,'0');
 return places?`${sign}${digits.slice(0,-places)}.${digits.slice(-places)}`:`${n}`;
}
export function fixed(number,places=2){return scaledDecimal(integerResult(multiply(roundHalfUp(number,places),10n**BigInt(places))),places);}
export const money=cents=>`$${scaledDecimal(cents)}`;
export const mixed=(whole,n,d)=>n?(whole?`${whole}\\,${rawFraction(n,d)}`:rawFraction(n,d)):String(whole);
