import {rational,multiply,subtract,add,divide,power,integerSquareRoot} from '../core/exact.js';
import {scale} from '../core/relationships.js';
import {tex,fixed} from '../core/format.js';
import {pick,step,lesson,table,numeric} from '../lesson.js';
import {rootForm} from './number.js';
export const spatialRules8={
 'g8-pythagorean-leg':{
  generate:r=>{const [a,b,c]=[[3,4,5],[5,12,13],[8,15,17]][pick(r,0,2)],k=pick(r,1,3);return [c*k,a*k];},
  solve:([hypotenuse,leg])=>{const squared=hypotenuse*hypotenuse-leg*leg;return lesson(`A right triangle has hypotenuse ${hypotenuse} and one leg ${leg}. Find the other leg.`,[step('Subtract the known leg’s squared area from the hypotenuse’s squared area.',`b^2=${hypotenuse}^2-${leg}^2=${squared}`),step('Use the nonnegative square root for the missing length.',`b=\\sqrt{${squared}}=${rootForm(squared)}`)],{answer:rootForm(squared)});}
 },
 'g8-tessellation':{
  generate:r=>[[3,4,5,6][pick(r,0,3)]],
  solve:([sides])=>{const angle=divide(multiply(sides-2,180),sides),around=divide(360,angle),tiles=around.d===1n;return lesson(`Can congruent regular ${sides}-sided polygons meet edge-to-edge at every vertex without gaps?`,[
   step('Calculate the regular polygon’s interior angle.',`\\frac{(${sides}-2)\\times180^{\\circ}}{${sides}}=${tex(angle)}^{\\circ}`),
   step('Angles around a vertex must add to 360°.',`360\\div${tex(angle)}=${tex(around)}`,tiles?{type:'tessellation',sides,caption:'Repeated regular polygons meet without gaps or overlaps'}:undefined),
   step(tiles?'A whole number of these angles fits at each vertex. Translations and rotations can repeat this tiling.':'A non-whole number of regular polygons would be needed. This regular polygon cannot tile this way alone; mixed or nonregular tilings are a different question.')
  ],{answer:tiles?'Yes':'No',response:{kind:'choice',options:['Yes','No'],answer:tiles?'Yes':'No'}});}
 },
 'g8-scale-model':{
  generate:r=>[pick(r,2,8),pick(r,2,6),pick(r,2,6),pick(r,2,5)],
  solve:([length,width,height,k])=>lesson(`Build a cuboid model at scale 1:${k}. Its actual length, width, and height are ${length*k}, ${width*k}, ${height*k} cm. Use its views.`,[
   step('Divide every actual length by the same scale factor.',undefined,table(['View','Model dimensions (cm)'],[['Top',`${length} × ${width}`],['Front',`${length} × ${height}`],['Side',`${width} × ${height}`]],'Consistent dimensions across views')),
   step('Join matching faces into a three-dimensional model. A scale model preserves shape, not actual size.',undefined,{type:'cuboid',length,width,height,caption:'Top, front, side, and perspective views of the same scaled cuboid'})
  ],{answer:{length,width,height}})
 },
 'g8-scale-drawing':{
  generate:r=>[pick(r,2,10),pick(r,2,8),pick(r,50,200),pick(r,2,4)],
  solve:([l,w,ratio,k])=>{const actualL=scale(l,ratio),actualW=scale(w,ratio),area=multiply(actualL,actualW);return lesson(`A rectangular drawing is ${l} × ${w} cm at scale 1:${ratio}. Find actual lengths and area, then enlarge the drawing by ${k}.`,[
   step('Multiply each drawing length by the scale denominator.',`${l}\\times${ratio}=${tex(actualL)}\\,\\text{cm},\\quad${w}\\times${ratio}=${tex(actualW)}\\,\\text{cm}`),
   step('Areas scale by the square of the length factor.',`${l*w}\\times${ratio}^2=${tex(area)}\\,\\text{cm}^2`),
   step('Enlarging the drawing changes its drawing-to-actual ratio, not the real object.',`\\text{new drawing: }${l*k}\\times${w*k}\\,\\text{cm},\\quad\\text{scale }${k}:${ratio}`)
  ],{answer:tex(area)});}
 },
 'g8-cartesian':{
  generate:r=>[pick(r,-5,5),pick(r,-5,5),pick(r,0,5),pick(r,2,3)],
  solve:([x,y,type,k])=>{const points=[[x,y],[x+2,y],[x,y+1]],move=([a,b])=>type===0?[a+3,b-2]:type===1?[-a,b]:type===2?[a,-b]:type===3?[-b,a]:type===4?[-a,-b]:[a*k,b*k],result=points.map(move),names=['Translate 3 right and 2 down','Reflect in the y-axis','Reflect in the x-axis','Rotate 90° anticlockwise about the origin','Rotate 180° about the origin',`Dilate by factor ${k} from the origin`];return lesson(names[type]+'. Predict the new vertices.',[
   step('Apply the same coordinate rule to every vertex.',undefined,{type:'transform',points,result,pivot:[0,0],caption:names[type]}),
   step('A dilation scales distances; rotations, reflections, and translations preserve lengths.',undefined,table(['Before','After'],points.map((p,i)=>[`(${p.join(', ')})`,`(${result[i].join(', ')})`]),'Corresponding coordinates'))
  ],{answer:result});}
 },
 'g8-metric-prefix':{
  generate:r=>[pick(r,1,9),pick(r,0,5)],
  solve:([n,index])=>{const prefixes=[['mega','M',6],['giga','G',9],['tera','T',12],['micro','μ',-6],['nano','n',-9],['pico','p',-12]],[name,symbol,e]=prefixes[index],result=multiply(n,power(10,e));return lesson(`Represent ${n} ${name}metres in metres using powers of ten.`,[step(`The prefix ${name} (${symbol}) represents a factor of 10^${e}.`,`${n}\\times10^{${e}}\\,\\text{m}`),step('Write the same value in ordinary notation.',`${fixed(result,Math.max(0,-e))}\\,\\text{m}`)],{answer:tex(result)});}
 },
 'g8-angle-properties':{
  generate:r=>[pick(r,20,150),pick(r,3,10),pick(r,0,3)],
  solve:([angle,n,type])=>{const result=type===0?180-angle:type===1?angle:type===2?divide(multiply(n-2,180),n):divide(360,n),answer=typeof result==='number'?String(result):tex(result);return lesson(['Find the supplementary angle on a straight line.','Find the vertically opposite angle at an intersection.','Find each interior angle of a regular polygon.','Find each exterior angle of a regular polygon.'][type],[
   step(type<2?`The given angle is ${angle}°.`:`The regular polygon has ${n} sides.`),
   step(type===0?'Angles on a straight line add to 180°.':type===1?'Vertically opposite angles match. Corresponding and alternate angles also match when lines are parallel.':type===2?'The interior-angle sum is (n − 2) × 180°; divide equally for a regular polygon.':'A full turn of exterior angles totals 360°.',type===0?`180^{\\circ}-${angle}^{\\circ}=${answer}^{\\circ}`:type===1?`${angle}^{\\circ}`:type===2?`\\frac{(${n}-2)180^{\\circ}}{${n}}=${answer}^{\\circ}`:`\\frac{360^{\\circ}}{${n}}=${answer}^{\\circ}`)
  ],{answer});}
 },
 'g8-composite-area':{
  generate:r=>[pick(r,8,15),pick(r,8,15),pick(r,2,6),pick(r,2,6)],
  solve:([w,h,c,d])=>{const area=subtract(multiply(w,h),multiply(c,d)),perimeter=2*(w+h);return lesson(`Cut a ${c} × ${d} corner from a ${w} × ${h} rectangle. Find the L-shape’s area and perimeter.`,[
   step('Subtract the missing rectangle’s area.',`${w}\\times${h}-${c}\\times${d}=${tex(area)}`,{type:'polygon',points:[[0,0],[w,0],[w,h-d],[w-c,h-d],[w-c,h],[0,h]],caption:'L-shape: outer rectangle with a top-right rectangular corner removed'}),
   step('Trace every boundary edge. The two removed outer lengths are replaced by equal inner lengths.',`P=2(${w}+${h})=${perimeter}`)
  ],{answer:{area:tex(area),perimeter}});}
 },
 'g8-composite-solid':{
  generate:r=>[pick(r,2,10)],
  solve:([s])=>lesson(`Two cubes of side ${s} cm are joined on one whole face. Find volume and external surface area.`,[
   step('Add both volumes; joining does not remove material.',`V=2\\times${s}^3=${tex(multiply(2,power(s,3)))}\\,\\text{cm}^3`,{type:'cuboid',length:2*s,width:s,height:s,caption:'Two cubes joined face-to-face'}),
   step('The two touching faces become internal and must not be counted.',`SA=12\\times${s}^2-2\\times${s}^2=${tex(multiply(10,power(s,2)))}\\,\\text{cm}^2`)
  ],{answer:{volume:tex(multiply(2,power(s,3))),surfaceArea:tex(multiply(10,power(s,2)))}})
 },
 'g8-circle-composite':{
  generate:r=>[pick(r,3,12),pick(r,2,6)],
  solve:([l,r])=>lesson(`A track is a rectangle ${l} m long and ${2*r} m wide with a semicircle on each short end. Find area and outside perimeter.`,[
   step('Two semicircles make a whole circle of radius r.',`A=${l}\\times${2*r}+\\pi\\times${r}^2=${2*l*r}+${r*r}\\pi\\,\\text{m}^2`),
   step('The outside boundary has two long straight sides and one circle’s circumference.',`P=2\\times${l}+2\\pi\\times${r}=${2*l}+${2*r}\\pi\\,\\text{m}`),
   step('These are exact expressions in π. Use a stated approximation only when an approximate decimal is requested.')
  ],{answer:{area:`${2*l*r}+${r*r}π`,perimeter:`${2*l}+${2*r}π`}})
 },
 'g8-pythagorean':{
  generate:r=>[pick(r,2,12),pick(r,2,12)],
  solve:([a,b])=>{const squared=a*a+b*b;return lesson(`A right triangle has perpendicular legs ${a} and ${b}. Find the hypotenuse.`,[
   step('The square on the hypotenuse has the combined area of the squares on the two legs.',`c^2=${a}^2+${b}^2=${squared}`,{type:'polygon',points:[[0,0],[a,0],[0,b]],caption:`Perpendicular legs ${a} and ${b}; the sloping side is c`}),
   step('Take the nonnegative square root because this is a length.',`c=\\sqrt{${squared}}=${rootForm(squared)}`),
   step('To find a missing leg instead, subtract the known leg’s square from the hypotenuse’s square before taking the square root.')
  ],{answer:rootForm(squared)});}
 }
};
