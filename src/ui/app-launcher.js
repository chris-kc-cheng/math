import {el} from './dom.js';

// The 9-dot app launcher, last item in the top-right corner. The list is read live from the shared Hedgies app list;
// nothing about the apps is hard coded here. Each entry needs `id` and `url`; `name` and `icon` are used when given.
export const APP_LIST_URL='https://www.hedgies.cloud/app.json';
const NS='http://www.w3.org/2000/svg';
const dots=()=>{const svg=document.createElementNS(NS,'svg');svg.setAttribute('width','20');svg.setAttribute('height','20');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','currentColor');svg.setAttribute('aria-hidden','true');
 for(const y of [5,12,19])for(const x of [5,12,19]){const c=document.createElementNS(NS,'circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r','1.9');svg.append(c);}return svg;};

// Keep only well-formed https entries.
export function parseApps(data){
 if(!Array.isArray(data))return [];
 return data.flatMap(item=>{
  if(!item||typeof item.id!=='string'||typeof item.url!=='string')return [];
  let url;try{url=new URL(item.url);}catch{return [];}
  if(url.protocol!=='https:')return [];
  const icon=typeof item.icon==='string'?(()=>{try{const u=new URL(item.icon,url);return u.protocol==='https:'?u.href:null;}catch{return null;}})():null;
  return [{id:item.id,url:url.href,name:typeof item.name==='string'&&item.name.trim()?item.name.trim():nameFromId(item.id),icon}];
 });
}
export const nameFromId=id=>id.split(/[-_\s]+/).filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1)).join(' ');
// The current app is identified by its id alone: this app's id is the package name, injected at build time.
const selfId=typeof __APP_ID__==='string'?__APP_ID__:undefined;
export const isCurrentApp=(app,id=selfId)=>Boolean(id)&&app.id===id;

let listing;
// An app's own PWA manifest gives its name and icon: the app URL is enough to find it (the page's <link rel=manifest>, else manifest.webmanifest).
const info=new Map();
export function pickIcon(icons,base){
 const usable=(Array.isArray(icons)?icons:[]).filter(i=>i&&typeof i.src==='string'&&!/^monochrome$/i.test(i.purpose||'')).map(i=>({src:i.src,size:Math.max(0,...String(i.sizes||'').split(/s+/).map(s=>parseInt(s,10)||0))}));
 const big=usable.filter(i=>i.size>=128).sort((a,b)=>a.size-b.size)[0]??usable.sort((a,b)=>b.size-a.size)[0];
 if(!big)return null;try{const u=new URL(big.src,base);return u.protocol==='https:'?u.href:null;}catch{return null;}
}
export function manifestHref(html,base){
 const doc=new DOMParser().parseFromString(html,'text/html'),href=doc.querySelector('link[rel~="manifest"]')?.getAttribute('href');
 try{return href?new URL(href,base).href:null;}catch{return null;}
}
const json=async url=>{const r=await fetch(remote(url));if(!r.ok)throw new Error(String(r.status));return r.json();};
export const loadInfo=app=>{
 if(!info.has(app.url))info.set(app.url,(async()=>{
  let manifest;
  try{const r=await fetch(remote(app.url));if(r.ok)manifest=manifestHref(await r.text(),app.url);}catch{}
  const candidates=[manifest,new URL('manifest.webmanifest',app.url).href].filter(Boolean);
  for(const url of candidates){try{const data=await json(url);return {name:data.short_name||data.name||null,icon:pickIcon(data.icons,url)};}catch{}}
  return {name:null,icon:null};
 })());
 return info.get(app.url);
};

// In local development the Vite relay (vite.config.js) fetches remote URLs for the browser, because most hosts send no CORS header.
const remote=url=>import.meta.env?.DEV?`/__fetch?url=${encodeURIComponent(url)}`:url;
const loadApps=()=>listing??=fetch(remote(APP_LIST_URL),{headers:{accept:'application/json'}}).then(r=>{if(!r.ok)throw new Error(String(r.status));return r.json();}).then(parseApps).catch(error=>{listing=undefined;throw error;});

export function createAppLauncher(){
 const box=el('span',undefined,'launcher'),button=el('button',undefined,'launcher-button');
 button.type='button';button.setAttribute('aria-label','Apps');button.title='Apps';button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');button.append(dots());
 let menu;
 const close=()=>{menu?.remove();menu=null;button.setAttribute('aria-expanded','false');document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',escape,true);};
 const outside=event=>{if(!box.contains(event.target))close();},escape=event=>{if(event.key==='Escape'){close();button.focus();}};
 const place=()=>{const rect=button.getBoundingClientRect(),width=menu.offsetWidth,left=Math.min(Math.max(rect.right-width,8),innerWidth-width-8);menu.style.right='auto';menu.style.left=`${left-rect.left}px`;};
 const tile=app=>{
  const link=el('a',undefined,'launcher-tile');link.setAttribute('role','menuitem');link.href=app.url;link.target='_blank';link.rel='noreferrer';link.onclick=close;
  let art;
  if(app.icon){art=el('img');art.src=app.icon;art.alt='';art.width=48;art.height=48;art.onerror=()=>art.replaceWith(letter(app));}else art=letter(app);
  const name=el('span',app.name);name.append(el('span',' (opens in a new tab)','sr-only'));link.append(art,name);
  // Names and icons the list does not give come from the app's own manifest, filled in when it arrives.
  if(!app.icon||!app.explicit?.name)loadInfo(app).then(found=>{
   if(!app.explicit?.name&&found.name)name.firstChild.textContent=found.name;
   if(!app.icon&&found.icon){const img=el('img');img.src=found.icon;img.alt='';img.width=48;img.height=48;img.onload=()=>link.firstChild.replaceWith(img);}
  });
  return link;
 };
 const letter=app=>{const node=el('span',app.name.slice(0,1).toUpperCase(),'launcher-letter');node.setAttribute('aria-hidden','true');return node;};
 const fill=async()=>{
  menu.classList.add('launcher-status');menu.textContent='Loading apps…';
  try{
   const apps=(await loadApps()).filter(app=>!isCurrentApp(app));
   for(const app of apps)app.explicit={name:app.name!==nameFromId(app.id),icon:Boolean(app.icon)};
   if(!menu)return;
   menu.classList.remove('launcher-status');menu.textContent='';
   if(!apps.length){menu.classList.add('launcher-status');menu.textContent='No other apps yet.';}
   else for(const app of apps)menu.append(tile(app));
  }catch{if(!menu)return;menu.classList.add('launcher-status');menu.textContent='Couldn’t load the app list. Try again later.';}
  menu.setAttribute('aria-busy','false');place();menu.querySelector('.launcher-tile')?.focus();
 };
 button.onclick=()=>{
  if(menu){close();return;}
  menu=el('div',undefined,'launcher-menu');menu.setAttribute('role','menu');menu.setAttribute('aria-label','Apps');menu.setAttribute('aria-busy','true');
  box.append(menu);button.setAttribute('aria-expanded','true');
  document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',escape,true);place();fill();
 };
 box.append(button);return box;
}
