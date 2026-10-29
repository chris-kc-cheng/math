const integer = value => {
  const text = String(value).trim();
  if (!/^\d{1,60}$/.test(text)) throw new Error('Use whole numbers from 0 upwards (up to 60 digits).');
  return BigInt(text);
};
const gcd = (a,b) => b ? gcd(b,a%b) : a;
const fraction = (n,d) => `\\frac{${n}}{${d}}`;
const mixed = (w,n,d) => n ? (w ? `${w}\\,${fraction(n,d)}` : fraction(n,d)) : `${w}`;
const blue = n => `\\textcolor{#2459a6}{${n}}`;
const orange = n => `\\textcolor{#a34b13}{${n}}`;

export function convertMixed(whole,numerator,denominator) {
  const w=integer(whole), n=integer(numerator), d=integer(denominator);
  if (!d) throw new Error('The denominator must be greater than zero.');
  if (n>=d) throw new Error('The fraction part must be smaller than one whole.');
  const total=w*d+n, divisor=gcd(total,d);
  const steps=[{math:mixed(w,n,d),text:'Start with the mixed number.'},
    {math:fraction(`${blue(w)}\\times ${d}+${orange(n)}`,d),text:`Each whole has ${d} parts. Multiply ${w} by ${d}, then add ${n}.`},
    {math:fraction(total,d),text:`There are ${total} parts altogether. Keep the denominator ${d}.`}];
  if(divisor>1n) steps.push({math:fraction(total/divisor,d/divisor),text:`Simplify by dividing the numerator and denominator by ${divisor}.`});
  return {steps,answer:steps.at(-1).math,numerator:String(total/divisor),denominator:String(d/divisor)};
}

export function convertFraction(numerator,denominator) {
  const n=integer(numerator), d=integer(denominator);
  if (!d) throw new Error('The denominator must be greater than zero.');
  const w=n/d, r=n%d, divisor=gcd(r,d);
  const steps=[{math:fraction(n,d),text:'Start with the fraction.'}];
  if(r===0n) steps.push({math:String(w),text:`${n} divided by ${d} is ${w}, with no parts left over.`});
  else {
    if(w>0n) {
      steps.push({math:fraction(`${blue(w)}\\times ${d}+${orange(r)}`,d),text:`${n} divided by ${d} gives ${w} whole groups, with ${r} parts left over.`});
      steps.push({math:`${blue(w)}+${orange(fraction(r,d))}`,text:`The whole groups make ${w}. The leftover parts make ${r}/${d}.`});
    }
    steps.push({math:mixed(w,r/divisor,d/divisor),text:divisor>1n?`Simplify the fraction part by dividing its top and bottom by ${divisor}.`:(w?`Write ${w} and ${r}/${d} together as a mixed number.`:'This fraction is less than one whole, so there is no whole-number part.')});
  }
  return {steps,answer:steps.at(-1).math,whole:String(w),numerator:String(r/divisor),denominator:String(d/divisor)};
}
