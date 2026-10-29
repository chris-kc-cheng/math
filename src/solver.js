import {solveEquation} from './equations.js';
const gcd = (a,b) => b ? gcd(b,a%b) : a < 0n ? -a : a;
function rational(n,d=1n){if(!d)throw Error('Division by zero is undefined. Try a nonzero divisor.');if(d<0n){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g};}
function number(s){const sign=s.startsWith('-')?-1n:1n;const [a,b='']=s.replace(/^[+-]/,'').split('.');return rational(sign*BigInt(a+b),10n**BigInt(b.length));}
const add=(a,b)=>rational(a.n*b.d+b.n*a.d,a.d*b.d);
const tex=a=>a.d===1n?String(a.n):`\\frac{${a.n}}{${a.d}}`;
export function solve(input){
 if(input.length>120)throw Error('Please use a shorter expression.');
 if(input.includes('='))return solveEquation(input);
 let s=input.trim().replace(/\\(?:times|cdot)/g,'*').replace(/\\div/g,'/').replace(/[×x]/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/\s+/g,'');
 s=s.replace(/^\\frac\{([+-]?\d+(?:\.\d+)?)\}\{([+-]?\d+(?:\.\d+)?)\}$/,'$1/$2');
 const num='([+-]?\\d+(?:\\.\\d+)?)';
 const color=(value,shade)=>`\\textcolor{${shade}}{${value}}`;
 // Deliberately bounded rules: a + b × c and a/b + c/d only.
 let mixed=s.match(new RegExp(`^${num}\\+${num}\\*${num}$`));
 if(mixed){
  const [a,b,c]=mixed.slice(1).map(number),product=rational(b.n*c.n,b.d*c.d),result=add(a,product);
  const blue=v=>color(v,'#2459a6');
  return {answer:tex(result),methods:[{name:'Multiply, then add',steps:[
   {math:`${tex(a)}+${blue(`${tex(b)}\\times ${tex(c)}`)}`,text:'Multiply the blue numbers first.'},
   {math:`${tex(a)}+${blue(tex(product))}`,text:`${tex(b)} times ${tex(c)} is ${tex(product)}. Now add.`},
   {math:tex(result),text:'Add to get the final answer.'}
  ]}]};
 }
 const fraction='([+-]?\\d+)/([+-]?\\d+)';
 const fractions=s.replace(/\\frac\{([+-]?\d+)\}\{([+-]?\d+)\}/g,'$1/$2');
 mixed=fractions.match(new RegExp(`^${fraction}\\+${fraction}$`));
 if(mixed){
  const [an,ad,bn,bd]=mixed.slice(1).map(BigInt);
  const a=rational(an,ad),b=rational(bn,bd),result=add(a,b);
  const denominator=a.d/gcd(a.d,b.d)*b.d;
  const left=a.n*(denominator/a.d),right=b.n*(denominator/b.d);
  const frac=(n,d)=>`\\frac{${n}}{${d}}`;
  const blue=v=>color(v,'#2459a6'),orange=v=>color(v,'#a34b13');
  return {answer:tex(result),methods:[{name:'Make equal-sized parts',steps:[
   {math:`${blue(frac(an,ad))}+${orange(frac(bn,bd))}`,text:'First, make the bottom numbers match.'},
   {math:`${blue(frac(left,denominator))}+${orange(frac(right,denominator))}`,text:`Use ${denominator} on the bottom: multiply each top and bottom by the same number.`},
   {math:frac(`${blue(left)}+${orange(right)}`,denominator),text:'Add the top numbers. Keep the same bottom number.'},
   {math:tex(result),text:'This is the final answer in simplest form.'}
  ]}]};
 }
 let m=s.match(new RegExp(`^${num}\\+${num}\\+${num}$`));
 if(m){const [a,b,c]=m.slice(1).map(number),ab=add(a,b),bc=add(b,c),result=add(ab,c);return {answer:tex(result),methods:[{name:'Left to right',steps:[{math:`${tex(a)}+${tex(b)}+${tex(c)}`,text:'Start with the three numbers.'},{math:`${tex(ab)}+${tex(c)}`,text:'Add the first two numbers.'},{math:tex(result),text:'Add the last number.'}]},{name:'Group the last two',steps:[{math:`${tex(a)}+(${tex(b)}+${tex(c)})`,text:'Addition lets us group numbers in a different way.'},{math:`${tex(a)}+${tex(bc)}`,text:'Add the last two numbers first.'},{math:tex(result),text:'Now add the remaining numbers.'}]}]};}
 m=s.match(new RegExp(`^${num}([+*/-])${num}$`));
 if(!m)throw Error('Try two numbers with +, −, × or ÷, three added numbers, a + b × c, or a/b + c/d. Simple LaTeX fractions work too.');
 const a=number(m[1]),b=number(m[3]),op=m[2];
 const result=op==='+'?add(a,b):op==='-'?add(a,rational(-b.n,b.d)):op==='*'?rational(a.n*b.n,a.d*b.d):rational(a.n*b.d,a.d*b.n);
 const symbol={'+':'+','-':'-','*':'\\times','/':'\\div'}[op];
 const explanation={'+':'Combine the two amounts.','-':'Take away the second amount.','*':'Multiply the two numbers.','/':'Divide into equal parts. Reduce any fraction to its simplest form.'}[op];
 if(op==='-' && a.d===1n && b.d===1n && a.n>b.n && b.n>0n && a.n%10n>0n && b.n>a.n%10n && b.n<10n){
 const first=a.n%10n,rest=b.n-first;
 return {answer:tex(result),methods:[{name:'Bridge a ten',steps:[{math:`${tex(a)}-${tex(b)}`,text:'Start with the question.'},{math:`${tex(a)}-${first}-${rest}`,text:`Split ${b.n} into ${first} and ${rest} to reach a friendly ten.`},{math:`${a.n-first}-${rest}`,text:`Subtract ${first} first.`},{math:tex(result),text:`Subtract the remaining ${rest}.`}]}]};
 }
 return {answer:tex(result),methods:[{name:'Direct calculation',steps:[{math:`${tex(a)} ${symbol} ${b.n<0n?`(${tex(b)})`:tex(b)}`,text:'Start with the question.'},{math:tex(result),text:explanation}]}]};
}
