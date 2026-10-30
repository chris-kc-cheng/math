import {renderTex} from '../ui/dom.js';
export function renderEquation(container,formula){
 container.replaceChildren();container.classList.add('equation-line');
 const at=formula.indexOf('=');
 const pieces=at<0?[['equation-message',formula]]:[['equation-left',formula.slice(0,at)],['equation-equals','='],['equation-right',formula.slice(at+1)]];
 for(const [className,tex] of pieces){
  const cell=document.createElement('div');cell.className=className;
  renderTex(tex,cell);container.append(cell);
 }
}
