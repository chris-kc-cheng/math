// Four upright strokes and a fifth crossing stroke, grouped by fives.
export function tallyGroups(count){
 if(!Number.isSafeInteger(count)||count<0||count>1000)throw Error('Use a tally count from 0 to 1000.');
 return Array.from({length:Math.ceil(count/5)},(_,group)=>Math.min(5,count-group*5));
}
export function tallyMarks(count){
 const ns='http://www.w3.org/2000/svg',marks=document.createElement('span');
 marks.className='tally-marks';marks.setAttribute('role','img');marks.setAttribute('aria-label',`${count} tally marks`);
 if(!count){marks.textContent='0';return marks;}
 for(const size of tallyGroups(count)){
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 36 30');svg.setAttribute('aria-hidden','true');
  const stroke=(x1,y1,x2,y2)=>{const line=document.createElementNS(ns,'line');for(const [key,value] of Object.entries({x1,y1,x2,y2,stroke:'currentColor','stroke-width':2,'stroke-linecap':'round'}))line.setAttribute(key,String(value));svg.append(line);};
  for(let i=0;i<Math.min(4,size);i++)stroke(6+i*8,4,6+i*8,26);
  if(size===5)stroke(2,27,34,3);
  marks.append(svg);
 }
 return marks;
}
