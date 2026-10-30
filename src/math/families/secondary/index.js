import {rules,meta} from './common.js';
import './number.js';
import './algebra.js';
import './data.js';
import './spatial.js';
import './financial.js';
import './quadratic.js';
import './analytic.js';
import './trig.js';
export const secondaryRules=rules;
export const secondaryMeta=meta;
export function createSecondary(rule,values){
 if(!Object.hasOwn(rules,rule))throw Error('Unsupported secondary question family.');
 return rules[rule](values);
}
export const secondaryFamily={name:'secondary',has:rule=>Object.hasOwn(rules,rule),create:createSecondary};
