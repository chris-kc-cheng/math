import {rational,parseDecimal,add,subtract,multiply,divide,power,integerSquareRoot,compare} from '../math/core/exact.js';

const binary={'+':add,'-':subtract,'*':multiply,'/':divide};
const numeric=c=>typeof c==='string'&&/^[\d.]$/.test(c);
const result=(value,approximate=false)=>({value,approximate});
const bounded=r=>{if(String(r.value.n).length>160||String(r.value.d).length>160)throw Error('Number out of range.');return r;};
function approximate(n){
 if(!Number.isFinite(n)||Math.abs(n)>1e30||Math.abs(n)>0&&Math.abs(n)<1e-30)throw Error('Number out of range.');
 const [coefficient,exponent]=n.toExponential(13).split('e');return result(multiply(parseDecimal(coefficient),power(10,Number(exponent))),true);
}
// The angle mode applies to every trigonometric function; press() sets it before evaluating.
let angleMode='DEG';
export const setAngleMode=mode=>{angleMode=mode;};
function trig(node,x){
 const degrees=angleMode==='DEG',value=Number(x.n)/Number(x.d);let out;
 if(!node.inverse){const angle=degrees?value*Math.PI/180:value;if(node.fn==='tan'&&Math.abs(Math.cos(angle))<1e-12)throw Error('The tangent is undefined for this angle.');out=Math[node.fn](angle);}
 else{if(node.fn!=='tan'&&Math.abs(value)>1)throw Error('Inverse sine and cosine need a value from −1 to 1.');out=Math['a'+node.fn](value);if(degrees)out=out*180/Math.PI;}
 const exact=Math.abs(out*1e10-Math.round(out*1e10))<1e-6;
 const rounded=approximate(out);return exact?result(rounded.value,false):rounded;
}
export function evaluate(nodes,ans=result(rational(0)),depth=0){
 if(depth>12||nodes.length>200)throw Error('Expression is too long.');
 const tokens=[];
 for(let i=0;i<nodes.length;i++){
  const n=nodes[i];
  if(numeric(n)){let text=n;while(numeric(nodes[i+1]))text+=nodes[++i];if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)||text.replace('.','').length>16)throw Error('Check the number.');tokens.push(result(parseDecimal(text.startsWith('.')?'0'+text:text.endsWith('.')?text+'0':text)));}
  else if(typeof n==='object'){
   const a=evaluate(n.type==='fraction'?n.num:n.type==='mixed'?n.whole:n.type==='power'||n.type==='square'||n.type==='inverse'?n.base:n.body,ans,depth+1);
   if(n.type==='fraction'){const b=evaluate(n.den,ans,depth+1);tokens.push(bounded(result(divide(a.value,b.value),a.approximate||b.approximate)));}
   else if(n.type==='mixed'){const b=evaluate(n.num,ans,depth+1),c=evaluate(n.den,ans,depth+1);if(a.value.d!==1n||b.value.n<0n||c.value.n<=0n||b.value.d!==1n||c.value.d!==1n)throw Error('Use whole-number mixed-number parts.');const part=divide(b.value,c.value),negative=a.value.n<0n||n.whole[0]==='neg';tokens.push(result(negative?subtract(a.value,part):add(a.value,part)));}
   else if(n.type==='power'){const b=evaluate(n.exponent,ans,depth+1);if(b.value.d!==1n||b.value.n< -30n||b.value.n>30n)throw Error('Use a whole-number exponent from −30 to 30.');tokens.push(bounded(result(power(a.value,Number(b.value.n)),a.approximate||b.approximate)));}
   else if(n.type==='square')tokens.push(bounded(result(power(a.value,2),a.approximate)));
   else if(n.type==='trig')tokens.push(trig(n,a.value));
   else if(n.type==='inverse')tokens.push(result(divide(1,a.value),a.approximate));
   else if(n.type==='percent')tokens.push(result(divide(a.value,100),a.approximate));
   else if(n.type==='sqrt'){
    if(a.value.n<0n)throw Error('A negative number has no real square root.');const numerator=integerSquareRoot(a.value.n),denominator=integerSquareRoot(a.value.d);
    tokens.push(numerator*numerator===a.value.n&&denominator*denominator===a.value.d?result(rational(numerator,denominator),a.approximate):approximate(Math.sqrt(Number(a.value.n)/Number(a.value.d))));
   }else throw Error('Unsupported calculator function.');
  }else if(n==='Ans')tokens.push(ans);else if(n==='π')tokens.push(result(parseDecimal('3.141592653590'),true));else tokens.push(n);
 }
 let i=0;
 const atom=()=>{const t=tokens[i++];if(t==='neg'){const v=atom();return result(multiply(-1,v.value),v.approximate);}if(t==='('){const v=expression();if(tokens[i]===')')i++;else if(i<tokens.length)throw Error('Check the parentheses.');return v;}if(!t||typeof t!=='object'||!t.value)throw Error('Complete the expression.');return t;};
 const product=()=>{let a=atom();while(tokens[i]==='*'||tokens[i]==='/'||tokens[i]==='('||typeof tokens[i]==='object'){const implicit=tokens[i]==='('||typeof tokens[i]==='object',op=implicit?'*':tokens[i++],b=atom();a=bounded(result(binary[op](a.value,b.value),a.approximate||b.approximate));}return a;};
 const expression=()=>{let a=product();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],b=product();a=bounded(result(binary[op](a.value,b.value),a.approximate||b.approximate));}return a;};
 const answer=expression();if(i!==tokens.length)throw Error('Check the expression.');return answer;
}

