import {pick,decimal,fraction,step,lesson,table,polygon,numeric,choice} from './common.js';
import {safeInteger} from '../core/exact.js';
import {scale} from '../core/relationships.js';
const triangle=(a,b,c)=>{const x=(a*a+c*c-b*b)/(2*a),y=Math.sqrt(Math.max(0,c*c-x*x));return [[0,0],[a,0],[x,y]];};
export const spatialRules={
 'triangle-angles':{
  generate:r=>{const a=pick(r,3,10)*10,b=pick(r,2,Math.floor((170-a)/10))*10;return [pick(r,3,8),a,b];},
  solve:([base,a,b])=>{const c=180-a-b,side=base*Math.sin(b*Math.PI/180)/Math.sin(c*Math.PI/180),points=[[0,0],[base,0],[side*Math.cos(a*Math.PI/180),side*Math.sin(a*Math.PI/180)]],largest=Math.max(a,b,c),name=largest<90?'acute':largest===90?'right':'obtuse';return lesson(`Construct a triangle with base ${base} cm and base angles ${a}° and ${b}°. Find its third angle and classify it.`,[
   step('A triangle has a total of 180° inside. Subtract the two known angles.',`180^{\\circ}-${a}^{\\circ}-${b}^{\\circ}=${c}^{\\circ}`),
   step(`Draw a ${base} cm base. Use a protractor to draw inward rays at ${a}° and ${b}° from its ends; their meeting point is the third vertex.`,undefined,polygon(points,`Base ${base} cm; interior angles ${a}°, ${b}°, ${c}°`)),
   step(`This is a ${name} triangle: ${name==='acute'?'all angles are less than 90°':name==='right'?'one angle is exactly 90°':'one angle is greater than 90°'}.`)
  ],{answer:{thirdAngle:c,type:name},response:{kind:'choice',options:['acute','right','obtuse'],answer:name}});}
 },
 'coordinate-scale':{
  generate:r=>[pick(r,0,6),pick(r,0,6),[2,5,10][pick(r,0,2)]],
  solve:([x,y,scale])=>lesson(`A grid counts by ${scale} on both axes. A point is ${x} grid intervals right and ${y} intervals up from the origin. Read its coordinates.`,[
   step('Count the units, not just the grid intervals.',`${x}\\times${scale}=${x*scale},\\quad${y}\\times${scale}=${y*scale}`),
   step('Write horizontal coordinate first, then vertical coordinate.',`(${x*scale},${y*scale})`,{type:'points',points:[[x*scale,y*scale]],tickStep:scale,caption:`Each grid interval represents ${scale} units`,xLabel:'x',yLabel:'y'})
  ],{answer:`(${x*scale}, ${y*scale})`})
 },
 'congruent-triangles':{
  generate:r=>{const a=pick(r,3,7),b=pick(r,3,7);return [a,b,pick(r,Math.abs(a-b)+2,a+b-1),pick(r,0,1)];},
  solve:([a,b,c,same])=>{const second= same?[a,b,c]:[a*2,b*2,c*2];return lesson(`Triangle A has sides ${a}, ${b}, ${c} cm. Triangle B has sides ${second.join(', ')} cm. Are they congruent?`,[
   step('Compare all three corresponding side lengths. A turn or flip preserves every length.',undefined,table(['Triangle','Side 1','Side 2','Side 3'],[['A',a,b,c],['B',...second]],'Corresponding sides')),
   step(same?'All three sides match. The triangles have the same size and shape.':'The second triangle is a larger scale copy. It has the same shape but not the same size, so it is not congruent.'),
   step('To construct a congruent triangle, copy a base length and use arcs from its endpoints for the other two lengths.',undefined,{...polygon(triangle(a,b,c),'Triangle A and the dimensions needed for a congruent copy'),sideLabels:[`${a} cm`,`${b} cm`,`${c} cm`]})
  ],{answer:same?'Yes':'No',response:choice(['No','Yes'],same)});}
 },
 'congruent-parallelograms':{
  generate:r=>[pick(r,3,9),pick(r,2,5),pick(r,0,1)],
  solve:([base,height,same])=>{const points=[[0,0],[base,0],[base+2,height],[2,height]],other=points.map(([x,y])=>[same?x+base+3:2*x+base+3,y*(same?1:2)]);return lesson('Compare these two parallelograms. Can a slide, turn, or flip make them overlap exactly?',[
   step('Compare corresponding side lengths and angles, not just area.',undefined,{type:'transform',points,result:other,caption:'Compare size and shape; blue is A, orange is B'}),
   step(same?'The second is a translated copy: corresponding lengths and angles match, so they are congruent.':'The orange shape has doubled lengths. It is not congruent to the blue one.'),
   step('To construct a congruent copy, copy the base, the adjacent side, and the angle between them. Equal area alone is not enough.')
  ],{answer:same?'Yes':'No',response:choice(['No','Yes'],same)});}
 },
 'measure-angle':{
  generate:r=>[pick(r,1,35)*5],
  solve:([angle])=>lesson('Read the marked angle using the protractor scale that starts at the base ray’s 0°.',[
   step('Place the vertex at the centre and align the base ray with 0°.',undefined,{type:'angles',angles:[angle],protractor:true,hideAngle:true,caption:'Measure from the right-hand base ray; the tick spacing is 10°'}),
   step(`The ray falls at ${angle}°. If it is between 10° ticks, use the halfway 5° mark.`,`${angle}^{\\circ}`),
   step(`Compare with 90° as a reasonableness check: ${angle<90?'less than a right angle':angle===90?'exactly a right angle':'more than a right angle'}.`)
  ],{visual:{type:'angles',angles:[angle],protractor:true,hideAngle:true,caption:'Read this angle from the base ray'},answer:angle,response:numeric(angle)})
 },
 'triangle-sides':{
  generate:r=>{const a=pick(r,3,9),b=pick(r,3,9);return [a,b,pick(r,Math.abs(a-b)+1,a+b-1)];},
  solve:([a,b,c])=>{const name=a===b&&b===c?'equilateral':a===b||b===c||a===c?'isosceles':'scalene';return lesson(`Construct and classify a triangle with side lengths ${a}, ${b}, and ${c} cm.`,[
   step('Any two sides must add to more than the third.',`${a}+${b}>${c},\\quad${a}+${c}>${b},\\quad${b}+${c}>${a}`),
   step(`Draw a ${a} cm base. Draw arcs of radius ${c} cm from its left end and ${b} cm from its right end. Join an intersection to both ends.`,undefined,{...polygon(triangle(a,b,c),`Side lengths: ${a}, ${b}, ${c} cm`),sideLabels:[`${a} cm`,`${b} cm`,`${c} cm`]}),
   step(`This is ${name}: ${name==='equilateral'?'all three sides match':name==='isosceles'?'at least two sides match':'all three sides differ'}.`)
  ],{answer:name,response:{kind:'choice',options:['equilateral','isosceles','scalene'],answer:name},builder:{kind:'triangle',sides:[a,b,c]}});}
 },
 'congruent-shapes':{
  generate:r=>[pick(r,2,8),pick(r,2,6),pick(r,0,1)],
  solve:([w,h,same])=>{const otherW=same?w:w+1;return lesson(`Rectangle A is ${w} × ${h}. Rectangle B is ${otherW} × ${h}, turned around. Are they congruent?`,[
   step('Congruent means the same shape and size. Sliding, turning, and flipping do not change side lengths.',undefined,table(['Shape','Width','Height'],[['A',w,h],['B',otherW,h]],'Compare corresponding dimensions')),
   step(same?'Both pairs of corresponding sides match, so the rectangles can overlap exactly.':'One pair of sides differs. Turning cannot fix that, so these are not congruent.'),
   step('To construct a congruent copy, preserve every side length and angle; tracing is one useful check.',undefined,polygon([[0,0],[w,0],[w,h],[0,h]],'A congruent copy preserves the dimensions'))
  ],{answer:same?'Yes':'No',response:choice(['No','Yes'],same)});}
 },
 'cube-views':{
  generate:r=>[pick(r,1,3),pick(r,1,3),pick(r,1,3),pick(r,1,3)],
  solve:heights=>{const front=[Math.max(heights[0],heights[2]),Math.max(heights[1],heights[3])],side=[Math.max(heights[0],heights[1]),Math.max(heights[2],heights[3])];return lesson(`Four cube towers stand on a 2 × 2 base. The front row has heights ${heights[0]}, ${heights[1]}; the back row has ${heights[2]}, ${heights[3]}. Draw three views.`,[
   step('From above, each occupied position is one square, regardless of height.',undefined,{type:'cube-views',heights,front,side,caption:'Top view and tower heights'}),
   step('From the front, use the tallest tower in each left-to-right column.',undefined,table(['View','First column','Second column'],[['Front',...front],['Right side (front to back)',...side]],'Towers behind one another overlap in the view')),
   step('From the right side, use the tallest tower in each front-to-back row. Different structures can share some of the same views.')
  ],{answer:{front,side}});}
 },
 'coordinates':{
  generate:r=>[pick(r,0,5),pick(r,0,5),pick(r,1,4),pick(r,0,3)],
  solve:([x,y,dx,dy])=>lesson(`Plot (${x}, ${y}), then translate ${dx} units right and ${dy} units up.`,[
   step('The first coordinate is horizontal; the second is vertical.',`(${x},${y})`,{type:'points',points:[[x,y]],caption:'Start point',xLabel:'x',yLabel:'y'}),
   step('Add the horizontal and vertical changes to the matching coordinates.',`(${x}+${dx},${y}+${dy})=(${x+dx},${y+dy})`,{type:'points',points:[[x,y],[x+dx,y+dy]],caption:'Start and translated points',xLabel:'x',yLabel:'y'})
  ],{answer:`(${x+dx}, ${y+dy})`,builder:{kind:'coordinates',x,y}})
 },
 'transformation':{
  generate:r=>[pick(r,1,4),pick(r,1,4),pick(r,0,4)],
  solve:([x,y,type])=>{const pivot=5,points=[[x,y],[x+1,y],[x,y+1]],names=['Translate 2 units right','Reflect in the vertical line x = 5','Rotate 90° anticlockwise about (5, 5)','Rotate 180° about (5, 5)','Reflect in the horizontal line y = 5'],move=([a,b])=>type===0?[a+2,b]:type===1?[2*pivot-a,b]:type===2?[2*pivot-b,a]:type===3?[2*pivot-a,2*pivot-b]:[a,2*pivot-b],result=points.map(move);return lesson(`${names[type]} for triangle (${x}, ${y}), (${x+1}, ${y}), (${x}, ${y+1}).`,[
   step('Transform every vertex using the same movement. Distances and angles stay the same.',undefined,{type:'transform',points,result,pivot:type===2||type===3?[5,5]:undefined,mirror:type===1?5:undefined,horizontalMirror:type===4?5:undefined,caption:names[type]}),
   step('Join the transformed vertices in the same order.',undefined,table(['Vertex','Before','After'],points.map((p,i)=>[i+1,`(${p.join(', ')})`,`(${result[i].join(', ')})`]),'Corresponding vertices'))
  ],{answer:result});}
 },
 'metric-units':{
  generate:r=>[pick(r,0,3),pick(r,2,9)],
  solve:([type,n])=>{const samples=[['the length of a pencil','cm','A pencil is much shorter than a metre.'],['the area of a classroom','m²','Area counts squares, so use square metres.'],['the mass of a school bag','kg','A full bag is more conveniently described in kilograms than grams.'],['the capacity of a bottle','mL','Millilitres describe a small liquid capacity.']], [object,unit,why]=samples[type];return lesson(`Choose a suitable metric unit to measure ${object}. Make an estimate, then explain how to check it.`,[
   step(why),step(`An estimate of ${type===0?n*2:type===1?n*5:type===2?n:n*100} ${unit} is a starting guess, not a measured fact.`),
   step(`Check using ${['a ruler','a metre measure and square-area calculation','a scale','a marked measuring container'][type]}. Record the measurement and compare it with your estimate.`)
  ],{answer:unit,response:{kind:'choice',options:['cm','m²','kg','mL'],answer:unit}});}
 },
 'metric-conversion':{
  generate:r=>[pick(r,1,999),pick(r,0,3)],
  solve:([tenths,type])=>{const units=[['m','cm',100],['L','mL',1000],['kg','g',1000],['km','m',1000]], [from,to,factor]=units[type],answer=safeInteger(scale(tenths,factor,10));return lesson(`Convert ${decimal(tenths,1)} ${from} to ${to}.`,[
   step(`Each ${from} contains ${factor} ${to}.`,`1\\,\\text{${from}}=${factor}\\,\\text{${to}}`),
   step('Multiply when changing to smaller units.',`${decimal(tenths,1)}\\times${factor}=${answer}\\,\\text{${to}}`)
  ],{answer,response:numeric(answer)});}
 },
 'compare-angles':{
  generate:r=>[pick(r,1,6),pick(r,1,6),15],
  solve:([a,b,wedge])=>lesson(`Angle A contains ${a} copies of a paper wedge; angle B contains ${b}. Each wedge is ${wedge}°. Compare them.`,[
   step('Use the same wedge, align the vertices, and count without gaps or overlaps.',undefined,{type:'angles',angles:[a*wedge,b*wedge],caption:'Two angles measured with the same wedge'}),
   step('More copies of the same wedge means a larger angle.',`${a*wedge}^{\\circ}${a<b?'<':a>b?'>':'='}${b*wedge}^{\\circ}`)
  ],{answer:a<b?'B':a>b?'A':'Equal',response:{kind:'choice',options:['A','B','Equal'],answer:a<b?'B':a>b?'A':'Equal'}})
 },
 'construct-angle':{
  generate:r=>[pick(r,1,36)*5],
  solve:([angle])=>lesson(`Construct a ${angle}° angle with a protractor.`,[
   step('Draw a base ray. Put the protractor centre on its endpoint and align the correct 0° line with the ray.',undefined,{type:'angles',angles:[angle],protractor:true,caption:`Target angle: ${angle}°`}),
   step(`Read the scale that starts at your base ray's 0°. Mark ${angle}° and draw a ray from the vertex through the mark.`),
   step(`Check against 90° and 180°. This is ${angle<90?'acute':angle===90?'a right angle':angle<180?'obtuse':'a straight angle'}.`)
  ],{answer:angle,response:numeric(angle),builder:{kind:'angle',angle}})
 },
 'shape-area':{
  generate:r=>[pick(r,2,15),pick(r,2,12),pick(r,0,1)],
  solve:([b,h,triangleShape])=>lesson(`Find the area of a ${triangleShape?'triangle':'parallelogram'} with base ${b} cm and perpendicular height ${h} cm.`,[
   step(triangleShape?'Two identical triangles make a parallelogram. A triangle is half its area.':'Cut and move the side triangle to make a rectangle with the same base and height.',undefined,polygon(triangleShape?[[0,0],[b,0],[b/3,h]]:[[0,0],[b,0],[b+2,h],[2,h]],`Base ${b} cm; perpendicular height ${h} cm`)),
   step(triangleShape?'Multiply base by height, then divide by two.':'Multiply base by perpendicular height.',triangleShape?`A=\\frac{${b}\\times${h}}2=${fraction(b*h,2)}\\,\\text{cm}^2`:`A=${b}\\times${h}=${b*h}\\,\\text{cm}^2`)
  ],{answer:triangleShape?b*h/2:b*h,response:numeric(triangleShape?b*h/2:b*h)})
 },
 'area-perimeter':{
  generate:r=>[pick(r,2,6),pick(r,2,6)],
  solve:([a,b])=>{const area=2*a*b,p1=2*(a+2*b),p2=2*(2*a+b);return lesson(`Compare rectangles ${a} × ${2*b} and ${2*a} × ${b}. Can equal areas have different perimeters?`,[
   step('Calculate the area and distance around each rectangle.',undefined,table(['Rectangle','Area (square units)','Perimeter (units)'],[[`${a} × ${2*b}`,area,p1],[`${2*a} × ${b}`,area,p2]],'Same area, compare boundary lengths')),
   step(p1===p2?'These two have matching perimeters too, because their dimensions are swapped. Equal area does not force a different perimeter.':'The areas match but the perimeters differ. Spreading an area into a longer shape changes its boundary.'),
   step('Area counts squares inside; perimeter counts length around. They measure different things.')
  ],{answer:{area,perimeters:[p1,p2]}});}
 }
};
