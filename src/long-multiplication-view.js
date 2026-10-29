export function renderLongMultiplication(board,lesson,current){
 const grid=document.createElement('div');grid.className='lm-grid';grid.style.gridTemplateColumns=`.8em repeat(${lesson.width},1.25em)`;
 const cell=(text,col,row,cls='')=>{const el=document.createElement('span');el.textContent=text;el.style.gridColumn=col;el.style.gridRow=row;el.className=cls;grid.append(el);};
 const number=(value,row,cls)=>[...value].forEach((digit,i)=>cell(digit,lesson.width-value.length+i+2,row,cls));
 current.carries.forEach((value,i)=>cell(value,i+2,1,'lm-carry'));
 number(lesson.left,2,'');cell('×',1,3,'lm-operator');number(lesson.right,3,'');cell('',`1 / ${lesson.width+2}`,3,'lm-bottom-rule');
 current.partials.forEach((partial,r)=>{
  if(r>0)cell('+',1,r+4,'lm-operator');
  partial.forEach((digit,i)=>cell(digit,i+2,r+4,r===current.activeRow?'lm-active':''));
 });
 if(current.total.some(Boolean)){
  const row=5+current.partials.length;
  current.sumCarries.forEach((value,i)=>cell(value,i+2,row-1,'lm-carry'));
  cell('',`1 / ${lesson.width+2}`,row,'lm-top-rule');
  current.total.forEach((digit,i)=>cell(digit,i+2,row,current.phase==='complete'?'lm-answer':'lm-active'));
 }
 board.replaceChildren(grid);
}
