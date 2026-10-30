import test from 'node:test';
import assert from 'node:assert/strict';
import {rational,compare} from '../math/core/exact.js';
import {createCalculator,press,runKeys,display,evaluate} from './engine.js';
import {calculationKeys,calculatorPlan} from './plans.js';
import {visualExamples} from '../demo/examples.js';
import {createPractice} from '../curriculum/practice.js';
import {catalog} from '../curriculum/catalog.js';
const answer=(keys,n,d=1)=>{const state=runKeys(keys);assert.equal(state.error,'',keys.join(' '));assert.equal(compare(state.answer.value,rational(n,d)),0);return state;};

test('36X Pro-style entry uses precedence, closes parentheses on enter, and retains Ans through clear',()=>{
 answer(['2','+','3','*','4','enter'],14);
 answer(['4','*','(','2','+','3','enter'],20);
 answer(['2','(','3','+','4',')','enter'],14);
 let state=answer(['3','*','3','enter','*','3','enter'],27);
 state=press(press(state,'clear'),'+');for(const key of ['5','enter'])state=press(state,key);assert.equal(display(state).text,'32');
 answer(['2','+','3','enter','clear','2nd','neg','*','2','enter'],10);
 answer(['1','fraction','3','right','enter','toggle','*','3','enter'],1);
 answer(['0','.','1','+','0','.','2','enter'],3,10);
});
test('fraction, mixed-number, percent and answer-form keys follow 36X Pro sequences',()=>{
 const fraction=answer(['1','fraction','2','right','+','2','fraction','3','right','enter'],7,6);
 assert.equal(display(fraction).text,'7/6');assert.equal(display(press(fraction,'toggle')).approximate,true);
 answer(['fraction','1','+','2','down','3','right','enter'],1);
 const mixed=answer(['2nd','7','2','right','1','down','3','right','enter'],7,3);
 answer(['2','2nd','7','1','down','3','right','enter'],7,3); // guidebook form: the number typed before 2nd 7 becomes the unit
 assert.deepEqual(calculationKeys('2\\frac{1}{3}'),['2','2nd','7','1','down','3','right']);
 assert.deepEqual(calculationKeys('\\frac{3}{4}'),['3','fraction','4','right']);
 assert.deepEqual(calculationKeys('\\frac{3+1}{4}'),['fraction','3','+','1','down','4','right']);
 const converted=['math','1','enter'].reduce(press,mixed);assert.equal(display(converted).text,'2 1/3');
 answer(['2','2nd','/','*','1','5','0','enter'],3);
 answer(['2','fraction','3','right','enter','2nd','fraction','enter'],3,2);
});
test('MathPrint powers, repeated squares, real square roots and EE remain bounded',()=>{
 answer(['2','^','3','^','2','enter'],512);
 answer(['2','^','3','right','^','2','enter'],64);
 answer(['3','square','square','enter'],81);
 answer(['neg','3','square','enter'],-9);
 answer(['2nd','square','2','5','enter'],5);
 const root=runKeys(['2nd','square','2','enter']);assert.ok(root.answer.approximate);assert.ok(Math.abs(Number(root.answer.value.n)/Number(root.answer.value.d)-Math.sqrt(2))<1e-12);
 answer(['2','EE','neg','3','enter'],1,500);
 assert.equal(display(answer(['1','/','8','enter'],1,8)).approximate,false);
});
test('editing is recoverable; invalid, non-real and executable inputs are rejected',()=>{
 for(const keys of [['1','/','0','enter'],['2nd','square','neg','1','enter'],['2','^','3','1','enter'],['1','+','enter'],['fraction','1','enter']])assert.ok(runKeys(keys).error,keys.join(' '));
 answer(['1','fraction','0','delete','2','right','enter'],1,2);
 let state=runKeys(['1','/','0','enter']);for(const key of ['clear','3','enter'])state=press(state,key);assert.equal(state.error,'');assert.equal(display(state).text,'3');
 assert.ok(press(createCalculator(),'eval').error);assert.throws(()=>evaluate(['alert(1)']));assert.throws(()=>calculationKeys('Math.random()'));
});
test('trusted lesson notation compiles into executable calculator key sequences',()=>{
 answer([...calculationKeys('25\\text{ cm}^{2}'),'enter'],25);
 for(const [formula,n,d] of [['\\frac{1}{2}+\\frac{2}{3}',7,6],['\\sqrt{3^{2}+4^{2}}',5,1],['250\\times18\\%',45,1],['5\\times10^{-3}',1,200]])answer([...calculationKeys(formula),'enter'],n,d);
});
test('visual landing examples use real curriculum rules and calculator plans stay contextual',()=>{
 for(const demo of visualExamples){const lesson=createPractice(demo.template);assert.ok(lesson.steps.length>1);const plan=calculatorPlan({template:demo.template,lesson,force:demo.template.calculatorDemo});if(['Calculator keys','Pythagoras’ theorem','Scientific notation'].includes(demo.topic)){assert.ok(plan.recommended,demo.topic);assert.ok(plan.keys.length);assert.equal(runKeys(plan.keys).error,'');}else assert.equal(plan.recommended,false);}
 const basic=calculatorPlan({template:{skillId:'g1-b2-1',rule:'primary-add-subtract'},lesson:{steps:[{math:'2+3=5'}],answer:'5'}});assert.equal(basic.recommended,false);assert.ok(!basic.features.includes('square'));
 const fraction=calculatorPlan({template:{skillId:'b2-5',rule:'fraction-add'},lesson:{steps:[{math:'\\frac{1}{2}+\\frac{2}{3}=\\frac{7}{6}'}],answer:'\\frac{7}{6}'},force:true});assert.ok(fraction.features.includes('fraction'));answer(fraction.keys,7,6);
});

