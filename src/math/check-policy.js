// "Check the answer" earns its place only when it tests the answer in a way the learner has not
// already seen: undoing the operation, substituting into the original equation, multiplying back to a
// quotient and remainder, testing a boundary. A check is dropped when it
//   - repeats the calculation the lesson just did ("recalculate a second time"),
//   - restates the question ("the answer is one of the two numbers", "add the categories"),
//   - compares a number with itself ("14 = 14"), or
//   - states a fact that holds by definition ("a probability is between 0 and 1").
// The generators still verify every answer internally; this only decides what the learner is shown.

// Rules whose verification only repeats the question or the method.
export const RESTATING_RULES=new Set([
 'compare-fractions-story','compare-values','rational-pick','chart-read','percent-quantity','percent-story',
 'scientific-story','powers-of-ten','interval-count','primary-sort','divisibility-count',
 'g8-powers-ten','g8-scientific','mental-scale'
]);

// Individual steps of otherwise useful checks that merely restate something.
const RESTATING_TEXT=[
 /second (?:time|way)/i,
 /^Recompute /i,
 /^Opposite angles are equal/i,
 /^Heads plus tails/i,
 /^Work back to the count/i,
 /^A probability must be between/i,
 /^A product with a zero factor/i,
 /^The remainder must be smaller than the divisor/i,
 /^A length must also be nonnegative/i,
 /^The principal square root must be nonnegative/i,
 /^Check the median/i,
 /^Count repeated values/i,
 /^No other value appears as often/i,
 /^Two values lie on each side of the median/i,
 /^Count both sides independently/i
];

const normal=text=>String(text??'').replace(/\\left|\\right|\\[,;! ]|\s/g,'');
/** True for "x=x": a step that equates two identical expressions and so proves nothing. */
export function isTautology(math){
 const sides=normal(math).split('=');
 return sides.length===2&&sides[0]!==''&&sides[0]===sides[1];
}
// Substitution checks end with "25 = 25" after a "17+8 ?= 25" row; that evaluation row is the point of the check.
const isEvaluationRow=step=>/^Evaluate each side/i.test(step.text||'');

export function meaningfulVerification(rule,verification){
 if(!verification||RESTATING_RULES.has(rule))return undefined;
 const steps=verification.steps.filter(step=>!RESTATING_TEXT.some(pattern=>pattern.test(step.text||''))&&(isEvaluationRow(step)||!step.math||!isTautology(step.math)));
 if(!steps.some(step=>step.math))return undefined;
 return steps.length===verification.steps.length?verification:{...verification,steps,valid:steps.every(step=>step.valid!==false)};
}
