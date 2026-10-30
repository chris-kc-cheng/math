import {pick,decimal,money,step,lesson,table,numeric,choice} from './common.js';
import {add,multiply,safeInteger,roundHalfUp,sum,divide,compare} from '../core/exact.js';
import {balance,scale} from '../core/relationships.js';

export const financialRules={
 'money-transfer':{
  generate:r=>[pick(r,1,20)*100,pick(r,0,2)],
  solve:([amount,type])=>{const methods=['cash','a cheque','an electronic transfer'],actions=['The payer hands over notes or coins; the recipient receives the money directly.','The payer writes an instruction for a bank to pay the recipient from the payer’s account.','An authorized payment moves money between accounts using an electronic system.'];return lesson(`A person pays ${money(amount)} using ${methods[type]}. Explain how the money moves.`,[
   step(actions[type]),step('Identify the payer, recipient, amount, and a way to confirm receipt.',undefined,table(['Payer sends','Recipient receives','Method'],[[money(amount),money(amount),methods[type]]],'Assume no fees for this example')),
   step('Keep a record and confirm the correct recipient. Different methods can have different timing, fees, and protections.')
  ],{answer:methods[type],response:choice(['cash','a cheque','an electronic transfer'],type)});}
 },
 'sales-tax':{
  generate:r=>[pick(r,100,2500),pick(r,100,2500),pick(r,1,15)],
  solve:([a,b,rate])=>{const subtotal=safeInteger(sum([a,b])),tax=safeInteger(roundHalfUp(scale(subtotal,rate,100))),total=safeInteger(add(subtotal,tax));return lesson(`Items cost ${money(a)} and ${money(b)}. Use a given classroom tax rate of ${rate}% on both items. Find the total.`,[
   step('Add the pre-tax prices.',`${decimal(a)}+${decimal(b)}=${decimal(subtotal)}`),
   step('Calculate the tax on the subtotal; round to the nearest cent, half up.',`${decimal(subtotal)}\\times\\frac{${rate}}{100}\\approx ${decimal(tax)}`),
   step('Add the tax. The rate is supplied for this exercise, not a claim about a current tax rule.',`${decimal(subtotal)}+${decimal(tax)}=${decimal(total)}`)
  ],{answer:decimal(total),response:numeric(decimal(total))});}
 },
 'budget':{
  generate:r=>{const income=pick(r,20,80)*100,needs=pick(r,5,10)*100,wants=pick(r,1,5)*100;return [income,needs,wants];},
  solve:([income,needs,wants])=>{const savings=safeInteger(balance(income,[needs,wants]));return lesson(`Make a budget from ${money(income)}: ${money(needs)} for a need, ${money(wants)} for a want, and the rest for savings.`,[
   step('List income, necessary spending, optional spending, and savings.',undefined,table(['Budget category','Amount'],[['Income',money(income)],['Need',money(needs)],['Want',money(wants)],['Savings',money(savings)]],'One possible balanced budget')),
   step('Subtract spending from income to find the amount available to save.',`${decimal(income)}-${decimal(needs)}-${decimal(wants)}=${decimal(savings)}`),
   step('Check that spending plus saving equals income. Change the categories if your goals or situation change.',`${decimal(needs)}+${decimal(wants)}+${decimal(savings)}=${decimal(income)}`)
  ],{answer:decimal(savings),response:numeric(decimal(savings)),builder:{kind:'budget',income,needs,wants}});}
 },
 'credit-debt':{
  generate:r=>[pick(r,10,60)*100,pick(r,1,5)*100,pick(r,5,10)*100],
  solve:([borrowed,fee,payment])=>{const total=safeInteger(sum([borrowed,fee])),paid=Math.min(payment,total),remaining=safeInteger(balance(total,[paid]));return lesson(`Someone borrows ${money(borrowed)} with a fixed fee of ${money(fee)}. They repay ${money(paid)}. What is still owed?`,[
   step('Credit lets a person borrow. Debt is the amount they owe. Include the stated fee.',`${decimal(borrowed)}+${decimal(fee)}=${decimal(total)}`),
   step('Subtract what has been repaid.',`${decimal(total)}-${decimal(paid)}=${decimal(remaining)}`),
   step('Future repayments reduce money available for other goals. This example uses a fixed fee, not an interest-rate formula.')
  ],{answer:decimal(remaining),response:numeric(decimal(remaining))});}
 },
 'unit-price':{
  generate:r=>[pick(r,2,8),pick(r,2,8),pick(r,10,80),pick(r,10,80)],
  solve:([countA,countB,unitA,unitB])=>{const priceA=safeInteger(multiply(countA,unitA)),priceB=safeInteger(multiply(countB,unitB)),comparison=compare(divide(priceA,countA),divide(priceB,countB)),name=comparison<0?'A':comparison>0?'B':'Same value';return lesson(`Pack A: ${countA} apples for ${money(priceA)}. Pack B: ${countB} apples for ${money(priceB)}. Compare the price per apple.`,[
   step('Divide each total cost by its item count.',undefined,table(['Pack','Cost','Count','Cost per apple'],[['A',money(priceA),countA,money(unitA)],['B',money(priceB),countB,money(unitB)]],'Compare the same unit')),
   step(name==='Same value'?'Both packs have the same price per apple.':`Pack ${name} has the lower cost per apple.`,`${decimal(unitA)}${unitA<unitB?'<':unitA>unitB?'>':'='}${decimal(unitB)}`),
   step('Also consider whether you need the whole pack and whether quality is comparable.')
  ],{answer:name,response:{kind:'choice',options:['A','B','Same value'],answer:name}});}
 },
 'tax-services':{
  generate:r=>[pick(r,0,2)],
  solve:([type])=>{const levels=['municipal','provincial','federal'],examples=['property tax helps fund services such as local roads and fire services','provincial income and sales-tax revenue helps fund services such as schools and health care','federal income-tax revenue helps fund services such as national defence and transfers to provinces'];return lesson(`Describe how ${levels[type]} taxes support public services in Canada.`,[
   step(`For example, ${examples[type]}.`),
   step('Tax revenue is pooled into government budgets; one person’s tax payment does not usually buy only one named service.'),
   step('Different governments share some responsibilities. Discuss a public service you use and why people fund it together.')
  ],{answer:levels[type],reflection:true});}
 }
};
