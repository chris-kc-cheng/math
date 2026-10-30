import './chrome.css';
// One grade control that is also the grade display. Collapsible pickers stay hidden behind a small trigger until it is pressed;
// choosing a grade (or pressing Escape) tucks the strip away again.
export function mountGradePicker(host,{grades,value,onChange,label='Grade',compact=false,collapsible=false,triggerLabel=null}){
 const group=document.createElement('div');group.className='grade-picker';group.setAttribute('role','group');group.setAttribute('aria-label',label);if(compact)group.classList.add('compact');
 if(!compact){const name=document.createElement('span');name.className='grade-picker-label';name.textContent=label;group.append(name);}
 const buttons=new Map();let current,trigger;
 const close=()=>{if(!collapsible)return;group.hidden=true;trigger.setAttribute('aria-expanded','false');};
 for(const grade of grades){
  const button=document.createElement('button');button.type='button';button.className='grade-option';button.textContent=String(grade);button.setAttribute('aria-label',`${label} ${grade}`);
  button.onclick=()=>{const changed=Number(grade)!==current;if(changed)set(grade);close();if(changed)onChange?.(Number(grade));};
  buttons.set(Number(grade),button);group.append(button);
 }
 function set(next){current=Number(next);for(const [grade,button] of buttons)button.setAttribute('aria-pressed',String(grade===current));if(trigger)refreshTrigger();}
 function refreshTrigger(){trigger.replaceChildren();if(triggerLabel)trigger.append(triggerLabel(current));const caret=document.createElement('span');caret.className='grade-caret';caret.textContent='▾';caret.setAttribute('aria-hidden','true');trigger.append(caret);trigger.setAttribute('aria-label',`Change ${label.toLowerCase()} (now ${label} ${current})`);}
 if(collapsible){
  trigger=document.createElement('button');trigger.type='button';trigger.className='grade-trigger';trigger.setAttribute('aria-haspopup','true');trigger.setAttribute('aria-expanded','false');
  group.hidden=true;
  trigger.onclick=()=>{const open=group.hidden;group.hidden=!open;trigger.setAttribute('aria-expanded',String(open));if(open)group.querySelector('[aria-pressed=true]')?.focus();};
  group.addEventListener('keydown',event=>{if(event.key==='Escape'){close();trigger.focus();}});
  host.append(trigger);
 }
 set(value);host.append(group);
 return {set,element:group,trigger};
}
