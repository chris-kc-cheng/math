import {primaryFamily} from './primary/index.js';
import {secondaryFamily} from './secondary/index.js';
import {elementaryFamily} from './elementary/index.js';
import {grade8Family} from './grade8/index.js';
import {grade5Family} from './grade5/index.js';
import {legacyFamily} from './legacy/index.js';

// Every question family exposes the same three things:
//   has(rule)                  does this family own the rule name?
//   create(rule, values, tpl)  build the worked lesson for already-validated whole-number parameters
//   generate(rule, rng)        (optional) default parameters for templates that declare no generation domain
// Rule names are unique across families, so the order below only matters for readability.
export const families=[primaryFamily,secondaryFamily,elementaryFamily,grade8Family,grade5Family,legacyFamily];
const familyFor=rule=>families.find(family=>family.has(rule));

export function createLesson(rule,values,template){
 const family=familyFor(rule);
 if(!family)throw new Error(`Unsupported practice rule: ${rule}`);
 return family.create(rule,values,template);
}
export function defaultValues(rule,rng){
 const family=familyFor(rule);
 if(!family?.generate)throw new Error(`Unsupported practice rule: ${rule}`);
 return family.generate(rule,rng);
}