export const createCalculator=()=>({root:[],path:[],cursor:0,ans:result(rational(0)),answer:null,second:false,format:'decimal',notation:'NORM',angle:'DEG',modeMenu:null,error:'',keys:[],lastKey:''});
const field=s=>s.path.reduce((a,p)=>a[p.index][p.field],s.root);
function insert(s,...nodes){const a=field(s);a.splice(s.cursor,0,...nodes);s.cursor+=nodes.length;}
function takeOperand(s){const a=field(s),end=s.cursor;if(!end)throw Error('Enter a number first.');let start=end-1;if(numeric(a[start]))while(start&&numeric(a[start-1]))start--;else if(a[start]===')'){let level=1;while(start&&level){start--;if(a[start]===')')level++;if(a[start]==='(')level--;}if(level)throw Error('Close the group first.');}else if(typeof a[start]!=='object'&&!['Ans','π'].includes(a[start]))throw Error('Enter a number first.');const operand=a.splice(start,end-start);s.cursor=start;return operand;}
function template(s,node,child){const index=s.cursor;insert(s,node);s.path.push({index,field:child});s.cursor=node[child].length;}
function moveOut(s){const p=s.path.at(-1);if(!p){s.cursor=Math.min(field(s).length,s.cursor+1);return;}const a=s.path.slice(0,-1).reduce((a,p)=>a[p.index][p.field],s.root),node=a[p.index];if(node.type==='fraction'&&p.field==='num')p.field='den';else if(node.type==='mixed'&&p.field==='whole')p.field='num';else if(node.type==='mixed'&&p.field==='num')p.field='den';else{s.path.pop();s.cursor=p.index+1;return;}s.cursor=field(s).length;}
function treeText(a,s,path=[]){return a.map((n,i)=>{const child=name=>treeText(n[name],s,[...path,{index:i,field:name}]);const mark=JSON.stringify(path)===JSON.stringify(s.path)&&i===s.cursor?'▏':'';if(typeof n==='string')return mark+({'*':'×','/':'÷',neg:'−'}[n]||n);return mark+(n.type==='fraction'?`(${child('num')||'□'}/${child('den')||'□'})`:n.type==='mixed'?`${child('whole')||'□'} (${child('num')||'□'}/${child('den')||'□'})`:n.type==='power'?`${child('base')}^(${child('exponent')||'□'})`:n.type==='square'?`(${child('base')})²`:n.type==='inverse'?`1/(${child('base')})`:n.type==='percent'?`(${child('body')})%`:n.type==='trig'?`${n.fn}${n.inverse?'⁻¹':''}(${child('body')||'□'})`:`${n.type==='sqrt'?'√':n.type}(${child('body')||'□'})`);}).join('')+(JSON.stringify(path)===JSON.stringify(s.path)&&a.length===s.cursor?'▏':'');}
export const entryText=s=>treeText(s.root,s);
const decimal=v=>{const n=Number(v.n)/Number(v.d);if(!Number.isFinite(n))throw Error('Number out of range.');return Number(n.toPrecision(10)).toString().replace('e+','E').replace('e','E');};
export function display(s){
 if(s.answer){const v=s.answer.value,negative=v.n<0n,abs=negative?-v.n:v.n;let text;
  if(s.format==='fraction'&&v.d!==1n)text=`${v.n}/${v.d}`;
  else if(s.format==='mixed'&&v.d!==1n)text=`${negative?'-':''}${abs/v.d?`${abs/v.d} `:''}${abs%v.d}/${v.d}`;
  else text=s.notation==='SCI'?Number(Number(v.n)/Number(v.d)).toExponential(9).replace(/(\.\d*?[1-9])0+e/,'$1e').replace(/\.0+e/,'e').replace('e+','E').replace('e','E'):decimal(v);
  const [mantissa,exponent='0']=text.split('E');let rounded=false;if(s.format==='decimal'){try{const places=Number(exponent),shown=multiply(parseDecimal(mantissa),rational(places>=0?10n**BigInt(places):1n,places<0?10n**BigInt(-places):1n));rounded=compare(shown,v)!==0;}catch{rounded=true;}}
  return {text,approximate:s.answer.approximate||rounded};
 }
 const a=field(s);let start=s.cursor;while(start&&numeric(a[start-1]))start--;return {text:a.slice(start,s.cursor).join('')||'0',approximate:false};
}
export function press(state,key){
 const s=structuredClone(state);s.error='';s.keys=[...s.keys,key].slice(-24);s.lastKey=key;
 try{
  if(key==='2nd'){s.second=!s.second;return s;}
  const second=s.second;s.second=false;
  if(key==='mode'){s.modeMenu={row:0,column:s.angle==='RAD'?1:0};s.menu=null;return s;}
  if(s.modeMenu){
   if(key==='down'){s.modeMenu.row=1;s.modeMenu.column=s.notation==='SCI'?1:0;}
   else if(key==='right')s.modeMenu.column=1;
   else if(key==='left')s.modeMenu.column=0;
   else if(key==='enter'){if(s.modeMenu.row===1)s.notation=s.modeMenu.column===1?'SCI':'NORM';else s.angle=s.modeMenu.column===1?'RAD':'DEG';}
   else if(key==='clear')s.modeMenu=null;
   else if(key!=='enter')throw Error('Use ↓, ←/→, enter, then clear to leave MODE.');
   return s;
  }
  if(key==='clear'||key==='on'){s.root=[];s.path=[];s.cursor=0;s.answer=null;s.menu=null;s.format='decimal';s.keys=[key];return s;}
  if(key==='enter'){
   if(s.menu){if(s.menu!=='mixed')throw Error('Choose the supported MATH item 1.');s.format=s.format==='mixed'?'fraction':'mixed';s.menu=null;return s;}
   setAngleMode(s.angle);s.answer=evaluate(s.root,s.ans);s.ans=s.answer;s.path=[];s.cursor=s.root.length;s.format=!s.answer.approximate&&(JSON.stringify(s.root).includes('fraction')||JSON.stringify(s.root).includes('mixed'))?'fraction':'decimal';return s;
  }
  if(key==='toggle'){if(!s.answer)throw Error('Press enter before changing answer form.');s.format=s.format==='decimal'?'fraction':'decimal';return s;}
  if(key==='math'){if(!s.answer)throw Error('Evaluate the fraction first.');s.menu='choose';return s;}
  if(s.menu){if(key==='1'){s.menu='mixed';return s;}throw Error('This subset supports MATH 1: mixed number.');}
  if(key==='delete'){if(s.cursor){field(s).splice(--s.cursor,1);s.answer=null;}else if(s.path.length)moveOut(s);return s;}
  if(key==='right'||key==='down'){moveOut(s);return s;}
  if(key==='left'){if(s.cursor)s.cursor--;else if(s.path.length){const p=s.path.pop();s.cursor=p.index;}return s;}
  if(s.answer){s.root=[];s.path=[];s.cursor=0;s.answer=null;if(Object.hasOwn(binary,key)||['square','fraction','toggle'].includes(key))insert(s,'Ans');}
  if(Object.hasOwn(binary,key)&&!s.root.length)insert(s,'Ans');
  if(second&&key==='7'){const before=field(s)[s.cursor-1],whole=s.cursor&&numeric(before)?takeOperand(s):[];template(s,{type:'mixed',whole,num:[],den:[]},whole.length?'num':'whole');}
  else if(second&&key==='square')template(s,{type:'sqrt',body:[]},'body');
  else if(second&&key==='/')insert(s,{type:'percent',body:takeOperand(s)});
  else if(second&&key==='neg')insert(s,'Ans');
  else if(second&&key==='fraction')insert(s,{type:'inverse',base:takeOperand(s)});
  else if(second)throw Error('That 2nd function is outside this curriculum subset.');
  else if(key==='fraction'){let num=[];if(s.cursor&&(numeric(field(s)[s.cursor-1])||typeof field(s)[s.cursor-1]==='object'||field(s)[s.cursor-1]===')'))num=takeOperand(s);template(s,{type:'fraction',num,den:[]},num.length?'den':'num');}
  else if(['sin','cos','tan'].includes(key)){
   // sin, cos and tan are multi-tap keys: pressing one again straight away switches it to its inverse.
   const here=s.path.at(-1),holder=here?s.path.slice(0,-1).reduce((a,p)=>a[p.index][p.field],s.root)[here.index]:null;
   if(state.lastKey===key&&holder?.type==='trig'&&holder.fn===key&&!field(s).length)holder.inverse=!holder.inverse;
   else template(s,{type:'trig',fn:key,inverse:false,body:[]},'body');
  }
  else if(key==='^')template(s,{type:'power',base:takeOperand(s),exponent:[]},'exponent');
  else if(key==='square')insert(s,{type:'square',base:takeOperand(s)});
  else if(key==='EE'){template(s,{type:'power',base:['1','0'],exponent:[]},'exponent');const p=s.path.at(-1),a=s.path.slice(0,-1).reduce((a,p)=>a[p.index][p.field],s.root);if(p.index>0){a.splice(p.index,0,'*');p.index++;}}
  else if(numeric(key)||Object.hasOwn(binary,key)||['(',')','neg','π','Ans'].includes(key))insert(s,key);
  else throw Error('Unsupported calculator key.');
  if(JSON.stringify(s.root).length>6000)throw Error('Expression is too long.');
 }catch(error){s.error=error.message;}
 return s;
}
export const runKeys=keys=>keys.reduce(press,createCalculator());
