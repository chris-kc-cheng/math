// Grades 9–10 models: function graphs, box plots and labelled triangles. All geometry is computed from the lesson's own numbers.
const ns='http://www.w3.org/2000/svg';
const palette=['#2459a6','#bd662b','#287858','#8b58a1'];
const add=(parent,tag,attrs={},text)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=String(text);parent.append(e);return e;};
function canvas(v,width,height){
 const s=document.createElementNS(ns,'svg');s.setAttribute('viewBox',`0 0 ${width} ${height}`);s.setAttribute('class','secondary-model');s.setAttribute('role','img');s.setAttribute('aria-label',v.caption||'Math model');
 add(s,'title',{},v.caption||'Math model');return s;
}
const nice=range=>range<=10?1:range<=24?2:range<=60?5:10;
const text=(s,x,y,content,size=12,anchor='middle',extra={})=>add(s,'text',{x,y,'font-size':size,'text-anchor':anchor,fill:'currentColor',...extra},content);

function graph(host,v){
 const width=520,height=300,left=44,right=20,top=18,bottom=34;
 const pts=[...v.curves.flatMap(c=>c.points),...(v.points||[]).map(p=>[p.x,p.y])];
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
 let minX=Math.min(0,...xs),maxX=Math.max(1,...xs),minY=Math.min(0,...ys),maxY=Math.max(1,...ys);
 const padX=Math.max(1,(maxX-minX)*0.06),padY=Math.max(1,(maxY-minY)*0.08);minX-=padX;maxX+=padX;minY-=padY;maxY+=padY;
 const sx=(width-left-right)/(maxX-minX),sy=(height-top-bottom)/(maxY-minY);
 const X=x=>left+(x-minX)*sx,Y=y=>height-bottom-(y-minY)*sy;
 const s=canvas(v,width,height),stepX=nice(maxX-minX),stepY=nice(maxY-minY);
 for(let x=Math.ceil(minX/stepX)*stepX;x<=maxX;x+=stepX){add(s,'line',{x1:X(x),y1:top,x2:X(x),y2:height-bottom,stroke:'#9aa5b1','stroke-opacity':.35});if(x!==0)text(s,X(x),height-bottom+15,x,11);}
 for(let y=Math.ceil(minY/stepY)*stepY;y<=maxY;y+=stepY){add(s,'line',{x1:left,y1:Y(y),x2:width-right,y2:Y(y),stroke:'#9aa5b1','stroke-opacity':.35});if(y!==0)text(s,left-6,Y(y)+4,y,11,'end');}
 add(s,'line',{x1:left,y1:Y(0),x2:width-right,y2:Y(0),stroke:'currentColor','stroke-width':1.5});add(s,'line',{x1:X(0),y1:top,x2:X(0),y2:height-bottom,stroke:'currentColor','stroke-width':1.5});
 text(s,width-right-4,Y(0)-6,'x',12,'end');text(s,X(0)+8,top+10,'y',12,'start');
 v.curves.forEach((curve,i)=>{
  const colour=palette[i%palette.length],clipped=curve.points.filter(p=>p[1]>=minY-1&&p[1]<=maxY+1);
  add(s,'polyline',{points:clipped.map(p=>`${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' '),fill:'none',stroke:colour,'stroke-width':2.6,'stroke-linejoin':'round'});
 });
 for(const p of v.points||[]){add(s,'circle',{cx:X(p.x),cy:Y(p.y),r:4.5,fill:'#bd662b',stroke:'currentColor'});text(s,X(p.x)+8,Y(p.y)-8,`(${p.x}, ${p.y})`,11,'start');}
 host.append(s);
}

function boxplot(host,v){
 const width=520,height=130,left=30,right=30,span=Math.max(1,v.max-v.min),X=x=>left+(x-v.min)/span*(width-left-right),s=canvas(v,width,height);
 const step=nice(span);
 add(s,'line',{x1:left,y1:92,x2:width-right,y2:92,stroke:'currentColor'});
 for(let t=Math.ceil(v.min/step)*step;t<=v.max;t+=step){add(s,'line',{x1:X(t),y1:88,x2:X(t),y2:96,stroke:'currentColor'});text(s,X(t),110,t,11);}
 add(s,'line',{x1:X(v.min),y1:48,x2:X(v.q1),y2:48,stroke:'currentColor','stroke-width':2});add(s,'line',{x1:X(v.q3),y1:48,x2:X(v.max),y2:48,stroke:'currentColor','stroke-width':2});
 add(s,'line',{x1:X(v.min),y1:36,x2:X(v.min),y2:60,stroke:'currentColor','stroke-width':2});add(s,'line',{x1:X(v.max),y1:36,x2:X(v.max),y2:60,stroke:'currentColor','stroke-width':2});
 add(s,'rect',{x:X(v.q1),y:30,width:Math.max(2,X(v.q3)-X(v.q1)),height:36,fill:'#d5e5f7','fill-opacity':.7,stroke:'#2459a6','stroke-width':2});
 add(s,'line',{x1:X(v.median),y1:30,x2:X(v.median),y2:66,stroke:'#bd662b','stroke-width':3});
 [['min',v.min],['Q1',v.q1],['med',v.median],['Q3',v.q3],['max',v.max]].forEach(([name,value],i)=>text(s,X(value),i%2?20:82,`${name} ${value}`,11));
 host.append(s);
}

function triangle(host,v){
 const width=420,height=230,s=canvas(v,width,height),A=[60,190],B=[360,190],C=[190,40];
 add(s,'polygon',{points:[A,B,C].map(p=>p.join(',')).join(' '),fill:'#d5e5f7','fill-opacity':.6,stroke:'#2459a6','stroke-width':3,'stroke-linejoin':'round'});
 const [a,b,c]=v.sides||[],[angA,angB,angC]=v.angles||[];
 if(a)text(s,(B[0]+C[0])/2+16,(B[1]+C[1])/2,a,13);if(b)text(s,(A[0]+C[0])/2-16,(A[1]+C[1])/2,b,13);if(c)text(s,(A[0]+B[0])/2,B[1]+20,c,13);
 if(angA)text(s,A[0]+30,A[1]-8,angA,12);if(angB)text(s,B[0]-30,B[1]-8,angB,12);if(angC)text(s,C[0],C[1]+26,angC,12);
 host.append(s);
}

function rightTriangle(host,v){
 // Right angle at the lower left; the marked angle is at the lower right, so "opposite" is the vertical leg and "adjacent" the bottom leg.
 const width=420,height=240,s=canvas(v,width,height),A=[70,200],B=[350,200],C=[70,50];
 add(s,'polygon',{points:[A,B,C].map(p=>p.join(',')).join(' '),fill:'#d5e5f7','fill-opacity':.6,stroke:'#2459a6','stroke-width':3,'stroke-linejoin':'round'});
 add(s,'path',{d:`M${A[0]} ${A[1]-18} h18 v18`,fill:'none',stroke:'currentColor','stroke-width':1.5});
 if(v.opposite)text(s,A[0]-12,(A[1]+C[1])/2,v.opposite,13,'end');
 if(v.adjacent)text(s,(A[0]+B[0])/2,A[1]+22,v.adjacent,13);
 if(v.hypotenuse)text(s,(B[0]+C[0])/2+34,(B[1]+C[1])/2-6,v.hypotenuse,13);
 if(v.angle){add(s,'path',{d:`M${B[0]-46} ${B[1]} A46 46 0 0 0 ${B[0]-40} ${B[1]-23}`,fill:'none',stroke:'#bd662b','stroke-width':2});text(s,B[0]-62,B[1]-8,v.angle,13);}
 host.append(s);
}

export function renderSecondaryVisual(host,v){
 if(v.type==='secondary-graph')graph(host,v);
 else if(v.type==='secondary-boxplot')boxplot(host,v);
 else if(v.type==='secondary-triangle')triangle(host,v);
 else if(v.type==='secondary-right-triangle')rightTriangle(host,v);
}
