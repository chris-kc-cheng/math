import {primaryNumberRules} from './number.js';
import {primaryAlgebraRules} from './algebra.js';
import {primaryDataRules} from './data.js';
import {primarySpatialRules} from './spatial.js';
import {primaryFinancialRules} from './financial.js';
import {requireThat} from './common.js';
export const primaryRules={...primaryNumberRules,...primaryAlgebraRules,...primaryDataRules,...primarySpatialRules,...primaryFinancialRules};
export function createPrimary(rule,values){
 requireThat(values.every(n=>Number.isSafeInteger(n)&&n>=0&&n<=10000),'Use bounded nonnegative primary parameters.');
 requireThat(Object.hasOwn(primaryRules,rule),'Unsupported primary activity.');return primaryRules[rule](values);
}
// Exact single-answer variants can serve games and worksheets; text/choice variants are filtered by their actual answer.
export const primaryScorableRules=new Set(Object.keys(primaryRules).filter(rule=>!['primary-fair-share','primary-parity','primary-pattern','primary-symmetry','primary-likelihood'].includes(rule)));
