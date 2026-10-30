import {rational,parseDecimal,add,subtract,multiply,divide,compare,sum,power,roundHalfUp} from './core/exact.js';
import {substituteLinear,summarizeData,scale,balance} from './core/relationships.js';
import {tex,scaledDecimal,decimalOrFraction} from './core/format.js';

// Read only the bounded number notation emitted by our own renderers, never arbitrary LaTeX.
export function answerNumber(input){
 const text=String(input).trim().replace(/^x\s*=\s*/,''),fraction=text.match(/^\\frac\{([+-]?\d+)\}\{(\d+)\}$/),mixed=text.match(/^(\d+)\\,\\frac\{(\d+)\}\{(\d+)\}$/);
 if(fraction)return rational(fraction[1],fraction[2]);
 if(mixed)return add(mixed[1],rational(mixed[2],mixed[3]));
 return parseDecimal(text);
}
export function substitutionMath(coefficient,constant,value,format=tex){
 const w=n=>`\\left(${format(n)}\\right)`;
 if(compare(coefficient,0)===0||compare(value,0)===0)return format(constant);
 const term=compare(coefficient,1)===0?format(value):compare(coefficient,-1)===0?`-${w(value)}`:`${w(coefficient)}\\times${w(value)}`;
 return compare(constant,0)===0?term:compare(constant,0)<0?`${term}-${format(multiply(constant,-1))}`:`${term}+${format(constant)}`;
}
function equality(text,leftMath,rightMath,left,right){
 const valid=compare(left,right)===0;
 return {text:`${text} ${valid?'The values match.':'The values do not match, so this proposed answer fails the check.'}`,math:`${leftMath}${valid?'=':'\\ne'}${rightMath}`,valid};
}
function bundle(method,steps,replaceFrom){return {method,steps:steps.map(step=>({...step,stage:'verification'})),valid:steps.every(step=>step.valid!==false),...(replaceFrom===undefined?{}:{replaceFrom})};}
function inverseCheck(op,left,right,candidate,format=tex){
 const inverse={'+':'-','-':'+','*':'/','/':'*'}[op],symbol={'+':'+','-':'-','*':'\\times','/':'\\div'}[inverse];
 if(op==='*'&&compare(right,0)===0)return bundle('Zero-product check',[equality('A product with a zero factor must be zero.',tex(candidate),'0',candidate,0)]);
 const restored=({'+':add,'-':subtract,'*':multiply,'/':divide})[inverse](candidate,right);
 return bundle('Inverse operation',[equality('Undo the last operation to recover the starting amount.',`\\left(${format(candidate)}\\right)${symbol}\\left(${format(right)}\\right)`,format(left),restored,left)]);
}
function equationCheck(a,b,c,d,x,replaceFrom,format=tex){
 const expression=(coefficient,constant)=>substitutionMath(coefficient,constant,x,format),
  left=substituteLinear(a,b,x),right=substituteLinear(c,d,x),valid=compare(left,right)===0;
 return bundle('Substitution',[
  {text:'Substitute the proposed value for x into both original sides.',math:`${expression(a,b)}\\;\\stackrel{?}{=}\\;${expression(c,d)}`},
  equality('Evaluate each side independently.',format(left),format(right),left,right)
 ],replaceFrom);
}
function rootSquare(input){
 const text=String(input),match=text.match(/^(\d+)?\\sqrt\{(\d+)\}$/);
 return match?multiply(power(match[1]||1,2),match[2]):power(answerNumber(text),2);
}
const nonnegativeRoot=input=>/^(\d+)?\\sqrt\{(\d+)\}$/.test(String(input))||compare(answerNumber(input),0)>=0;
const currentAnswer=lesson=>lesson.answer??lesson.steps.at(-1)?.math;
const modeList=values=>{const counts=new Map();for(const n of values)counts.set(n,(counts.get(n)||0)+1);const max=Math.max(...counts.values());return max===1?[]:[...counts].filter(([,count])=>count===max).map(([n])=>n).sort((a,b)=>a-b);};

