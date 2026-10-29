const entries=[];
let render=()=>{};
let toggle,panel;
export function placeDebug(container=document.body){if(toggle&&panel)container.append(toggle,panel);}
export function log(event,data={}){
 entries.push({time:new Date().toLocaleTimeString(),event,data});
 if(entries.length>400)entries.shift();
 render();
}
export function mountDebug(){
 toggle=document.createElement('button');toggle.className='debug-toggle';toggle.textContent='⌘';toggle.title='Debug';toggle.setAttribute('aria-label','Open debug panel');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','debug-panel');
 panel=document.createElement('aside');panel.id='debug-panel';panel.hidden=true;panel.innerHTML='<div class="debug-head"><strong>Debug</strong><button aria-label="Clear debug log">Clear</button><button aria-label="Close debug panel">×</button></div><p>App events · latest 400 · this session</p><pre></pre>';
 document.body.append(toggle,panel);
 const setOpen=open=>{panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));document.body.classList.toggle('debug-open',open);if(open)render();};
 toggle.onclick=()=>setOpen(panel.hidden);
 panel.querySelector('[aria-label="Close debug panel"]').onclick=()=>setOpen(false);
 panel.querySelector('[aria-label="Clear debug log"]').onclick=()=>{entries.length=0;render();};
 render=()=>{if(!panel.hidden){const pre=panel.querySelector('pre');pre.textContent=entries.map(e=>`${e.time} ${e.event}\n${JSON.stringify(e.data,null,2)}`).join('\n\n');pre.scrollTop=pre.scrollHeight;}};
 window.addEventListener('error',e=>log('window.error',{message:e.message,file:e.filename,line:e.lineno}));
 window.addEventListener('unhandledrejection',e=>log('promise.error',{message:String(e.reason)}));
 if('PerformanceObserver' in window){const observer=new PerformanceObserver(list=>{for(const entry of list.getEntries())log('resource.loaded',{url:entry.name,durationMs:Math.round(entry.duration),bytes:entry.transferSize,type:entry.initiatorType});});observer.observe({type:'resource',buffered:true});}
 log('app.start',{path:location.pathname,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});
}
