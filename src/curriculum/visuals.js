import {renderPrimaryVisual} from './primary-visuals.js';
import {renderSecondaryVisual} from './secondary-visuals.js';
const colours=['#2459a6','#bd662b','#287858','#8b58a1'];
import {setMathText} from '../ui/math-text.js';
const element=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=String(text);return node;};
const svgElement=(tag,attributes={},text)=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));if(text!==undefined)node.textContent=String(text);return node;};
const add=(svg,tag,attrs,text)=>{const node=svgElement(tag,attrs,text);svg.append(node);return node;};
function canvas(caption,width=480,height=240){const svg=svgElement('svg',{viewBox:`0 0 ${width} ${height}`,role:'img','aria-label':caption});svg.append(svgElement('title',{},caption));return svg;}
export function renderVisual(host,visual){
 const figure=element('figure');figure.className='practice-visual';const caption=visual.caption||'Math model';
 if(visual.type==='right-triangle'){
  const svg=canvas(caption,400,240),scale=Math.min(260/visual.b,150/visual.a),right=70+visual.b*scale,top=185-visual.a*scale;add(svg,'polygon',{points:`70,185 ${right},185 70,${top}`,fill:'#d5e5f7',stroke:colours[0],'stroke-width':3});add(svg,'path',{d:'M70 163H92V185',fill:'none',stroke:colours[0],'stroke-width':2});add(svg,'text',{x:30,y:(top+185)/2,'font-size':19},visual.a);add(svg,'text',{x:(70+right)/2,y:217,'font-size':19},visual.b);add(svg,'text',{x:(70+right)/2+15,y:(top+185)/2-15,'font-size':20},'c = ?');figure.append(svg);
 }else if(visual.type.startsWith('primary-'))renderPrimaryVisual(figure,visual);
 else if(visual.type.startsWith('secondary-'))renderSecondaryVisual(figure,visual);
 else if(['histogram','multiple-bars','broken-line','circle-graph'].includes(visual.type)){
  const svg=canvas(caption,480,280);
  if(visual.type==='circle-graph'){
   const total=visual.values.reduce((a,b)=>a+b,0);let angle=-Math.PI/2;
   visual.values.forEach((value,i)=>{if(!value)return;const end=angle+2*Math.PI*value/total;
    if(value===total)add(svg,'circle',{cx:135,cy:130,r:95,fill:colours[i%4]});
    else add(svg,'path',{d:`M135 130 L${135+95*Math.cos(angle)} ${130+95*Math.sin(angle)} A95 95 0 ${end-angle>Math.PI?1:0} 1 ${135+95*Math.cos(end)} ${130+95*Math.sin(end)} Z`,fill:colours[i%4],stroke:'#fff'});
    add(svg,'rect',{x:270,y:55+i*45,width:16,height:16,fill:colours[i%4]});add(svg,'text',{x:295,y:68+i*45,'font-size':13},`${visual.labels[i]}: ${value} of ${total}`);angle=end;
   });
  }else{
   const series=visual.series||[{name:'Frequency',values:visual.values}],all=series.flatMap(s=>s.values),maximum=Math.max(1,...all),max=maximum<=5?maximum:Math.ceil(maximum/5)*5,ticks=Math.min(5,max),count=series[0].values.length,w=390/count,y=n=>225-n/max*170;
   add(svg,'text',{x:45,y:visual.type==='multiple-bars'?42:20,'font-size':11},visual.type==='broken-line'?'Temperature (°C)':visual.type==='multiple-bars'?'Books read':'Frequency');
   for(let i=0;i<=ticks;i++){const v=max*i/ticks;add(svg,'line',{x1:45,x2:450,y1:y(v),y2:y(v),stroke:'#e1e6eb'});add(svg,'text',{x:38,y:y(v)+4,'text-anchor':'end','font-size':11},Number(v.toFixed(1)));}
   if(visual.type==='broken-line'){
    const points=visual.values.map((v,i)=>[45+(i+.5)*w,y(v)]);
    add(svg,'polyline',{points:points.map(p=>p.join(',')).join(' '),fill:'none',stroke:colours[0],'stroke-width':2});
    points.forEach(([cx,cy],i)=>{add(svg,'circle',{cx,cy,r:4,fill:colours[0]});add(svg,'text',{x:cx,y:247,'text-anchor':'middle','font-size':11},i+1);});
   }else{
    series.forEach((s,j)=>s.values.forEach((v,i)=>add(svg,'rect',{x:45+i*w+(visual.type==='multiple-bars'?j*w/(series.length+1):0),y:y(v),width:visual.type==='multiple-bars'?w/(series.length+1):w,height:225-y(v),fill:colours[j%4],stroke:'#65717b'})));
    visual.labels.forEach((label,i)=>add(svg,'text',{x:45+(i+.5)*w,y:247,'text-anchor':'middle','font-size':11},label));
    if(series.length>1)series.forEach((s,j)=>{add(svg,'rect',{x:50+j*180,y:8,width:12,height:12,fill:colours[j%4]});add(svg,'text',{x:69+j*180,y:19,'font-size':12},s.name);});
   }
   add(svg,'line',{x1:45,x2:450,y1:225,y2:225,stroke:'#65717b'});
  }
  figure.append(svg);
 }else if(visual.type==='table'){
  const table=element('table'),head=element('thead'),row=element('tr'),body=element('tbody');
  for(const title of visual.columns){const th=element('th',title);th.scope='col';row.append(th);}head.append(row);
  for(const values of visual.rows){const tr=element('tr');values.forEach(value=>{const td=element('td');setMathText(td,value);tr.append(td);});body.append(tr);}table.append(head,body);figure.append(table);
 }else if(visual.type==='code'){
  figure.append(element('pre',visual.lines.join('\n')));
 }else if(visual.type==='infographic'){
  const panel=element('div');panel.className='sample-infographic';panel.append(element('strong',visual.headline),element('p',visual.statistic));figure.append(panel);
 }else if(visual.type==='groups'){
  const panel=element('div');panel.className='unknown-groups';for(let i=0;i<visual.groups;i++)panel.append(element('span','n'));panel.append(element('span',`+ ${visual.extra}`));figure.append(panel);
 }else if(visual.type==='fraction-bars'){
  const count=Math.max(1,Math.ceil(visual.n/visual.d)),svg=canvas(caption,480,Math.min(count,12)*36+20),width=420/visual.d;
  for(let row=0;row<Math.min(count,12);row++)for(let part=0;part<visual.d;part++)add(svg,'rect',{x:30+part*width,y:8+row*36,width,height:26,fill:row*visual.d+part<visual.n?'#b9d3f1':'#fff',stroke:'#65717b','stroke-width':.8});figure.append(svg);
  figure.append(element('p',`${visual.n} shaded parts, each 1/${visual.d} of a whole.`));
 }else if(visual.type==='bars'){
  const baseline=visual.baseline||0,max=Math.max(...visual.labels.map((_,i)=>visual.series.reduce((n,s)=>n+s.values[i],0))),span=Math.max(1,Math.ceil((max-baseline)/5))*5,svg=canvas(caption,480,90+visual.labels.length*48);
  const x=n=>95+(n-baseline)/span*345;
  for(let i=0;i<=5;i++){const value=baseline+span*i/5;add(svg,'line',{x1:x(value),x2:x(value),y1:20,y2:30+visual.labels.length*48,stroke:'#e1e6eb'});add(svg,'text',{x:x(value),y:45+visual.labels.length*48,'text-anchor':'middle','font-size':11},Number(value.toFixed(1)));}
  visual.labels.forEach((label,i)=>{let previous=0;add(svg,'text',{x:85,y:42+i*48,'text-anchor':'end','font-size':12},label);visual.series.forEach((series,j)=>{const start=Math.max(previous,baseline),end=previous+series.values[i];if(end>baseline)add(svg,'rect',{x:x(start),y:25+i*48,width:(end-start)/span*345,height:25,fill:colours[j%colours.length]});previous=end;});add(svg,'text',{x:445,y:42+i*48,'font-size':11},previous);});figure.append(svg);
  const legend=element('p',visual.series.map((s,i)=>`${s.name} (${['blue','orange','green','purple'][i%4]})`).join(' · '));figure.append(legend);figure.append(element('p',`Horizontal scale: ${visual.unit}; starts at ${baseline}.`));
 }else if(visual.type==='real-inequality'){
  const svg=canvas(caption,480,120),centre=240,span=Math.max(4,Math.ceil(Math.abs(visual.boundary)/4)),x=n=>centre+(n-visual.boundary)/span*90;
  add(svg,'line',{x1:30,x2:450,y1:55,y2:55,stroke:'#65717b'});
  const end=visual.greater?440:40;add(svg,'line',{x1:centre,x2:end,y1:55,y2:55,stroke:colours[0],'stroke-width':3});add(svg,'path',{d:visual.greater?'M 430 48 L 440 55 L 430 62':'M 50 48 L 40 55 L 50 62',fill:'none',stroke:colours[0],'stroke-width':3});
  for(let i=-2;i<=2;i++){const value=visual.boundary+i*span;add(svg,'line',{x1:x(value),x2:x(value),y1:50,y2:60,stroke:'#65717b'});add(svg,'text',{x:x(value),y:85,'font-size':11,'text-anchor':'middle'},Number(value.toFixed(2)));}
  add(svg,'circle',{cx:centre,cy:55,r:5,fill:visual.closed?colours[0]:'white',stroke:colours[0],'stroke-width':2});figure.append(svg);
 }else if(visual.type==='venn'){
  const svg=canvas(caption,480,240);add(svg,'rect',{x:20,y:10,width:440,height:210,fill:'#fff',stroke:'#65717b'});add(svg,'circle',{cx:190,cy:110,r:80,fill:'#d5e5f780',stroke:colours[0]});add(svg,'circle',{cx:290,cy:110,r:80,fill:'#f7e0ca80',stroke:colours[1]});
  for(const [x,y,text] of [[140,110,visual.onlyA],[240,110,visual.both],[340,110,visual.onlyB],[420,195,visual.neither],[140,30,'A'],[340,30,'B']])add(svg,'text',{x,y,'text-anchor':'middle','font-size':17},text);figure.append(svg);
 }else if(visual.type==='probability-tree'){
  const {red,blue,replacement}=visual,total=red+blue,svg=canvas(caption,480,230);
  for(const [index,[name,count]] of [['R',red],['B',blue]].entries()){
   const y=index?170:60;add(svg,'line',{x1:35,y1:115,x2:205,y2:y,stroke:colours[index]});add(svg,'text',{x:100,y:(115+y)/2-10,'font-size':12},`${name}: ${count}/${total}`);
   const nextRed=replacement?red:red-(index===0?1:0),nextBlue=replacement?blue:blue-(index===1?1:0),denominator=replacement?total:total-1;
   for(const [j,[label,n]] of [['R',nextRed],['B',nextBlue]].entries()){const endY=y+(j?25:-25);add(svg,'line',{x1:205,y1:y,x2:380,y2:endY,stroke:colours[j]});add(svg,'text',{x:390,y:endY+4,'font-size':12},`${label}: ${n}/${denominator}`);}
  }figure.append(svg);
 }else if(visual.type==='tessellation'){
  const svg=canvas(caption,480,220),sides=visual.sides;
  if(sides===4)for(let row=0;row<4;row++)for(let col=0;col<8;col++)add(svg,'rect',{x:30+col*48,y:10+row*48,width:48,height:48,fill:colours[(row+col)%2]+'33',stroke:'#65717b'});
  if(sides===3)for(let row=0;row<4;row++)for(let col=0;col<8;col++){const h=24*Math.sqrt(3),x=20+col*48+row%2*24,y=20+row*h;add(svg,'polygon',{points:`${x},${y+h} ${x+24},${y} ${x+48},${y+h}`,fill:'#d5e5f7',stroke:'#65717b'});add(svg,'polygon',{points:`${x+24},${y} ${x+72},${y} ${x+48},${y+h}`,fill:'#f7e0ca',stroke:'#65717b'});}
  if(sides===6)for(let col=0;col<8;col++)for(let row=0;row<4;row++){const h=30*Math.sqrt(3),cx=40+col*45,cy=20+row*h+(col%2?h/2:0);add(svg,'polygon',{points:Array.from({length:6},(_,i)=>`${cx+30*Math.cos(i*Math.PI/3)},${cy+30*Math.sin(i*Math.PI/3)}`).join(' '),fill:'#d5e5f7',stroke:'#65717b'});}figure.append(svg);
 }else if(visual.type==='cuboid'){
  const svg=canvas(caption,480,240),{length:l,width:w,height:h}=visual;
  [['Top',l,w],['Front',l,h],['Side',w,h]].forEach(([label,a,b],i)=>{const scale=Math.min(80/a,105/b);add(svg,'rect',{x:20+i*115,y:50,width:a*scale,height:b*scale,fill:colours[i]+'22',stroke:colours[i]});add(svg,'text',{x:20+i*115,y:30,'font-size':13},label);add(svg,'text',{x:20+i*115,y:180,'font-size':12},`${a} × ${b}`);});
  const s=Math.min(60/l,30/w,75/h),p=(x,y,z)=>[355+x*s+y*s*.5,150-y*s*.35-z*s],face=vertices=>vertices.map(v=>p(...v).join(',')).join(' ');
  add(svg,'text',{x:350,y:30,'font-size':12},'Perspective');for(const [i,vertices] of [[[0,0,0],[l,0,0],[l,0,h],[0,0,h]],[[l,0,0],[l,w,0],[l,w,h],[l,0,h]],[[0,0,h],[l,0,h],[l,w,h],[0,w,h]]].entries())add(svg,'polygon',{points:face(vertices),fill:colours[i]+'33',stroke:'#65717b'});figure.append(svg);
 }else if(visual.type==='line'||visual.type==='inequality'){
  const svg=canvas(caption,480,120),max=visual.max||1,x=n=>30+n/max*420;
  add(svg,'line',{x1:30,y1:55,x2:450,y2:55,stroke:'#65717b','stroke-width':2});
  const ticks=max<=12?max:10;for(let i=0;i<=ticks;i++){const value=max*i/ticks;add(svg,'line',{x1:x(value),y1:50,x2:x(value),y2:60,stroke:'#65717b'});add(svg,'text',{x:x(value),y:82,'text-anchor':'middle','font-size':12},Number(value.toFixed(2)));}
  if(visual.type==='inequality'){
   const start=visual.greater?visual.boundary:max*0,end=visual.greater?max:visual.boundary;
   add(svg,'line',{x1:x(start),x2:x(end),y1:55,y2:55,stroke:colours[0],'stroke-width':4});
   visual.values.forEach(value=>add(svg,'circle',{cx:x(value),cy:55,r:2.5,fill:colours[0]}));add(svg,'circle',{cx:x(visual.boundary),cy:55,r:5,fill:'white',stroke:colours[0],'stroke-width':2});
  }else visual.points.forEach((point,i)=>{const offset=visual.points.length>1?(i%2?25:-20):-20;add(svg,'circle',{cx:x(point.value),cy:55,r:4,fill:colours[i%4]});add(svg,'text',{x:x(point.value),y:55+offset,'text-anchor':'middle','font-size':12,fill:colours[i%4]},point.label);});figure.append(svg);
 }else if(['points','transform','polygon'].includes(visual.type)){
  const all=[...visual.points,...(visual.result||[])],minX=Math.min(0,...all.map(p=>p[0])),minY=Math.min(0,...all.map(p=>p[1])),maxX=Math.max(1,...all.map(p=>p[0]),visual.pivot?.[0]||0)+1,maxY=Math.max(1,...all.map(p=>p[1]),visual.pivot?.[1]||0)+1,svg=canvas(caption,480,280),scale=Math.min(390/(maxX-minX),210/(maxY-minY)),independent=visual.type==='points'&&visual.xLabel!=='x',x=n=>45+(n-minX)*(independent?390/(maxX-minX):scale),y=n=>235-(n-minY)*(independent?210/(maxY-minY):scale);
  if(visual.type!=='polygon'){
   for(let n=Math.floor(minX);n<=maxX;n+=visual.tickStep||Math.max(1,Math.ceil((maxX-minX)/12))){add(svg,'line',{x1:x(n),x2:x(n),y1:y(minY),y2:y(maxY),stroke:n===0?'#65717b':'#e7ecf1'});add(svg,'text',{x:x(n),y:y(minY)+18,'text-anchor':'middle','font-size':10},n);}
   for(let n=Math.floor(minY);n<=maxY;n+=visual.tickStep||Math.max(1,Math.ceil((maxY-minY)/12))){add(svg,'line',{x1:x(minX),x2:x(maxX),y1:y(n),y2:y(n),stroke:n===0?'#65717b':'#e7ecf1'});add(svg,'text',{x:x(minX)-10,y:y(n)+4,'text-anchor':'end','font-size':10},n);}
   add(svg,'text',{x:440,y:265,'text-anchor':'end','font-size':12},visual.xLabel||'x');add(svg,'text',{x:8,y:15,'font-size':12},visual.yLabel||'y');
  }
  if(visual.type==='polygon'||visual.type==='transform'){
   add(svg,'polygon',{points:visual.points.map(p=>`${x(p[0])},${y(p[1])}`).join(' '),fill:'#d5e5f7',stroke:colours[0],'stroke-width':2});
   if(visual.result)add(svg,'polygon',{points:visual.result.map(p=>`${x(p[0])},${y(p[1])}`).join(' '),fill:'#f7e0ca',stroke:colours[1],'stroke-width':2});
   if(visual.sideLabels)visual.sideLabels.forEach((label,i)=>{const p=visual.points[i],q=visual.points[(i+1)%visual.points.length];add(svg,'text',{x:(x(p[0])+x(q[0]))/2,y:(y(p[1])+y(q[1]))/2+15,'font-size':12,'text-anchor':'middle'},label);});
  }else visual.points.forEach((p,i)=>{add(svg,'circle',{cx:x(p[0]),cy:y(p[1]),r:5,fill:colours[i%4]});add(svg,'text',{x:x(p[0])+8,y:y(p[1])-8,'font-size':11},`(${p.join(', ')})`);});
  if(visual.mirror!==undefined)add(svg,'line',{x1:x(visual.mirror),x2:x(visual.mirror),y1:y(0),y2:y(maxY),stroke:'#8b58a1','stroke-dasharray':'4 3'});
  if(visual.horizontalMirror!==undefined)add(svg,'line',{x1:x(0),x2:x(maxX),y1:y(visual.horizontalMirror),y2:y(visual.horizontalMirror),stroke:'#8b58a1','stroke-dasharray':'4 3'});
  if(visual.pivot)add(svg,'circle',{cx:x(visual.pivot[0]),cy:y(visual.pivot[1]),r:4,fill:'#8b58a1'});figure.append(svg);
 }else if(visual.type==='angles'){
  const svg=canvas(caption,480,230),radius=75;
  visual.angles.forEach((angle,i)=>{const cx=visual.angles.length===1?240:125+i*235,cy=180,rad=angle*Math.PI/180;
   if(visual.protractor){for(let deg=0;deg<=180;deg+=5){const t=deg*Math.PI/180;add(svg,'line',{x1:cx+radius*Math.cos(t),y1:cy-radius*Math.sin(t),x2:cx+(radius+(deg%10===0?8:4))*Math.cos(t),y2:cy-(radius+(deg%10===0?8:4))*Math.sin(t),stroke:'#9ca9b6'});if(deg%30===0)add(svg,'text',{x:cx+(radius+24)*Math.cos(t),y:cy-(radius+24)*Math.sin(t),'font-size':11,'text-anchor':'middle'},deg);}}
   add(svg,'line',{x1:cx,y1:cy,x2:cx+radius,y2:cy,stroke:colours[0],'stroke-width':2});add(svg,'line',{x1:cx,y1:cy,x2:cx+radius*Math.cos(rad),y2:cy-radius*Math.sin(rad),stroke:colours[1],'stroke-width':2});add(svg,'path',{d:`M ${cx+30} ${cy} A 30 30 0 0 0 ${cx+30*Math.cos(rad)} ${cy-30*Math.sin(rad)}`,fill:'none',stroke:'#65717b'});if(!visual.hideAngle)add(svg,'text',{x:cx,y:cy+30,'font-size':13,'text-anchor':'middle'},`${angle}°`);
  });figure.append(svg);
 }else if(visual.type==='cube-views'){
  const svg=canvas(caption,480,230);
  add(svg,'text',{x:35,y:20,'font-size':13},'Top (numbers = heights)');
  for(let row=0;row<2;row++)for(let col=0;col<2;col++){const i=row*2+col;add(svg,'rect',{x:35+col*35,y:45+(1-row)*35,width:35,height:35,fill:'#d5e5f7',stroke:'#65717b'});add(svg,'text',{x:52+col*35,y:68+(1-row)*35,'font-size':13,'text-anchor':'middle'},visual.heights[i]);}
  add(svg,'text',{x:35,y:135,'font-size':11},'Front ↓');
  for(const [index,[label,heights]] of [['Front',visual.front],['Right side',visual.side]].entries()){
   const left=200+index*140;add(svg,'text',{x:left,y:20,'font-size':13},label);
   heights.forEach((height,col)=>{for(let row=0;row<height;row++)add(svg,'rect',{x:left+col*32,y:150-(row+1)*32,width:32,height:32,fill:colours[index]+'33',stroke:colours[index]});});
  }figure.append(svg);
 }
 figure.append(element('figcaption',caption));host.append(figure);return figure;
}
