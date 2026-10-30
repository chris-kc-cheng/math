import './chrome.css';
import {listRounds} from '../game/storage.js';
import {activeProfile,playerKey,addProfile,chooseProfile,profilesIn,profileStats,avatarFor,chooseAvatar,AVATARS,WIN_ACCURACY} from '../game/profile.js';
import {el} from './dom.js';

// The player badge and lifetime statistics in the top-right corner of every page.
const HUES=[212,28,150,280,350,48,190,320];
const hueFor=id=>HUES[[...String(id)].reduce((n,c)=>n+c.charCodeAt(0),0)%HUES.length];
export function avatarNode(profile,size=''){
 const node=el('span',undefined,`avatar${size?' avatar-'+size:''}`);node.setAttribute('aria-hidden','true');
 if(!profile){node.textContent='👤';node.classList.add('avatar-guest');return node;}
 const emoji=avatarFor(profile.id);
 if(emoji)node.textContent=emoji;else{node.textContent=(profile.name||'?').trim().slice(0,1).toUpperCase();node.style.setProperty('--avatar-hue',hueFor(profile.id));node.classList.add('avatar-initial');}
 return node;
}
const percent=value=>value===null?'–':`${Math.round(value*100)}%`;
const medals=[['trophy','🏆','Perfect games','perfect'],['medal','🥈','Games won','won'],['pear','🍐','Correct answers','correct']];

let corner,rounds=[],profile=null,busy=false;
function emit(next){profile=next;chooseProfile(next);document.dispatchEvent(new CustomEvent('math-profile-change',{detail:next}));render();}

function statsView(){
 const stats=profileStats(rounds,profile.id),group=el('div',undefined,'stat-cluster');group.tabIndex=0;group.setAttribute('role','group');
 group.setAttribute('aria-label',`${profile.name}'s statistics: ${stats.perfect} perfect games, ${stats.won} games won, ${stats.correct} correct answers`);
 for(const [cls,emoji,label,key] of medals){const item=el('span',undefined,`stat stat-${cls}`);item.append(el('span',emoji,'stat-icon'),el('span',String(stats[key]),'stat-count'));item.title='';group.append(item);}
 const tip=el('div',undefined,'stat-tip');tip.setAttribute('role','tooltip');
 tip.append(el('strong',`${profile.name}’s stats`));
 const list=el('dl');
 const rows=[['🏆 Perfect games',stats.perfect],[`🥈 Games won (${Math.round(WIN_ACCURACY*100)}%+ right)`,stats.won],['🍐 Correct answers',stats.correct],['Questions answered',stats.questions],['Accuracy',percent(stats.accuracy)],['Games played',stats.games],['Last played',stats.lastPlayed?new Date(stats.lastPlayed).toLocaleDateString('en-CA'):'–']];
 for(const [name,value] of rows){list.append(el('dt',name),el('dd',String(value)));}
 tip.append(list);group.append(tip);
 return group;
}

