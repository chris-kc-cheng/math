import {tallyMarks} from './tallies.js';
// Shared primary-grade models. All geometry is illustrative; answers come from exact lesson rules.
const ns='http://www.w3.org/2000/svg';
const add=(parent,tag,attrs={},text)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=String(text);parent.append(e);return e;};
const label=(s,x,y,text,size=13)=>add(s,'text',{x,y,'font-size':size},text);
const line=(s,x1,y1,x2,y2,extra={})=>add(s,'line',{x1,y1,x2,y2,stroke:'#65717b',...extra});
const rect=(s,x,y,width,height,fill='#d5e5f7')=>add(s,'rect',{x,y,width,height,fill,stroke:'#65717b'});
function canvas(v,height=230){const s=document.createElementNS(ns,'svg');s.setAttribute('viewBox',`0 0 520 ${height}`);s.setAttribute('class','primary-model');s.setAttribute('role','img');s.setAttribute('aria-label',v.caption||'Primary math model');add(s,'title',{},v.caption||'Primary math model');return s;}
function shape(s,name,x,y,size=32,fill='#d5e5f7'){
 if(name==='circle')add(s,'circle',{cx:x+size/2,cy:y+size/2,r:size/2,fill,stroke:'#65717b'});
 else if(name==='triangle')add(s,'polygon',{points:`${x+size/2},${y} ${x+size},${y+size} ${x},${y+size}`,fill,stroke:'#65717b'});
 else if(name==='square'||name==='rectangle')rect(s,x,y,name==='rectangle'?size*1.6:size,size,fill);
 else {const n=name==='pentagon'?5:6;add(s,'polygon',{points:Array.from({length:n},(_,i)=>`${x+size/2+size/2*Math.cos(-Math.PI/2+i*2*Math.PI/n)},${y+size/2+size/2*Math.sin(-Math.PI/2+i*2*Math.PI/n)}`).join(' '),fill,stroke:'#65717b'});}
}
const table=(host,heads,rows)=>{const t=document.createElement('table'),thead=document.createElement('thead'),tr=document.createElement('tr');for(const h of heads){const th=document.createElement('th');th.scope='col';th.textContent=h;tr.append(th);}thead.append(tr);t.append(thead);const body=document.createElement('tbody');for(const row of rows){const r=document.createElement('tr');for(const text of row){const td=document.createElement('td');if(text?.nodeType)td.append(text);else td.textContent=text;r.append(td);}body.append(r);}t.append(body);host.append(t);};
export function renderPrimaryVisual(host,v){
 if(v.type==='primary-calendar'){
  const days=new Date(Date.UTC(v.year,v.month,0)).getUTCDate(),offset=new Date(Date.UTC(v.year,v.month-1,1)).getUTCDay(),rows=[];
  for(let n=0;n<Math.ceil((days+offset)/7);n++)rows.push(Array.from({length:7},(_,i)=>{const day=n*7+i-offset+1;return day>=1&&day<=days?String(day):'';}));
  table(host,['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],rows);return;
 }
 if(v.type==='primary-sort'){
  const n=(red,tri,large)=>v.items.filter(x=>(red===null||x.red===red)&&(tri===null||x.triangle===tri)&&(large===null||x.large===large)).length;
  if(v.attributes===1){table(host,['Colour','Count'],[['Red',n(true,null,null)],['Blue',n(false,null,null)]]);return;}
  if(v.attributes===2&&v.form!==1){table(host,['','Triangle','Not triangle'],[['Red',n(true,true,null),n(true,false,null)],['Not red',n(false,true,null),n(false,false,null)]]);return;}
  const s=canvas(v,250);
  if(v.attributes===2){add(s,'ellipse',{cx:190,cy:120,rx:110,ry:80,fill:'#d5e5f780',stroke:'#2459a6'});add(s,'ellipse',{cx:310,cy:120,rx:110,ry:80,fill:'#f7e0ca80',stroke:'#bd662b'});label(s,110,25,'Red');label(s,330,25,'Triangles');label(s,130,125,n(true,false,null));label(s,245,125,n(true,true,null));label(s,355,125,n(false,true,null));label(s,80,225,`Neither: ${n(false,false,null)}`);}
  else {label(s,5,125,'All');for(let c=0;c<2;c++){const y=65+c*130;line(s,30,120,110,y);label(s,75,y-10,c?'Blue':'Red');for(let t=0;t<2;t++){const y2=y-35+t*70;line(s,110,y,230,y2);label(s,160,y2-8,t?'Square':'Triangle');for(let l=0;l<2;l++){const y3=y2-13+l*26;line(s,230,y2,365,y3);label(s,370,y3+4,`${l?'Small':'Large'}: ${n(!c,!t,!l)}`,11);}}}}
  host.append(s);return;
 }
 if(v.type==='primary-chart'){
  if(v.form===0){table(host,['Fruit','Tallies (one mark = one learner)','Count'],v.labels.map((l,i)=>[l,tallyMarks(v.values[i]),v.values[i]]));return;}
  const max=Math.max(...v.values),s=canvas(v,v.form===3?Math.max(200,max*14+65):220);
  if(v.form===1){v.labels.forEach((name,i)=>{label(s,5,50+i*60,name);for(let j=0;j<v.values[i]/v.scale;j++)shape(s,'circle',105+j*28,28+i*60,20);});label(s,5,215,`Key: 1 picture = ${v.scale} learner${v.scale===1?'':'s'}`);}
  else if(v.form===3){v.labels.forEach((name,i)=>{for(let j=0;j<v.values[i];j++)label(s,105+i*145,max*14+15-j*14,'×',15);label(s,75+i*145,max*14+45,name,12);});}
  else {v.labels.forEach((name,i)=>{label(s,5,45+i*55,name);rect(s,100,25+i*55,v.values[i]/max*340,28);label(s,450,45+i*55,v.values[i]);});label(s,100,210,'Number of learners (common zero baseline)');}
  host.append(s);return;
 }
 let s;
 if(v.type==='primary-counters'){
  const cols=Math.min(20,Math.max(v.bundle||5,5)),rows=Math.ceil(v.count/cols);s=canvas(v,Math.max(70,rows*25+20));for(let i=0;i<v.count;i++)shape(s,'circle',10+i%cols*25,10+Math.floor(i/cols)*25,15);}
 else if(v.type==='primary-bag'){s=canvas(v,Math.max(100,Math.ceil((v.red+v.blue)/12)*40+40));for(let i=0;i<v.red+v.blue;i++){const x=15+i%12*40,y=20+Math.floor(i/12)*40;shape(s,'circle',x,y,25,i<v.red?'#f7e0ca':'#d5e5f7');label(s,x+7,y+17,i<v.red?'R':'B',10);}}
 else if(v.type==='primary-blocks'){
  const parts=v.parts||[Math.floor(v.number/100),Math.floor(v.number/10)%10,v.number%10],objects=[];parts.forEach((count,i)=>{for(let n=0;n<count;n++)objects.push(i);});s=canvas(v,Math.max(100,Math.ceil(objects.length/9)*65+30));objects.forEach((type,i)=>{const x=8+i%9*56,y=20+Math.floor(i/9)*65;if(type===0){rect(s,x,y,43,43);for(let n=1;n<10;n++){line(s,x+n*4.3,y,x+n*4.3,y+43);line(s,x,y+n*4.3,x+43,y+n*4.3);}}else if(type===1){rect(s,x,y,8,43);for(let n=1;n<10;n++)line(s,x,y+n*4.3,x+8,y+n*4.3);}else rect(s,x,y,8,8);label(s,x,y+57,[100,10,1][type],10);});}
 else if(v.type==='primary-share'){
  const whole=Math.floor(v.items/v.sharers),left=v.wholeOnly?0:v.items%v.sharers,slots=Math.max(1,whole+(left?1:0)),w=Math.min(55,390/slots);s=canvas(v,v.sharers*39+15);for(let p=0;p<v.sharers;p++){label(s,3,25+p*39,`Friend ${p+1}`,11);for(let u=0;u<slots;u++)for(let k=0;k<v.sharers;k++)rect(s,75+u*(w+3)+k*w/v.sharers,8+p*39,w/v.sharers,22,u<whole||k<left?'#d5e5f7':'#fff');}}
 else if(v.type==='primary-equivalent'){
  s=canvas(v,130);v.denominators.forEach((d,i)=>{label(s,5,35+i*60,`${v.numerators[i]} of ${d}`,12);for(let k=0;k<d;k++)rect(s,100+k*380/d,15+i*60,380/d,28,k<v.numerators[i]?'#d5e5f7':'#fff');});}
 else if(v.type==='primary-groups'){
  s=canvas(v,Math.ceil(v.groups/3)*75+10);for(let g=0;g<v.groups;g++){const x=5+g%3*170,y=10+Math.floor(g/3)*75;add(s,'rect',{x,y,width:155,height:62,rx:8,fill:'none',stroke:'#65717b'});for(let j=0;j<v.size;j++)shape(s,'circle',x+8+j%5*28,y+7+Math.floor(j/5)*24,16);}}
 else if(v.type==='primary-pattern'){
  s=canvas(v,Math.ceil(v.values.length/10)*75+15);v.values.forEach((name,i)=>{const x=5+i%10*51,y=10+Math.floor(i/10)*75;if(name==='?')label(s,x+10,y+25,'?',25);else shape(s,name,x,y,28);label(s,x,y+47,name,8);});}
 else if(v.type==='primary-objects'){
  s=canvas(v,Math.ceil(v.items.length/4)*78+10);v.items.forEach((item,i)=>{const x=8+i%4*128,y=8+Math.floor(i/4)*78;shape(s,item.triangle?'triangle':'square',x,y,item.large?32:20,item.red?'#f7e0ca':'#d5e5f7');label(s,x,y+48,`${item.red?'red':'blue'} ${item.large?'large':'small'}`,10);label(s,x,y+62,item.triangle?'triangle':'square',10);});}
 else if(v.type==='primary-shape'){s=canvas(v,180);shape(s,['triangle','rectangle','square','circle','pentagon','hexagon'][v.shape],130,20,120);}
 else if(v.type==='primary-fold'){
  s=canvas(v,190);const x=110,y=25,w=v.shape===0?260:140,h=140;if(v.shape===2)shape(s,'circle',x,y,w);else rect(s,x,y,w,h);const endpoints=v.line===0?[x+w/2,y,x+w/2,y+h]:v.line===1?[x,y+h/2,x+w,y+h/2]:[x,y,x+w,y+h];line(s,...endpoints,{'stroke-dasharray':'6 4','stroke-width':2});}
 else if(v.type==='primary-tiles'){
  const rows=v.rows,cols=v.columns;s=canvas(v,(v.rearrange?Math.max(rows,cols):rows)*26+50);for(let i=0;i<rows*cols;i++)rect(s,15+i%cols*25,10+Math.floor(i/cols)*25,25,25);if(v.rearrange)for(let i=0;i<rows*cols;i++)rect(s,280+i%rows*25,10+Math.floor(i/rows)*25,25,25);}
 else if(v.type==='primary-position'){
  s=canvas(v,220);const names=['circle','square','triangle'];names.forEach((name,i)=>{const x=v.layout===0?50+i*150:210,y=v.layout===0?75:10+i*68;shape(s,name,x,y,35);label(s,x+45,y+23,name,12);});}
 else if(v.type==='primary-route'){
  s=canvas(v,220);const x=40,y=180;for(let i=0;i<=6;i++){line(s,x+i*45,0,x+i*45,y);if(i<5)line(s,x,y-i*45,x+270,y-i*45);}const points=[[x,y],[x+v.right*45,y],[x+v.right*45,y-v.up*45],[x+(v.right-v.left)*45,y-v.up*45]];add(s,'polyline',{points:points.map(p=>p.join(',')).join(' '),fill:'none',stroke:'#2459a6','stroke-width':4});label(s,x,208,'Start');label(s,points.at(-1)[0]+5,points.at(-1)[1]+20,'Finish');}
 else if(v.type==='primary-ruler'){
  s=canvas(v,100);const w=450/(v.start+v.length+1);rect(s,15+v.start*w,5,v.length*w,20);line(s,15,45,15+(v.start+v.length)*w,45);for(let n=0;n<=v.start+v.length;n++){line(s,15+n*w,40,15+n*w,54);label(s,12+n*w,72,n,10);}for(let n=0;n<v.length;n+=v.unit)line(s,15+(v.start+n)*w,10,15+(v.start+n)*w,25);}
 else if(v.type==='primary-rectangle'){s=canvas(v,190);rect(s,120,30,240,110);label(s,215,20,v.length);label(s,375,90,v.width);label(s,215,165,v.length);label(s,90,90,v.width);}
 else if(v.type==='primary-clock'){
  s=canvas(v,220);const cx=200,cy=105,r=85;add(s,'circle',{cx,cy,r,fill:'none',stroke:'#65717b','stroke-width':2});for(let n=1;n<=12;n++){const a=n*Math.PI/6-Math.PI/2;label(s,cx+72*Math.cos(a)-5,cy+72*Math.sin(a)+5,n,14);}const hand=(a,length,width)=>line(s,cx,cy,cx+length*Math.cos(a),cy+length*Math.sin(a),{'stroke-width':width,stroke:'#2459a6'});hand((v.hour%12+v.minute/60)*Math.PI/6-Math.PI/2,44,5);hand(v.minute*Math.PI/30-Math.PI/2,64,2);add(s,'circle',{cx,cy,r:4,fill:'#2459a6'});}
 else if(v.type==='primary-money'){
  s=canvas(v,Math.ceil(v.pieces.length/7)*60+15);v.pieces.forEach((value,i)=>{const x=5+i%7*73,y=10+Math.floor(i/7)*60;if(value>=500)rect(s,x,y,66,36);else shape(s,'circle',x+10,y,38);label(s,x+15,y+25,value>=100?'$'+value/100:value+'¢',12);});}
 else if(v.type==='primary-solid'){
  s=canvas(v,210);if(v.shape<=1){rect(s,150,65,130,100);add(s,'polygon',{points:'150,65 190,25 320,25 280,65',fill:'#d5e5f7',stroke:'#65717b'});add(s,'polygon',{points:'280,65 320,25 320,125 280,165',fill:'#f7e0ca',stroke:'#65717b'});}
  else if(v.shape===2){add(s,'polygon',{points:'140,165 220,20 330,165',fill:'#d5e5f7',stroke:'#65717b'});line(s,220,20,230,190);line(s,140,165,230,190);line(s,330,165,230,190);}
  else if(v.shape===3){rect(s,160,45,130,120);add(s,'ellipse',{cx:225,cy:45,rx:65,ry:20,fill:'#f7e0ca',stroke:'#65717b'});add(s,'ellipse',{cx:225,cy:165,rx:65,ry:20,fill:'#d5e5f7',stroke:'#65717b'});}
  else {add(s,'path',{d:'M160 165 L225 20 L290 165 Z',fill:'#d5e5f7',stroke:'#65717b'});add(s,'ellipse',{cx:225,cy:165,rx:65,ry:20,fill:'#f7e0ca',stroke:'#65717b'});}
 }
 if(s)host.append(s);else throw Error(`Unsupported primary visual: ${v.type}`);
}
