import {compare} from '../../core/exact.js';
import {table as lessonTable} from '../../lesson.js';
export {lesson,step,numeric} from '../../lesson.js';
// Table cells are text, whereas formula steps are rendered as LaTeX.
export const table=(columns,rows,caption)=>lessonTable(columns,rows.map(row=>row.map(cell=>typeof cell==='string'?cell.replace(/\\frac\{(-?\d+)\}\{(\d+)\}/g,'$1/$2'):cell)),caption);
export {rational,add,subtract,multiply,divide,calculate,compare,power,roundHalfUp,gcd,lcm,sum} from '../../core/exact.js';
export {tex,plain,decimalOrFraction as display,money,fixed} from '../../core/format.js';
export function checked(result,text,math,left,right){
 const valid=compare(left,right)===0;
 return {...result,verification:{method:'Check the original relationship',valid,steps:[{stage:'verification',text,math,valid}]}};
}
export {requireThat} from '../../core/shared.js';
