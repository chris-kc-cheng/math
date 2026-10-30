import {rational,add} from '../math/core/exact.js';
// Five distinct exact values; a stable shuffle keeps choices still after a re-render.
export function moleChoices(answer,seed=0){
 const text=v=>v.d===1n?String(v.n):`${v.n}/${v.d}`;
 const lower=answer.n>=0n?Number(answer.n<4n?answer.n:4n):4;
 const start=lower?Math.abs(seed)% (lower+1):0;
 const offsets=Array.from({length:5},(_,i)=>i-start);
 const choices=offsets.map(n=>text(add(answer,rational(n,answer.d))));
 let state=(seed+1)>>>0;
 for(let i=4;i>0;i--){state=(Math.imul(state,1664525)+1013904223)>>>0;const j=state%(i+1);[choices[i],choices[j]]=[choices[j],choices[i]];}
 return choices;
}
