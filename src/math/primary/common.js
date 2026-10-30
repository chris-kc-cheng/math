export {lesson,step,numeric} from '../lesson.js';
export {checked,table,requireThat,rational,add,subtract,multiply,divide,compare,tex,plain} from '../elementary/common.js';
import {lesson,step} from '../lesson.js';
import {requireThat} from '../elementary/common.js';
export const style=(variants,index)=>{requireThat(Number.isInteger(index)&&index>=0&&index<variants.length,'Choose a supported primary question style.');return variants[index];};
export const counters=(count,caption='Count the counters',bundle=5)=>({type:'primary-counters',count,bundle,caption});
export const blocks=(number)=>({type:'primary-blocks',number,caption:'Base-ten model: hundreds, tens, and ones'});
export const shareBars=(items,sharers)=>({type:'primary-share',items,sharers,caption:`${items} equal wholes shared fairly among ${sharers} friends`});
export function choiceLesson(prompt,steps,answer,options,visual){
 return lesson(prompt,steps,{answer,response:{kind:'choice',options,answer},visual});
}
export const partName=d=>({2:'halves',3:'thirds',4:'fourths',5:'fifths',6:'sixths',8:'eighths',10:'tenths'}[d]||`${d} equal parts`);
export function shareWords(n,d){const whole=Math.floor(n/d),left=n%d;return left?`${whole?`${whole} whole${whole===1?'':'s'} and `:''}${left} ${left===1?partName(d).replace(/ves$/,'f').replace(/s$/,''):partName(d)}`:`${whole} whole${whole===1?'':'s'}`;}
export const traced=(prompt,steps,answer,visual)=>lesson(prompt,steps,{answer:String(answer),visual});
