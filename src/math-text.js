import katex from 'katex';

// Plain text from the generators may say "3/4" or "2 1/2". Show those as typeset fractions, never as slashes.
// A fraction is digits/digits that is not part of a date, a path or a longer slash chain.
const FRACTION=/(?<![\w./])(?:(\d+)\s)?([-−]?)(\d+)\/(\d+)(?![\w/]|\.\d)/g;

/** Split text into plain pieces and fractions: [{text}, {tex}, ...]. Pure, so it is easy to test. */
export function splitMathText(text){
 const source=String(text),parts=[];let last=0;
 for(const match of source.matchAll(FRACTION)){
  const [whole,wholePart,sign,numerator,denominator]=match;
  // "7 3/4" is a mixed number only when the leading digits are alone (not "3 groups of 3/4" style prose).
  const mixed=wholePart!==undefined&&!sign;
  const start=match.index+(mixed?0:whole.length-`${sign}${numerator}/${denominator}`.length);
  if(start>last)parts.push({text:source.slice(last,start)});
  parts.push({tex:`${mixed?`${wholePart}\\,`:''}${sign?'-':''}\\frac{${numerator}}{${denominator}}`});
  last=match.index+whole.length;
 }
 if(last<source.length)parts.push({text:source.slice(last)});
 return parts.length?parts:[{text:source}];
}

/** Fill `node` with text, typesetting any fractions. Returns the node. */
export function setMathText(node,text){
 node.textContent='';
 for(const part of splitMathText(text)){
  if(part.tex===undefined){node.append(part.text);continue;}
  const span=document.createElement('span');span.className='inline-math';
  try{katex.render(part.tex,span,{displayMode:false,throwOnError:true,trust:false});}catch{span.textContent=part.tex;}
  node.append(span);
 }
 return node;
}
