// Last-line defence for generated text: remove notation no textbook would print.
// Each rule is deliberately narrow so that correct mathematics is never rewritten.
const MARK='\u0001';
const RULES=[
 // a fraction whose denominator is 1 is just its numerator (first, so later sign rules see the result)
 [/\\frac\{([^{}]+)\}\{1\}(?!\d)/g,'$1'],
 // a unit to the power 1 is just the unit: cm^{1} -> cm
 [/(\\(?:mathrm|text)\{[^}]+\})\^\{?1\}?(?!\d)/g,'$1'],
 // 1x, 1n, -1x, 2+1n  ->  x, n, -x, 2+n   (a lone digit 1 directly before one variable letter)
 [/(?<![\w.\\}{^])1(?=[xyntabcmpqrz](?![A-Za-z]))/g,''],
 // "+-4" and "+−4" are written "-4"
 [/\+\s*[-−](?=\d|[a-z])/g,'-'],
 // "7--3" becomes "7-(-3)": mark the second sign here, wrap the number below
 [/(?<=[\d)a-z}])\s*([-−])\s*([-−])(?=\d)/g,(match,minus)=>`${minus}${MARK}${minus}`]
];
// "1 counters" -> "1 counter", "1 halves is shaded" -> "1 half is shaded". Only nouns the generators actually use.
const SINGULAR={counters:'counter',stickers:'sticker',pencils:'pencil',halves:'half',fourths:'fourth',thirds:'third',fifths:'fifth',sixths:'sixth',eighths:'eighth',tenths:'tenth',steps:'step',moves:'move',wholes:'whole',parts:'part',pieces:'piece',tens:'ten',hundreds:'hundred',ones:'one',cents:'cent',dollars:'dollar',days:'day',books:'book',learners:'learner',objects:'object',units:'unit',groups:'group',cubes:'cube',pictures:'picture',bundles:'bundle',friends:'friend',trays:'tray',boxes:'box',squares:'square',cookies:'cookie',coins:'coin',items:'item',cups:'cup',scoops:'scoop',bills:'bill',hours:'hour',years:'year',months:'month',weeks:'week',minutes:'minute',seconds:'second',learners:'learner',students:'student',metres:'metre',centimetres:'centimetre'};
const ADJECTIVES='equal|full|loose|larger|smaller|small|matching|red|blue|green|yellow|removed|added|right|left|up|down|complete|more|whole|story|science|cm';
const ONE_PLURAL=new RegExp(String.raw`(?<![\d.\/])\b1 ((?:(?:${ADJECTIVES})\s)*)(${Object.keys(SINGULAR).join('|')})\b`,'g');
const WRAP_NEGATIVE=new RegExp(`${MARK}([-−])(\\d+(?:\\.\\d+)?)`,'g');
export function tidyText(text){
 if(typeof text!=='string'||text.length<2)return text;
 let out=text;
 for(const [pattern,replacement] of RULES)out=out.replace(pattern,replacement);
 out=out.replace(ONE_PLURAL,(match,adjectives,noun)=>`1 ${adjectives}${SINGULAR[noun]}`).replace(/(There|there) are 1 (?=[a-z])/g,'$1 is 1 ');
 return out.replace(WRAP_NEGATIVE,(match,minus,number)=>`(${minus}${number})`);
}
const SKIP=new Set(['id','type','kind','rule','stage','method','svg','templateId','skillId','href','src']);
/** Deep-copy a lesson-like value, tidying every display string. Numbers, booleans and structure are untouched. */
export function tidyDeep(value,key=''){
 if(typeof value==='string')return SKIP.has(key)?value:tidyText(value);
 if(Array.isArray(value))return value.map(item=>tidyDeep(item,key));
 if(value&&typeof value==='object'){const out={};for(const [k,v] of Object.entries(value))out[k]=tidyDeep(v,k);return out;}
 return value;
}
