import {pick,step,lesson} from './common.js';
const situations=['a new fraction problem','a multi-step word problem','a geometry drawing','a pattern you do not recognize'];
const prompts={
 'manage-emotions':['Name how you feel','All feelings are allowed. Name a feeling and notice what your body is doing.','Choose a small action: take a breath, read one part, or ask for a hint.','Try that action and notice whether it helps. There is no single correct feeling.'],
 'cope-challenge':['Make a plan when stuck','Pause and identify exactly which part is confusing.','Choose a tool: draw a picture, use counters, try a simpler example, or ask a focused question.','Describe what you tried and what changed. You can change strategies.'],
 'persist':['Try another strategy','Describe your first attempt without calling it a failure.','Choose a different representation and try one manageable step.','Compare what the two attempts taught you. Taking a break and returning is also a strategy.'],
 'communicate':['Explain and listen','Describe your method using a picture, numbers, or words.','Ask a partner how their method works. Restate it in your own words and check you understood.','Compare where the methods agree and what each makes easier to see.'],
 'confidence':['Notice your progress','Name one part you can do now or one useful question you can ask.','Compare your approach with an earlier attempt. Notice a specific improvement or strategy.','Choose one next goal. Confidence can grow through practice and support.'],
 'critical-thinking':['Reason and check','Estimate a reasonable range before calculating.','Check the result with an inverse operation or a different representation.','Explain your evidence. If methods disagree, inspect the assumptions and each step.']
};
export const reflectionRules=Object.fromEntries(Object.entries(prompts).map(([id,[title,...guidance]])=>[id,{
 generate:r=>[pick(r,0,situations.length-1)],
 solve:([index])=>lesson(`${title} while working on ${situations[index]}.`,guidance.map(text=>step(text)),{reflection:true,answer:'Personal reflection; no automatic correctness score.'})
}]));
