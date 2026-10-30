import {numberRules8} from './number.js';
import {algebraRules8} from './algebra.js';
import {dataRules8} from './data.js';
import {spatialRules8} from './spatial.js';
import {financialRules8} from './financial.js';
export const grade8Rules={...numberRules8,...algebraRules8,...dataRules8,...spatialRules8,...financialRules8};
export const argumentCounts={
 'g8-scientific':2,'g8-real-order':3,'g8-roots':1,'g8-percent':1,'g8-order-operations':4,'g8-squares':1,'g8-powers-ten':2,'g8-integer-add-sub':3,'g8-integer-multiply-divide':3,'g8-fraction-add-sub':5,'g8-fraction-multiply-divide':5,'g8-proportion':4,
 'g8-pattern-compare':4,'g8-rational-pattern':4,'g8-like-terms':4,'g8-monomials':3,'g8-evaluate':5,'g8-equation':4,'g8-inequality':4,'g8-code-data':5,'g8-modelling':3,
 'g8-data-variables':1,'g8-paired-data':3,'g8-data-story':3,'g8-correlation':3,'g8-venn':4,'g8-dependent-probability':3,
 'g8-tessellation':1,'g8-scale-model':4,'g8-scale-drawing':4,'g8-cartesian':4,'g8-metric-prefix':2,'g8-angle-properties':3,'g8-composite-area':4,'g8-composite-solid':1,'g8-circle-composite':2,'g8-pythagorean':2,'g8-pythagorean-leg':2,
 'g8-exchange':4,'g8-financial-goal':4,'g8-interest':3,'g8-sale-value':3,'g8-credit-offers':5
};
export function createGrade8(rule,values){
 if(!Object.hasOwn(grade8Rules,rule)||!Array.isArray(values)||values.length!==argumentCounts[rule]||!values.every(n=>Number.isSafeInteger(n)&&Math.abs(n)<=1000000))throw Error('Use the bounded whole-number parameters for this Grade 8 question.');
 const [a,b,c,d,e]=values;
 if(rule==='g8-scientific'&&(a<100||a>999||b< -12||b>12))throw Error('Use a coefficient from 1.00 to 9.99 and a power from -12 to 12.');
 if(rule==='g8-squares'&&(a<0||a>12))throw Error('Use square facts from 0 to 12.');
 if(rule==='g8-integer-add-sub'&&(c<0||c>1)||rule==='g8-integer-multiply-divide'&&(c<2||c>3||c===3&&b===0))throw Error('Choose an operation in this question family, with a nonzero divisor.');
 if(rule==='g8-monomials'&&(c<0||c>1)||rule==='g8-data-variables'&&(a<0||a>1))throw Error('Choose a supported activity variant.');
 if(['g8-exchange','g8-financial-goal','g8-sale-value','g8-credit-offers'].includes(rule)&&values.some(n=>n<0))throw Error('Use nonnegative financial amounts and rates.');
 if(rule==='g8-sale-value'&&(b>100||c>100)||rule==='g8-financial-goal'&&c>100)throw Error('Use a percentage from 0 to 100 in this scenario.');
 if(['g8-real-order','g8-roots'].includes(rule)&&a<0)throw Error('A negative radicand has no real square root.');
 if(['g8-fraction-add-sub','g8-fraction-multiply-divide'].includes(rule)&&(b<=0||d<=0||!Number.isInteger(e)||e<0||e>3||e===3&&c===0))throw Error('Use positive denominators and a nonzero divisor.');
 if(rule==='g8-real-order'&&c<=0||rule==='g8-rational-pattern'&&(!b||c<=0)||rule==='g8-evaluate'&&(b<=0||e<=0))throw Error('Use positive denominators and a nonzero pattern change.');
 if(rule==='g8-inequality'&&(!a||d<0||d>3))throw Error('Use a nonzero coefficient and a supported comparison flag.');
 if(rule==='g8-pythagorean-leg'&&(b<=0||a<=b))throw Error('The hypotenuse must be longer than the known positive leg.');
 if(rule==='g8-dependent-probability'&&(a<0||b<0||a+b<2||c<0||c>1))throw Error('Use at least two counters and a replacement flag of 0 or 1.');
 if(rule==='g8-composite-area'&&(a<=0||b<=0||c<=0||d<=0||c>=a||d>=b))throw Error('The removed corner must fit strictly inside the outer rectangle.');
 if(rule==='g8-interest'&&(a<0||b<0||b>100||c<0||c>10))throw Error('Use a nonnegative principal, 0–100% rate and at most 10 years.');
 if(rule==='g8-tessellation'&&![3,4,5,6].includes(a))throw Error('Use 3, 4, 5 or 6 sides in this regular-polygon activity.');
 if(rule==='g8-cartesian'&&(c<0||c>5||d<1||d>5))throw Error('Use a supported transformation and scale factor.');
 if(rule==='g8-cartesian'&&(Math.abs(a)>10||Math.abs(b)>10))throw Error('Use starting coordinates from -10 to 10.');
 if(rule==='g8-metric-prefix'&&(b<0||b>5))throw Error('Choose one of the six supported metric prefixes.');
 if(rule==='g8-angle-properties'&&(a<=0||a>=180||b<3||b>12||c<0||c>3))throw Error('Use a valid angle, polygon and angle relationship.');
 if(['g8-scale-model','g8-scale-drawing','g8-circle-composite','g8-pythagorean','g8-proportion'].includes(rule)&&values.some(n=>n<=0))throw Error('Lengths, scales and rates must be positive.');
 return grade8Rules[rule].solve(values);
}
export const grade8Family={name:'grade8',has:rule=>Object.hasOwn(grade8Rules,rule),create:createGrade8,generate:(rule,rng)=>grade8Rules[rule].generate(rng)};
