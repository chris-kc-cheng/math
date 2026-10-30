import {rational,add,subtract,multiply,divide,power,roundHalfUp,compare,safeInteger} from '../../core/exact.js';
import {balance,scale,groupsNeeded} from '../../core/relationships.js';
import {tex,money,fixed} from '../../core/format.js';
import {pick,step,lesson,table,numeric} from '../../lesson.js';
export const financialRules8={
 'g8-exchange':{
  generate:r=>[pick(r,20,200)*100,pick(r,110,170),pick(r,1,4),pick(r,100,500)],
  solve:([foreignCents,rateHundredths,percentFee,fixedFee])=>{const cad=scale(foreignCents,rateHundredths,100),card=multiply(cad,rational(100+percentFee,100)),cash=add(cad,fixedFee);return lesson(`A purchase costs ${money(foreignCents)} in foreign currency. Given 1 foreign unit = CAD ${fixed(rational(rateHundredths,100))}, compare a ${percentFee}% conversion fee with a CAD ${money(fixedFee)} fixed fee.`,[
   step('Convert using the supplied exchange rate, not a live market quote.',`\\text{CAD base}=\\frac{${foreignCents}}{100}\\times${tex(rational(rateHundredths,100))}`),
   step('Include the fee before comparing.',undefined,table(['Method','Total CAD'],[['Percentage fee',money(safeInteger(roundHalfUp(card)))],['Fixed fee',money(safeInteger(roundHalfUp(cash)))]],'Hypothetical payment methods; round once to cents')),
   step('Also consider security, convenience, timing, and whether cash is needed. The cheaper method depends on the scenario.')
  ],{answer:compare(card,cash)<0?'Percentage fee':compare(card,cash)>0?'Fixed fee':'Equal cost'});}
 },
 'g8-financial-goal':{
  generate:r=>[pick(r,20,60)*100,pick(r,5,15)*100,pick(r,1,10),pick(r,100,300)*100],
  solve:([income,expenses,taxRate,target])=>{const tax=roundHalfUp(scale(income,taxRate,100)),saving=balance(income,[tax,expenses]),months=groupsNeeded(target,safeInteger(saving));return lesson(`Plan for a ${money(target)} goal. Monthly income is ${money(income)}, expenses ${money(expenses)}, and a given classroom tax assumption is ${taxRate}% of income.`,[
   step('Account for the stated tax assumption and expenses. This is a planning exercise, not a tax calculation for a real person.',`\\text{monthly saving}= ${fixed(rational(income,100))}-${fixed(divide(tax,100))}-${fixed(rational(expenses,100))}=${fixed(divide(saving,100))}`),
   step('Divide the target by monthly saving and round up to a full month.',`\\text{months}=${months}`),step('Track actual income and expenses. Revise the plan if circumstances or the goal change; interest and inflation are not included here.')
  ],{answer:String(months),response:numeric(String(months))});}
 },
 'g8-interest':{
  generate:r=>[pick(r,100,1000)*100,pick(r,1,10),pick(r,2,5)],
  solve:([principal,rate,years])=>{const p=rational(principal,100),r=rational(rate,100),simple=multiply(p,add(1,multiply(r,years))),compound=multiply(p,power(add(1,r),years));return lesson(`Compare simple and annually compounded interest on ${money(principal)} at a given ${rate}% annual rate for ${years} years.`,[
   step('Simple interest is calculated on the original principal.',`A=P(1+rt)=${fixed(simple)}`),
   step('Compound interest also earns interest on earlier interest.',`A=P(1+r)^t=${fixed(compound)}`),
   step('Assume annual compounding, no deposits, withdrawals, fees, or taxes, and round only the final amounts.',undefined,table(['Year','Simple balance','Compound balance'],Array.from({length:years+1},(_,i)=>[i,fixed(multiply(p,add(1,multiply(r,i)))),fixed(multiply(p,power(add(1,r),i)))]),'Balances in dollars · hypothetical rates'))
  ],{answer:{simple:fixed(simple),compound:fixed(compound)}});}
 },
 'g8-sale-value':{
  generate:r=>[pick(r,20,100)*100,pick(r,5,30),pick(r,1,10)],
  solve:([price,discount,reward])=>{const sale=scale(price,100-discount,100),loyalty=scale(price,100-reward,100);return lesson(`Compare a ${discount}% immediate discount with a ${reward}% future reward on ${money(price)}. Assume the reward can be fully used later and prices otherwise match.`,[
   step('Calculate the immediate sale cost.',`\\text{sale}= ${fixed(rational(price,100))}\\times${tex(rational(100-discount,100))}=${fixed(divide(sale,100))}`),
   step('A future reward only has value if it can be used without extra unwanted spending.',undefined,table(['Offer','Effective cost if fully used'],[['Sale',fixed(divide(sale,100))],['Future reward',fixed(divide(loyalty,100))]],'No membership fee or sales tax in this simplified comparison')),
   step('Check expiry, fees, minimum spending, and whether the purchase is needed before choosing.')
  ],{answer:compare(sale,loyalty)<0?'Sale':compare(sale,loyalty)>0?'Reward':'Equal'});}
 },
 'g8-credit-offers':{
  generate:r=>[pick(r,100,1000)*100,pick(r,5,20),pick(r,5,20),pick(r,0,50)*100,pick(r,0,50)*100],
  solve:([debt,rateA,rateB,feeA,feeB])=>{const costA=add(scale(debt,rateA,100),feeA),costB=add(scale(debt,rateB,100),feeB);return lesson(`Compare hypothetical credit offers for a ${money(debt)} balance held unchanged for one year: A has ${rateA}% simple annual interest plus ${money(feeA)} fee; B has ${rateB}% plus ${money(feeB)} fee.`,[
   step('Use the same borrowing scenario for both offers. This classroom model does not reproduce a real credit-card billing cycle.',undefined,table(['Offer','Interest plus fee'],[['A',fixed(divide(costA,100))],['B',fixed(divide(costB,100))]],'Annual cost in dollars · supplied fictional rates')),
   step(`Offer ${compare(costA,costB)<0?'A':compare(costA,costB)>0?'B':'A and B'} ${compare(costA,costB)===0?'has equal modelled cost':'has the lower modelled cost'}.`),
   step('Compare rewards, grace periods, penalties, and repayment conditions too. Paying in full can change the comparison; a reward does not automatically offset borrowing costs.')
  ],{answer:compare(costA,costB)<0?'A':compare(costA,costB)>0?'B':'Equal'});}
 }
};
