import {renderTex} from '../ui/dom.js';
export function renderLongDivision(board, lesson, current) {
 const grid=document.createElement('div');grid.className=`ld-grid${current.phase==='complete'?' is-complete':''}`;grid.style.gridTemplateColumns=`${Math.max(2,lesson.divisor.length)}ch .8em repeat(${lesson.dividend.length},1.25em)`;
 const cell=(text,column,row,className)=>{const el=document.createElement('span');if(text)renderTex(text,el);el.style.gridColumn=column;el.style.gridRow=row;el.className=className;grid.append(el);};
 cell(lesson.divisor,1,2,'ld-divisor');
 [...lesson.dividend].forEach((digit,i)=>cell(digit,i+3,2,`ld-dividend ${i===0?'ld-bracket':''}`));
 current.quotient.forEach((digit,i)=>cell(digit,i+3,1,'ld-quotient'));
 current.rows.forEach((working,r)=>{
  const start=working.end-working.value.length+1;
  if(working.kind==='product')cell('−',start+2,r+3,'ld-minus');
  if(working.kind==='remainder')cell('',`${working.ruleStart+3} / ${working.ruleEnd+4}`,r+3,'ld-rule');
  [...working.value].forEach((digit,j)=>cell(digit,start+j+3,r+3,`ld-working ${r===current.rows.length-1?'ld-active':''}`));
 });
 board.replaceChildren(grid);
}