import grade8Questions from '../curriculum/data/grade-8-questions.json' with {type:'json'};
test('fraction demo uses n/d and scientific lessons offer equivalent EE and SCI sequences',()=>{
 const fraction=calculatorPlan({input:'1/2 + 2/3',force:true});assert.equal(fraction.keys.filter(k=>k==='fraction').length,2);assert.ok(!fraction.keys.includes('/'));answer(fraction.keys,7,6);
 const q=grade8Questions.find(q=>q.rule==='g8-scientific');
 for(const exponent of [4,-4]){
  const lesson=createPractice(q,[235,exponent]),plan=calculatorPlan({template:q,lesson});assert.equal(plan.alternatives.length,2);assert.ok(plan.keys.includes('^'));
  const primary=runKeys(plan.keys);for(const alternative of plan.alternatives){const state=runKeys(alternative.keys);assert.equal(state.error,'');assert.equal(compare(state.answer.value,primary.answer.value),0);if(alternative.methodLabel==='EE entry')assert.ok(alternative.keys.includes('EE'));else{assert.equal(state.notation,'SCI');assert.match(display(state).text,/2\.35E-?4/);}}
 }
 const story=grade8Questions.find(q=>q.rule==='scientific-story');for(const style of [0,1]){const lesson=createPractice(story,[31,5,style]),plan=calculatorPlan({template:story,lesson});assert.equal(plan.alternatives.length,2,`scientific style ${style}`);for(const alternative of plan.alternatives)assert.equal(runKeys(alternative.keys).error,'');}
 // Asking for the exponent is not a keystroke calculation, so no EE/SCI walkthrough is offered.
 assert.equal(calculatorPlan({template:story,lesson:createPractice(story,[31,5,2])})?.alternatives,undefined);
 const norm=runKeys(['2','3','5','0','0','enter','mode','down','right','enter','clear','enter','mode','down','left','enter','clear','enter']);assert.equal(display(norm).text,'23500');
});

test('trigonometry follows the 36X Pro: DEG by default, multi-tap inverses, enter closes the bracket',()=>{
 const sin30=runKeys(['sin','3','0','enter']);assert.equal(sin30.error,'');assert.equal(display(sin30).text,'0.5');assert.equal(display(sin30).approximate,false);
 const product=runKeys(['1','2','*','sin','3','5','enter']);assert.equal(display(product).text,'6.882917236');assert.equal(display(product).approximate,true);
 const inverse=runKeys(['tan','tan','1','enter']);assert.equal(display(inverse).text,'45');
 assert.equal(inverse.angle,'DEG');
 const radians=runKeys(['mode','right','enter','clear','sin','1','enter']);assert.equal(radians.angle,'RAD');assert.equal(display(radians).text,'0.8414709848');
 assert.equal(runKeys(['sin','sin','2','enter']).error.length>0,true);
 assert.equal(runKeys(['tan','9','0','enter']).error.length>0,true);
 assert.deepEqual(calculationKeys('12\\sin35^\\circ'),['1','2','sin','3','5']);
 assert.deepEqual(calculationKeys('\\tan^{-1}\\left(\\frac{6}{4}\\right)'),['tan','tan','6','fraction','4','right']);
 assert.deepEqual(calculationKeys('\\frac{7\\sin40^\\circ}{\\sin70^\\circ}'),['fraction','7','sin','4','0','right','down','sin','7','0','right','right']);
 const check=runKeys(calculationKeys('\\frac{12\\sin70^\\circ}{\\sin40^\\circ}').concat('enter'));assert.equal(display(check).text,'17.5428264');
});

test('Grade 9–10 calculator use is recommended only where a calculator is the right tool',()=>{
 const grade=g=>catalog.find(item=>item.grade===g),plan=(g,id)=>{const q=grade(g).questions.find(x=>x.id===id);return calculatorPlan({template:q,lesson:createPractice(q)});};
 const trig=plan(10,'g10-question-tr2-2-1');assert.equal(trig.recommended,true);assert.deepEqual(trig.keys.slice(0,3),['mode','enter','clear']);assert.match(trig.methodHint,/DEG/);
 const state=runKeys(trig.keys);assert.equal(state.error,'');assert.equal(display(state).text.slice(0,4),'6.88');
 const cosine=plan(10,'g10-question-tr3-2-1');assert.equal(cosine.recommended,true);assert.ok(cosine.keys.includes('cos'));
 assert.equal(plan(10,'g10-question-qr3-1-1').recommended,false,'expanding is a by-hand algebra skill');
 assert.equal(plan(10,'g10-question-qr3-8-1').recommended,false,'factoring is by hand');
 assert.equal(plan(9,'g9-question-c1-4-1').recommended,false,'simplifying is by hand');
 assert.equal(plan(10,'g10-question-tr3-3-1').recommended,false,'adding angles is mental');
 const power=plan(9,'g9-question-b2-1-1');assert.equal(power.recommended,true);assert.ok(power.keys.includes('^'));
});
