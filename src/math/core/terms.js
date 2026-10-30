// Write algebraic terms the way a textbook does: no 1x, no 0x, no "+-".
// Coefficients are plain integers or pre-formatted decimal strings (e.g. "1.5").
const isOne=c=>c===1||c==='1'||c==='1.0';
const isZero=c=>c===0||c==='0'||c==='0.0'||c==='-0';
const isNegative=c=>typeof c==='number'?c<0:String(c).startsWith('-');
const magnitude=c=>typeof c==='number'?Math.abs(c):String(c).replace(/^-/,'');
/** One term: 1,x -> x ; -1,x -> -x ; 5,x -> 5x. A zero coefficient is the caller's cue to drop the term. */
export function term(coefficient,variable='x'){
 if(isOne(coefficient))return variable;
 if(isOne(magnitude(coefficient))&&isNegative(coefficient))return `-${variable}`;
 return `${coefficient}${variable}`;
}
/** Append a term to an expression with a clean sign: join('2x',-3) -> 2x-3, join('',-3) -> -3. Zero terms vanish. */
function append(expression,text,negative){
 if(!expression)return negative?`-${text}`:text;
 return `${expression}${negative?'-':'+'}${text}`;
}
/** a·v + b, dropping zero parts: linear(1,3) -> x+3, linear(0,4) -> 4, linear(-2,0) -> -2x. */
export function linear(a,b,variable='x'){
 let expression='';
 if(!isZero(a))expression=term(a,variable);
 if(!isZero(b))expression=append(expression,String(magnitude(b)),isNegative(b));
 return expression||'0';
}
/** Sum of any number of [coefficient, variable] pairs (variable '' means a constant). */
export function sumOfTerms(parts){
 let expression='';
 for(const [coefficient,variable=''] of parts){
  if(isZero(coefficient))continue;
  const body=variable?(isOne(magnitude(coefficient))?variable:`${magnitude(coefficient)}${variable}`):String(magnitude(coefficient));
  expression=append(expression,body,isNegative(coefficient));
 }
 return expression||'0';
}
/** Parenthesise a negative operand only: signed(-5) -> (-5), signed(5) -> 5. */
export const signed=n=>isNegative(n)?`(${n})`:String(n);
