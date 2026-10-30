// Supported grammar: ax + b = c, with signed integer constants and one x.
import {tex} from '../core/format.js';
import {linearSolution} from '../core/relationships.js';
const term=a=>a===1n?'x':a===-1n?'-x':`${a}x`;
const expression=(a,b)=>`${term(a)}${b>0n?`+${b}`:b<0n?String(b):''}`;
const highlight=s=>`\\textcolor{#2459a6}{${s}}`;
export function solveEquation(input){
 if(typeof input!=='string'||input.length>120)throw Error('Please use a shorter equation.');
 const s=input.replace(/\\(?:times|cdot)/g,'*').replace(/×/g,'*').replace(/−/g,'-').replace(/\s+/g,'');
 const match=s.match(/^([+-]?(?:\d+\*?)?)x([+-]\d+)?=([+-]?\d+)$/);
 if(!match)throw Error('Try x + 5 = 12, 3x = 18, or 2x + 3 = 11. Use integer constants and one x on the left.');
 const coefficient=match[1].replace('*','');
 const a=coefficient===''||coefficient==='+'?1n:coefficient==='-'?-1n:BigInt(coefficient);
 const b=BigInt(match[2]||'0'),c=BigInt(match[3]),solution=linearSolution(a,b,c),target=solution.target.n;
 const steps=[{math:`${expression(a,b)}=${c}`,text:'Keep both sides equal while we find x.'}];
 const wrap=(answer,solutionType,result=null)=>({kind:'equation',answer,solutionType,result,methods:[{name:'Keep both sides balanced',steps}]});
 if(a===0n){
  steps.push({math:`${b}=${c}`,text:'Zero times x is zero, so only the numbers remain.'});
  const all=b===c,answer=all?'x\\in\\mathbb{R}':'\\text{No solution}';
  steps.push({math:answer,text:all?'Both sides match for every real number. Any real number can be x.':'The sides cannot be equal. No value of x works.'});
  return wrap(answer,all?'all':'none');
 }
 if(b!==0n){
  const operation=b>0n?`-${b}`:`+${-b}`;
  steps.push({math:`${expression(a,b)}${highlight(operation)}=${c}${highlight(operation)}`,text:`${b>0n?'Subtract':'Add'} ${b>0n?b:-b} on both sides to keep them equal.`});
  steps.push({math:`${term(a)}=${target}`,text:`The extra ${b>0n?b:-b} cancels out. Now ${term(a)} equals ${target}.`});
 }
 const result=solution.result,answer=`x=${tex(result)}`;
 if(a!==1n){
  steps.push({math:`\\frac{${term(a)}}{${highlight(String(a))}}=\\frac{${target}}{${highlight(String(a))}}`,text:`Divide both sides by ${a} to leave one x.`});
  steps.push({math:answer,text:`x equals ${result.d===1n?result.n:`${result.n} divided by ${result.d}`}. This value makes the original sides equal.`});
 }else if(b===0n)steps[0].text='x is already by itself. Here is its value.';
 else steps.at(-1).text='x is by itself. This value makes the original sides equal.';
 return wrap(answer,'unique',{numerator:String(result.n),denominator:String(result.d)});
}
