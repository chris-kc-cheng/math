// The single exact-arithmetic implementation. No parsing or presentation policy lives here.
export function integer(value){
 if(typeof value==='bigint')return value;
 if(typeof value==='number'&&Number.isSafeInteger(value))return BigInt(value);
 if(typeof value==='string'&&/^[+-]?\d{1,512}$/.test(value.trim()))return BigInt(value.trim());
 throw Error('Use an exact whole number.');
}
export function gcd(a,b){a=integer(a);b=integer(b);while(b){[a,b]=[b,a%b];}return a<0n?-a:a;}
export function lcm(a,b){a=integer(a);b=integer(b);if(!a||!b)return 0n;const result=a/gcd(a,b)*b;return result<0n?-result:result;}
export function rational(n,d=1n){
 n=integer(n);d=integer(d);if(!d)throw Error('Division by zero is undefined. Try a nonzero divisor.');
 if(d<0n){n=-n;d=-d;}const divisor=gcd(n,d);
 return Object.freeze({n:n/divisor,d:d/divisor});
}
export const value=v=>v&&typeof v==='object'?rational(v.n,v.d):rational(v);
export function parseDecimal(input){
 const match=String(input).trim().match(/^([+-]?)(\d{1,256})(?:\.(\d{1,100}))?$/);
 if(!match)throw Error('Use a whole number or a finite decimal.');
 return rational(BigInt((match[1]==='-'?'-':'')+match[2]+(match[3]||'')),10n**BigInt((match[3]||'').length));
}
export function add(a,b){a=value(a);b=value(b);return rational(a.n*b.d+b.n*a.d,a.d*b.d);}
export const negate=a=>{a=value(a);return rational(-a.n,a.d);};
export const subtract=(a,b)=>add(a,negate(b));
export function multiply(a,b){a=value(a);b=value(b);return rational(a.n*b.n,a.d*b.d);}
export function divide(a,b){a=value(a);b=value(b);return rational(a.n*b.d,a.d*b.n);}
export function compare(a,b){a=value(a);b=value(b);const difference=a.n*b.d-b.n*a.d;return difference<0n?-1:difference>0n?1:0;}
export const sum=values=>values.reduce((total,current)=>add(total,current),rational(0n));
const operations={'+':add,'-':subtract,'*':multiply,'/':divide};
export function calculate(operation,a,b){if(!Object.hasOwn(operations,operation))throw Error('Unsupported arithmetic operation.');return operations[operation](a,b);}
export function integerResult(v){v=value(v);if(v.d!==1n)throw Error('The result is not a whole number.');return v.n;}
export function safeInteger(v){const n=integerResult(v),result=Number(n);if(!Number.isSafeInteger(result))throw Error('The result exceeds the safe whole-number range.');return result;}
export function quotientRemainder(n,d){
 n=integer(n);d=integer(d);if(n<0n||d<=0n)throw Error('Use a nonnegative dividend and a positive divisor.');
 const quotient=n/d,product=integerResult(multiply(quotient,d)),remainder=integerResult(subtract(n,product));
 return Object.freeze({quotient,product,remainder});
}
export function commonParts(values){
 const numbers=values.map(value),denominator=numbers.reduce((d,n)=>lcm(d,n.d),1n);
 return {denominator,numerators:numbers.map(n=>n.n*(denominator/n.d))};
}
export function roundHalfUp(v,places=0){
 if(!Number.isInteger(places)||places<0||places>100)throw Error('Use 0 to 100 decimal places.');
 v=value(v);const scale=10n**BigInt(places),sign=v.n<0n?-1n:1n,n=(v.n<0n?-v.n:v.n)*scale;
 const {quotient,remainder}=quotientRemainder(n,v.d);
 return rational(sign*(quotient+(remainder*2n>=v.d?1n:0n)),scale);
}
export function equalDecimals(a,b){
 // Answer input is intentionally narrower than the general core parser.
 const valid=v=>/^([+-]?)(\d{1,30})(?:\.(\d{1,10}))?$/.test(String(v).trim());
 return valid(a)&&valid(b)&&compare(parseDecimal(a),parseDecimal(b))===0;
}
export function power(base,exponent){
 if(!Number.isSafeInteger(exponent)||Math.abs(exponent)>30)throw Error('Use a whole-number exponent between -30 and 30.');
 base=value(base);if(!base.n&&exponent===0)throw Error('Zero to the power zero is not supported.');
 if(exponent<0)return power(divide(1,base),-exponent);
 return rational(base.n**BigInt(exponent),base.d**BigInt(exponent));
}
export function integerSquareRoot(input){
 const n=integer(input);if(n<0n)throw Error('A negative number has no real square root.');if(n<2n)return n;
 let x=n,y=(x+1n)/2n;while(y<x){x=y;y=(x+n/x)/2n;}return x;
}
