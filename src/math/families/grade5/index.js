import {numberRules} from './number.js';
import {algebraRules} from './algebra.js';
import {dataRules} from './data.js';
import {spatialRules} from './spatial.js';
import {financialRules} from './financial.js';
import {reflectionRules} from './reflection.js';
import {validateValues} from './common.js';
export const grade5Rules={...numberRules,...algebraRules,...dataRules,...spatialRules,...financialRules,...reflectionRules};
const range=(min,max)=>[min,max],digit=range(0,9),boolean=range(0,1),small=range(1,12),hundredths=range(0,10000);
export const argumentRanges={
 'place-value':[range(0,100000)],'order-whole':Array(3).fill(range(0,100000)),
 'equivalent-fraction':[range(0,24),range(2,12),range(1,6)],'compare-fractions':[range(0,24),range(2,12),range(0,24),range(2,12)],'order-fractions':[range(0,24),range(2,12),range(0,24),range(2,12),range(0,24),range(2,12)],
 'order-decimals':Array(3).fill(hundredths),'round-tenth':[hundredths],'fraction-percent':[range(0,100),range(1,100)],'percent-fraction':[range(0,100)],
 'mental-scale':[range(0,99999),range(1,2)],'estimate-decimals':[hundredths,hundredths,boolean],
 'decimal-addition':[hundredths,hundredths],'decimal-subtraction':[hundredths,hundredths],
 'whole-add-subtract':[range(0,100000),range(0,100000),boolean],'fraction-subtract':[range(0,24),range(0,24),range(2,12)],
 'fraction-add':[range(0,24),range(0,24),range(2,12)],
 'multiplication-area':[range(10,99),range(10,99)],'division-area':[range(100,999),range(10,99)],'unit-fraction':[range(1,9),range(2,12),boolean],'equivalent-ratio':[small,small,range(1,6)],
 'pattern-type':[small,small,range(0,2)],'pattern-table':[small,small,boolean],'pattern-missing':[small,small,boolean],'decimal-pattern':[range(0,1000),range(1,100)],
 'words-expression':[range(1,9),range(0,20)],'evaluate-expression':[digit,range(0,20),range(0,10)],
 'equation-subtract':[range(1,40),range(1,99)],'equation-divide':[range(2,10),range(1,10)],'inequality':[range(1,15),range(2,50),boolean],'inequality-operation':[range(2,5),range(1,9),range(0,2),boolean],
 'coding-condition':[range(0,100),range(2,12)],'coding-loop':[range(0,20),range(0,10),range(1,10)],'seating-model':[range(1,100),range(1,12),range(0,20)],
 'sampling':[range(0,2),range(1,12)],'frequency-table':Array(3).fill(range(0,100)),'stacked-graph':Array(4).fill(range(0,100)),'infographic':Array(3).fill(range(0,100)),
 'statistics':[...Array(5).fill(range(0,10000)),boolean],'statistics-even':[...Array(4).fill(range(0,10000)),boolean],
 'misleading-graph':[range(1,100),range(1,100),range(0,99)],'probability':[range(0,12),range(1,12),range(1,10)],'experimental-probability':[range(0,200),range(1,200)],
 'triangle-sides':Array(3).fill(range(1,20)),'congruent-shapes':[range(1,12),range(1,12),boolean],'cube-views':Array(4).fill(range(1,3)),
 'congruent-triangles':[range(1,12),range(1,12),range(1,20),boolean],'congruent-parallelograms':[range(3,9),range(2,5),boolean],'measure-angle':[range(5,175)],
 'triangle-angles':[range(1,12),range(10,150),range(10,150)],'coordinate-scale':[range(0,6),range(0,6),range(1,10)],
 'coordinates':[range(0,5),range(0,5),range(0,4),range(0,3)],'transformation':[range(1,4),range(1,4),range(0,4)],
 'metric-units':[range(0,3),range(2,9)],'metric-conversion':[range(0,9999),range(0,3)],'compare-angles':[range(1,6),range(1,6),range(1,30)],'construct-angle':[range(0,180)],
 'shape-area':[range(1,20),range(1,20),boolean],'area-perimeter':[range(1,12),range(1,12)],
 'money-transfer':[range(0,100000),range(0,2)],'sales-tax':[range(0,100000),range(0,100000),range(0,100)],'budget':[range(0,100000),range(0,100000),range(0,100000)],'credit-debt':[range(0,100000),range(0,100000),range(0,100000)],'unit-price':[small,small,range(0,10000),range(0,10000)],'tax-services':[range(0,2)],
 ...Object.fromEntries(Object.keys(reflectionRules).map(rule=>[rule,[range(0,3)]]))
};
export function createGrade5(rule,values){
 validateValues(values);const ranges=argumentRanges[rule];if(!ranges||!grade5Rules[rule])throw Error('Unsupported Grade 5 activity.');
 if(values.length!==ranges.length||values.some((value,i)=>value<ranges[i][0]||value>ranges[i][1]))throw Error('Values are outside this activity’s supported range.');
 const [a,b,c,d,e,f]=values;
 if((rule==='compare-fractions'&&(a>2*b||c>2*d))||(rule==='order-fractions'&&(a>2*b||c>2*d||e>2*f)))throw Error('Use fractions from zero through two wholes.');
 if(rule==='equivalent-fraction'&&b*c>12)throw Error('Use equivalent fractions through twelfths.');
 if(rule==='fraction-percent'&&(a>b||100%b!==0))throw Error('Use a fraction with an exact whole-number percentage.');
 if(rule==='whole-add-subtract'&&!c&&a+b>100000)throw Error('Keep the sum at most 100000.');
 if(rule==='fraction-subtract'&&b>a)throw Error('Use a nonnegative fraction difference.');
 if(['frequency-table','infographic','stacked-graph'].includes(rule)&&values.every(value=>value===0))throw Error('Use at least one response.');
 if(rule==='misleading-graph'&&(c>=a||c>=b))throw Error('The baseline must be below both values.');
 if(['probability','experimental-probability'].includes(rule)&&a>b)throw Error('The event count cannot exceed the total.');
 if(['triangle-sides','congruent-triangles'].includes(rule)&&(a+b<=c||a+c<=b||b+c<=a))throw Error('These sides cannot form a triangle.');
 if(rule==='triangle-angles'&&b+c>=180)throw Error('Two triangle angles must total less than 180 degrees.');
 if(rule==='compare-angles'&&(a*c>180||b*c>180))throw Error('Use angles no greater than 180 degrees.');
 if(rule==='inequality'&&b<=a)throw Error('Use a positive whole-number boundary.');
 if(rule==='equation-subtract'&&a+b>100)throw Error('Keep the whole-number solution at most 100.');
 if(rule==='inequality-operation'&&(c===0&&b<a||c!==0&&a*b>50))throw Error('Keep the inequality within whole numbers through 50.');
 if(rule==='budget'&&b+c>a)throw Error('The example budget must not spend more than its income. Use the budget builder to explore a shortfall.');
 return grade5Rules[rule].solve(values);
}
export const grade5Family={name:'grade5',has:rule=>Object.hasOwn(grade5Rules,rule),create:createGrade5,generate:(rule,rng)=>grade5Rules[rule].generate(rng)};