function menuView(close){
 const menu=el('div',undefined,'profile-menu');menu.setAttribute('role','menu');menu.setAttribute('aria-label','Player');
 menu.append(el('p','Who is playing?','menu-title'));
 const people=profilesIn(rounds),entry=(person,label)=>{
  const item=el('button',undefined,'menu-item');item.type='button';item.setAttribute('role','menuitemradio');item.setAttribute('aria-checked',String(person?profile?.id===person.id:!profile));
  item.append(avatarNode(person),el('span',label));item.onclick=()=>{close();emit(person);};return item;
 };
 for(const person of people)menu.append(entry(person,person.name));
 menu.append(entry(null,'Guest (no progress)'));
 const add=el('button',undefined,'menu-item menu-add');add.type='button';add.setAttribute('role','menuitem');add.setAttribute('aria-expanded','false');add.append(el('span','+','avatar avatar-add'),el('span','Add a player'));
 // New players are created here, in the menu: no page change and no game starts.
 const form=el('form',undefined,'menu-new'),field=el('input');field.type='text';field.maxLength=40;field.autocomplete='off';field.placeholder='Name';field.setAttribute('aria-label','New player name');
 const create=el('button','Add');create.type='submit';const error=el('p',undefined,'menu-error');error.setAttribute('role','alert');form.hidden=true;form.append(field,create,error);
 add.onclick=()=>{form.hidden=!form.hidden;add.setAttribute('aria-expanded',String(!form.hidden));if(!form.hidden)field.focus();};
 form.onsubmit=event=>{event.preventDefault();let id;try{id=playerKey(field.value);}catch(problem){error.textContent=problem.message;field.focus();return;}
  const person={id,name:field.value.trim().replace(/s+/g,' ')};addProfile(person);close();emit(person);};
 menu.append(add,form);
 if(profile){
  const picker=el('div',undefined,'avatar-picker');picker.setAttribute('role','group');picker.setAttribute('aria-label','Choose an avatar');
  picker.append(el('p','Avatar','menu-title'));
  const row=el('div',undefined,'avatar-row'),current=avatarFor(profile.id);
  const choose=(avatar,label,text)=>{const b=el('button',text,'avatar-choice');b.type='button';b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(avatar===current||!avatar&&!current));b.onclick=()=>{chooseAvatar(profile.id,avatar);close();render();document.dispatchEvent(new CustomEvent('math-profile-change',{detail:profile}));};row.append(b);};
  choose(null,'Use my initial',(profile.name||'?').slice(0,1).toUpperCase());for(const a of AVATARS)choose(a,`Avatar ${a}`,a);
  picker.append(row);menu.append(picker);
 }
 return menu;
}

function render(){
 if(!corner)return;
 const open=corner.querySelector('.profile-button[aria-expanded=true]'),wasOpen=Boolean(open);
 for(const old of corner.querySelectorAll('.stat-cluster,.profile-wrap'))old.remove();
 if(profile)corner.append(statsView());
 const wrap=el('div',undefined,'profile-wrap'),button=el('button',undefined,'profile-button');button.type='button';button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');
 button.append(avatarNode(profile),el('span',profile?profile.name:'Guest','profile-name'),el('span','▾','profile-caret'));
 button.setAttribute('aria-label',profile?`Player: ${profile.name}. Change player`:'Guest. Choose a player');
 const close=()=>{menu.remove();button.setAttribute('aria-expanded','false');document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',escape,true);};
 let menu;const outside=event=>{if(!wrap.contains(event.target))close();},escape=event=>{if(event.key==='Escape'){close();button.focus();}};
 const show=()=>{menu=menuView(close);wrap.append(menu);button.setAttribute('aria-expanded','true');document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',escape,true);menu.querySelector('[aria-checked=true],.menu-item')?.focus();};
 button.onclick=()=>button.getAttribute('aria-expanded')==='true'?close():show();
 wrap.append(button);corner.append(wrap);
 if(wasOpen)show();
}

async function refresh(){
 if(busy)return;busy=true;
 try{rounds=await listRounds();}catch{rounds=[];}
 busy=false;profile=activeProfile(rounds);render();
}

function adoptThemeToggle(){
 const move=()=>{const toggle=document.querySelector('#theme-toggle');if(toggle&&toggle.parentElement!==corner){corner.prepend(toggle);return true;}return Boolean(toggle);};
 if(move())return;
 const observer=new MutationObserver(()=>{if(move())observer.disconnect();});observer.observe(document.body,{childList:true});
}

export function mountProfileCorner(){
 if(corner||typeof document==='undefined')return;
 corner=el('div',undefined,'profile-corner');corner.setAttribute('aria-label','Player and statistics');document.body.append(corner);
 adoptThemeToggle();render();refresh();
 document.addEventListener('math-rounds-changed',refresh);
 window.addEventListener('storage',event=>{if(event.key==='math-active-profile'){profile=activeProfile(rounds);render();}});
}