/** A verification is a separate tutorial stage. It checks a candidate against original constraints. */
export function verificationFor(rule,v,lesson,proposed){
 const [a,b,c,d,e]=v,read=()=>answerNumber(proposed??currentAnswer(lesson));
 const scalarInverse={times:()=>['*',a,b],divide:()=>['/',a,b],add:()=>['+',rational(a,100),rational(b,100)],subtract:()=>['-',rational(a,100),rational(b,100)],'decimal-addition':()=>['+',rational(a,100),rational(b,100)],'decimal-subtraction':()=>['-',rational(a,100),rational(b,100)],'fraction-add':()=>['+',rational(a,c),rational(b,c)],'fraction-subtract':()=>['-',rational(a,c),rational(b,c)]};
 if(Object.hasOwn(scalarInverse,rule)){
  const [op,left,right]=scalarInverse[rule](),proof=inverseCheck(op,left,right,read(),['add','subtract','decimal-addition','decimal-subtraction'].includes(rule)?decimalOrFraction:tex);
  if(rule==='decimal-addition'||rule==='decimal-subtraction')proof.replaceFrom=lesson.steps.length-1;
  return proof;
 }
 if(rule==='whole-add-subtract')return inverseCheck(c?'-':'+',c&&b>a?b:a,c&&b>a?a:b,read());
 if(rule==='order'){const candidate=answerNumber(proposed??lesson.steps.at(-1).math),product=multiply(b,c);return inverseCheck('+',a,product,candidate);}
 if(rule==='long-multiply'||rule==='long-divide'){
  const board=lesson.lesson;
  if(rule==='long-multiply')return inverseCheck('*',a,b,answerNumber(proposed??board.answer));
  const quotient=answerNumber(proposed??board.answer),remainder=answerNumber(board.remainder),total=add(multiply(b,quotient),remainder),range=compare(remainder,0)>=0&&compare(remainder,b)<0;
  return bundle('Quotient and remainder',[equality('Multiply the quotient by the divisor, then add the remainder.',`${b}\\times${tex(quotient)}+${tex(remainder)}`,String(a),total,a),{text:range?'The remainder is nonnegative and smaller than the divisor.':'The remainder is outside its allowed range.',math:`0\\le${tex(remainder)}<${b}`,valid:range}]);
 }
 if(['equation-add','equation-times','equation-two'].includes(rule)){
  const row=[...lesson.steps].reverse().find(step=>/^x\s*=/.test(step.math||'')),candidate=answerNumber(proposed??row.math);
  return equationCheck(rule==='equation-add'?1:a,rule==='equation-add'?a:rule==='equation-two'?b:0,0,rule==='equation-two'?c:b,candidate,lesson.steps.length-1);
 }
 if(rule==='equation-subtract'||rule==='equation-divide')return equationCheck(rule==='equation-divide'?rational(1,a):1,rule==='equation-subtract'?-a:0,0,b,read(),lesson.steps.length-1);
 if(rule==='g8-equation'){
  const A=rational(a,10),B=rational(b,10),C=rational(c,10),D=rational(d,10);
  if(lesson.answer==='all'||lesson.answer==='none'){
   const sameSlope=compare(A,C)===0,sameConstant=compare(B,D)===0,valid=lesson.answer==='all'?sameSlope&&sameConstant:sameSlope&&!sameConstant;
   return bundle('Equation structure',[{text:lesson.answer==='all'?'Matching variable terms and constants make this an identity for every real x.':'Matching variable terms cancel, leaving different constants. No x can fix that contradiction.',math:`${tex(B)}${sameConstant?'=':'\\ne'}${tex(D)}`,valid}]);
  }
  return equationCheck(A,B,C,D,read(),lesson.steps.length-1,decimalOrFraction);
 }
 if(rule==='mixed'||rule==='fraction'){
  const original=rule==='mixed'?add(a,rational(b,c)):rational(a,b),candidate=answerNumber(proposed??lesson.steps.at(-1).math);
  return bundle('Equivalent fractions',[equality('Cross-multiply to check that the two forms represent the same value.',`${original.n}\\times${candidate.d}`,`${candidate.n}\\times${original.d}`,multiply(original.n,candidate.d),multiply(candidate.n,original.d))]);
 }
 if(['g8-integer-add-sub','g8-integer-multiply-divide','g8-fraction-add-sub','g8-fraction-multiply-divide'].includes(rule)){
  const fractions=rule.includes('fraction'),op=['+','-','*','/'][fractions?e:c];return inverseCheck(op,fractions?rational(a,b):a,fractions?rational(c,d):b,read());
 }
 if(rule==='g8-pythagorean'||rule==='g8-pythagorean-leg'){
  const candidate=proposed??lesson.answer,squared=rootSquare(candidate),left=rule==='g8-pythagorean'?add(power(a,2),power(b,2)):add(power(b,2),squared),right=rule==='g8-pythagorean'?squared:power(a,2),display=rule==='g8-pythagorean'?`${a}^2+${b}^2`: `${b}^2+\\left(${candidate}\\right)^2`;
  return bundle('Substitute into Pythagoras',[equality('Put the proposed length back into a² + b² = c².',display,rule==='g8-pythagorean'?`\\left(${candidate}\\right)^2`:`${a}^2`,left,right),{text:'A length must also be nonnegative. The principal square root supplies that length.',valid:nonnegativeRoot(candidate)}]);
 }
 if(rule==='g8-roots'||rule==='g8-squares'){
  const candidate=proposed??lesson.answer;
  return rule==='g8-roots'?bundle('Square the proposed root',[equality('Squaring the proposed principal root must recover the radicand.',`\\left(${candidate}\\right)^2`,String(a),rootSquare(candidate),a),{text:'The principal square root must be nonnegative.',valid:nonnegativeRoot(candidate)}]):bundle('Square fact check',[equality('Check the square using multiplication.',`${a}\\times${a}`,tex(read()),multiply(a,a),read())]);
 }
 if(rule==='budget'){
  const saving=multiply(read(),100),total=sum([b,c,saving]);return bundle('Budget balance',[equality('Spending plus proposed savings must equal income.',`${b}+${c}+${tex(saving)}`,String(a),total,a)],lesson.steps.length-1);
 }
 if(rule==='credit-debt'){
  const paid=Math.min(c,a+b),remaining=multiply(read(),100);return bundle('Repayment balance',[equality('Amount repaid plus remaining debt must equal the original debt and fee.',`${paid}+${tex(remaining)}`,`${a}+${b}`,add(paid,remaining),add(a,b))]);
 }
 if(rule==='sales-tax'){
  const subtotal=add(a,b),tax=roundHalfUp(scale(subtotal,c,100)),total=multiply(read(),100);return bundle('Check the tax and total',[equality('Subtract the subtotal from the proposed total. It must equal the tax rounded to cents.',`${tex(total)}-(${a}+${b})`,tex(tax),subtract(total,subtotal),tax)]);
 }
 if(rule==='metric-conversion'){
  const factor=[100,1000,1000,1000][b],candidate=read();return bundle('Reverse the conversion',[equality('Convert the proposed smaller-unit amount back to the original larger unit.',`${tex(candidate)}\\div${factor}`,tex(rational(a,10)),divide(candidate,factor),rational(a,10))]);
 }
 if(rule==='shape-area'){
  const area=read(),recovered=divide(multiply(area,c?2:1),a);return bundle('Reverse the area formula',[equality('Use the proposed area and the known base to recover the perpendicular height.',`${tex(area)}${c?'\\times2':''}\\div${a}`,String(b),recovered,b)]);
 }
 if(rule==='multiplication-area')return inverseCheck('*',a,b,read());
 if(rule==='equivalent-fraction')return bundle('Equivalent-size parts',[equality('Multiplying top and bottom by the same factor preserves the amount.',`${a}\\times${b*c}`,`${a*c}\\times${b}`,multiply(a,b*c),multiply(a*c,b))]);
 if(rule==='g8-proportion'){
  const final=read();return bundle('Work backwards',[equality('Undo the scaling and the increase: the final cost times the old item count times 100 must equal the old cost times the new item count times the increase factor.',`${decimalOrFraction(final)}\\times${a}\\times100`,`${b}\\times${c}\\times${100+d}`,multiply(final,a*100),b*c*(100+d))]);
 }
 if(rule==='statistics'||rule==='statistics-even'){
  const raw=v.slice(0,-1),scaleFactor=v.at(-1)?10:1,facts=summarizeData(raw.map(n=>rational(n,scaleFactor))),mean=answerNumber(lesson.answer.mean),median=answerNumber(lesson.answer.median),middle=Math.floor(raw.length/2),expectedMedian=facts.median;
  return bundle('Check the data summary',[equality('The proposed mean times the number of values must recover their total.',`${tex(mean)}\\times${raw.length}`,tex(facts.total),multiply(mean,raw.length),facts.total),equality('Check the median against the ordered middle value or middle-pair average.',tex(median),tex(expectedMedian),median,expectedMedian),{text:`Count repeated values to check the mode: ${modeList(raw).length?modeList(raw).map(n=>scaledDecimal(n,v.at(-1)?1:0)).join(', '):'no value repeats'}.`,valid:true}]);
 }
 if(rule==='round-tenth'){
  const original=rational(a,100),candidate=read(),lower=subtract(candidate,rational(5,100)),upper=add(candidate,rational(5,100)),valid=compare(original,lower)>=0&&compare(original,upper)<0;
  return bundle('Rounding interval',[{text:'The original amount must lie in the interval that rounds to this tenth. The lower halfway value rounds up into it.',math:`${decimalOrFraction(lower)}\\le${scaledDecimal(a)}<${decimalOrFraction(upper)}`,valid}]);
 }
 if(rule==='division-area'){
  const match=String(proposed??lesson.answer).match(/^(\d+) remainder (\d+)$/);if(!match)throw Error('Use a quotient and remainder.');const q=answerNumber(match[1]),r=answerNumber(match[2]);return bundle('Quotient/remainder identity',[equality('Multiply back and include the leftover amount.',`${b}\\times${tex(q)}+${tex(r)}`,String(a),add(multiply(b,q),r),a),{text:'The remainder must be smaller than the divisor.',valid:compare(r,b)<0&&compare(r,0)>=0}]);
 }
 if(rule==='unit-fraction')return inverseCheck(c?'/':'*',a,rational(1,b),read());
 if(rule==='equivalent-ratio'){
  const [left,right]=String(proposed??lesson.answer).split(':').map(answerNumber);return bundle('Ratio equivalence',[equality('Cross-products must match for equivalent ratios.',`${tex(left)}\\times${b}`,`${tex(right)}\\times${a}`,multiply(left,b),multiply(right,a))]);
 }
 if(rule==='pattern-missing'||rule==='decimal-pattern'){
  const candidate=read(),previous=rule==='pattern-missing'?(c?a+3*b:a+b):rational(a+2*b,100),change=rule==='pattern-missing'?(c?-b:b):rational(b,100);return bundle('Check the pattern change',[equality('Subtract the previous term from the proposed next term. The difference must match the rule.',`${decimalOrFraction(candidate)}-(${decimalOrFraction(previous)})`,decimalOrFraction(change),subtract(candidate,previous),change)]);
 }
 if(rule==='seating-model'){
  const tables=read(),people=a+c,seats=multiply(tables,b),previous=multiply(subtract(tables,1),b);return bundle('Capacity and minimum check',[{text:'The proposed number of tables must seat everyone; one fewer must not be enough.',math:`${tex(previous)}<${people}\\le${tex(seats)}`,valid:compare(previous,people)<0&&compare(seats,people)>=0}]);
 }
 if(rule==='misleading-graph')return inverseCheck('-',b,a,read());
 if(rule==='probability'||rule==='experimental-probability')return bundle('Check the fraction of outcomes',[equality('Probability times the number of outcomes or observations must recover the event count.',`${tex(read())}\\times${b}`,String(a),multiply(read(),b),a),{text:'A probability must be between zero and one.',valid:compare(read(),0)>=0&&compare(read(),1)<=0}]);
 if(rule==='g8-venn')return bundle('Check the union count',[equality('Multiply the proposed probability by the full population. The overlap is counted only once.',`${tex(read())}\\times${a+b+c+d}`,`${a}+${b}+${c}`,multiply(read(),a+b+c+d),a+b+c)]);
 if(rule==='g8-dependent-probability'){
  const total=a+b,secondDenominator=c?total:total-1,secondRed=c?a:Math.max(0,a-1);return bundle('Count ordered favourable outcomes',[equality('Clear both denominators to check the red–red path count.',`${tex(read())}\\times${total}\\times${secondDenominator}`,`${a}\\times${secondRed}`,multiply(read(),total*secondDenominator),a*secondRed)]);
 }
 if(rule==='triangle-angles')return bundle('Triangle angle sum',[equality('Add the proposed missing angle to the two known angles.',`${b}+${c}+${lesson.answer.thirdAngle}`,'180',b+c+lesson.answer.thirdAngle,180)]);
 if(rule==='g8-order-operations')return inverseCheck('*',add(rational(a,2),rational(b,3)),power(c,d),read());
 if(rule==='g8-rational-pattern'){
  const recovered=divide(subtract(read(),rational(a,c)),rational(b,c));return bundle('Recover the term index',[equality('Put the proposed term into the rule and solve back for its index.',`\\frac{${tex(read())}-(${tex(rational(a,c))})}{${tex(rational(b,c))}}`,String(d),recovered,d)]);
 }
 if(rule==='g8-like-terms'){
  const candidate=proposed??lesson.answer,checks=[0,2].map(x=>equality(`Substitute x = ${x} into the original and simplified expressions.`,`${substitutionMath(a,b,x)}+${substitutionMath(c,d,x)}`,substitutionMath(candidate.coefficient,candidate.constant,x),a*x+b+c*x+d,candidate.coefficient*x+candidate.constant));return bundle('Like-term check',checks);
 }
 if(rule==='g8-metric-prefix'){
  const exponent=[6,9,12,-6,-9,-12][b];return inverseCheck('*',a,power(10,exponent),read(),decimalOrFraction);
 }
 if(rule==='g8-scale-drawing')return bundle('Undo the area scale',[equality('Divide the proposed actual area by the squared scale factor to recover the drawing area.',`${tex(read())}\\div${c}^2`,`${a}\\times${b}`,divide(read(),power(c,2)),multiply(a,b))]);
 if(rule==='g8-angle-properties'){
  const candidate=read();return c===0?bundle('Straight-angle check',[equality('The two angles on the straight line must add to 180°.',`${a}+${tex(candidate)}`,'180',add(a,candidate),180)]):c===1?bundle('Opposite-angle check',[equality('Vertically opposite angles must match.',tex(candidate),String(a),candidate,a)]):bundle('Polygon angle-sum check',[equality(c===2?'All equal interior angles must add to the polygon’s interior-angle sum.':'The exterior angles must add to a full turn.',`${b}\\times${tex(candidate)}`,c===2?`(${b}-2)\\times180`:'360',multiply(b,candidate),c===2?(b-2)*180:360)]);
 }
 if(rule==='g8-financial-goal'){
  const saving=balance(a,[b,roundHalfUp(scale(a,c,100))]),months=read(),saved=multiply(months,saving),previous=multiply(subtract(months,1),saving);return bundle('Reach the goal with the minimum months',[{text:'The proposed months must reach the goal, while one fewer month falls short.',math:`${decimalOrFraction(previous)}<${d}\\le${decimalOrFraction(saved)}\\quad\\text{(cents)}`,valid:compare(previous,d)<0&&compare(saved,d)>=0}]);
 }
 return null;
}

export function playbackSteps(lesson){
 const proof=lesson.verification;if(!proof)return lesson.steps;
 return [...lesson.steps.slice(0,proof.replaceFrom??lesson.steps.length),...proof.steps];
}
