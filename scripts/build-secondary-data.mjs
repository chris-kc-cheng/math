// Regenerates the Grade 9 and 10 hierarchies and question templates from scripts/secondary-spec.mjs and the rule registry.
// Run from the repository root: npm run build:secondary-data
import fs from 'node:fs';
import {GRADE9,GRADE10,KIND9,KIND10,SEL,SEQUENCE9,SEQUENCE10} from './secondary-spec.mjs';
import {secondaryMeta,createSecondary} from '../src/math/secondary/index.js';

const out='src/curriculum/data';
const g8=JSON.parse(fs.readFileSync(`${out}/grade-8-questions.json`,'utf8'));
const selTemplate=id=>g8.find(q=>q.skillId===`g8-${id}`);
let seed=2026;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
const draw=d=>Array.isArray(d)?d[0]+Math.floor(rng()*(d[1]-d[0]+1)):d.list[Math.floor(rng()*d.list.length)];
const range=d=>Array.isArray(d)?{min:d[0],max:d[1],step:1}:d.list;
const slug=code=>code.toLowerCase().replace(/\./g,'-');
const EXAMPLE_NOTE='Try the pictured or story question. Explain your method, then refresh to explore another style.';
const SUFFIX=['',' — another way',' — mixed practice'];

function validExample(rule,styles,meta){
 const ex=[...meta.example],last=ex.length-1;
 ex[last]=styles[0];
 try{createSecondary(rule,ex);return ex;}catch{}
 for(let i=0;i<5000;i++){
  const v=meta.domains.map(draw);v[last]=styles[0];
  try{createSecondary(rule,v);return v;}catch{}
 }
 throw Error(`No valid example for ${rule} style ${styles[0]}`);
}

function build(spec,kinds,gradeKey,sel){
 const questions=[],activities=[];
 const strands=spec.strands.map(strand=>({
  id:strand.id,title:strand.title,code:strand.code,source:strand.source,
  children:strand.topics.map(topic=>({
   id:topic.id,title:topic.title,
   children:(topic.skills==='SEL'?SEL.map(s=>[s[0],s[1],s[2],'Explain how you feel when a problem is unfamiliar.',null,s[3]]):topic.skills).map(skill=>{
    const [code,title,description,example,kind,selRule]=skill,id=`g${spec.grade}-${slug(code)}`;
    const leaf={id,code,title,description,example:example||EXAMPLE_NOTE};
    let index=0;
    const push=(template)=>{index++;template.id=`g${spec.grade}-question-${slug(code)}-${index}`;template.skillId=id;questions.push(template);
     activities.push({id:`activity-${template.id}`,title:template.title,skillIds:[id],href:`./curriculum.html?grade=${spec.grade}#${id}`,coverage:'partial',modes:['practice'],questionIds:[template.id]});};
    if(selRule){
     const base=selTemplate(`a1-${code.slice(-1)}`);
     push({title,rule:base.rule,parameters:base.parameters,example:base.example});
    }else if(kind&&kind.guided){
     const items=kind.guided,half=Math.ceil(items.length/2);
     [items.slice(0,half),items.slice(half)].forEach((group,i)=>push({title:i?`${title} — another way`:title,rule:'guided-discussion',parameters:['variant'],example:{variant:0},generation:[group.map((_,k)=>k)],
      discussion:group.map(([prompt,...steps])=>({prompt,steps}))}));
    }else{
     for(const [rule,styles,suffix] of kinds[kind]){
      const meta=secondaryMeta[rule];if(!meta)throw Error(`Unknown rule ${rule}`);
      const chosen=styles||meta.domains.at(-1).list;if(chosen.some(i=>i>=meta.styles))throw Error(`${rule} has only ${meta.styles} styles, spec asks for ${chosen}`);const example=validExample(rule,chosen,meta);
      const generation=meta.domains.map((d,i)=>i===meta.domains.length-1?[...chosen]:range(d));
      push({title:suffix?`${title} — ${suffix}`:title,rule,parameters:meta.params,example:Object.fromEntries(meta.params.map((p,i)=>[p,example[i]])),generation});
     }
    }
    return leaf;
   })
  }))
 }));
 return {strands,questions,activities};
}

function write(spec,kinds,sequence,sources,description){
 const {strands,questions,activities}=build(spec,kinds);
 const data={schemaVersion:1,id:spec.id,jurisdiction:'Ontario',grade:spec.grade,language:'en',researchedAt:'2026-10-30',sources,
  curriculum:{id:`grade-${spec.grade}`,title:`Grade ${spec.grade}`,description,children:strands},suggestedSequence:sequence,activities};
 fs.writeFileSync(`${out}/${spec.id}.json`,JSON.stringify(data,null,2)+'\n');
 fs.writeFileSync(`${out}/grade-${spec.grade}-questions.json`,JSON.stringify(questions,null,2)+'\n');
 return {leaves:strands.flatMap(s=>s.children.flatMap(t=>t.children)).length,templates:questions.length};
}

const board={board:'https://www2.yrdsb.ca/about-us/director-education/directors-annual-report/board-improvement-plan-math',boardCurriculum:'https://www2.yrdsb.ca/schools-programs/school-programs-nav/school-programs/mathematics'};
const s9={number:'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/b-number',algebra:'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/c-algebra',data:'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/d-data',spatial:'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/e-geometry-and-measurement',financial:'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/f-financial-literacy',learning:'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands',...board};
const s10={document:'https://www.edu.gov.on.ca/eng/curriculum/secondary/math910curr.pdf',course:'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mpm2d',...board};
console.log('Grade 9',write(GRADE9,KIND9,SEQUENCE9,s9,'Ontario Grade 9 mathematics (MTH1W, de-streamed) for YRDSB learners: practice with varied question styles and guided exploration. Activities support practice, not certification of mastery.'));
console.log('Grade 10',write(GRADE10,KIND10,SEQUENCE10,s10,'Ontario Grade 10 Principles of Mathematics, Academic (MPM2D) for YRDSB learners: practice with varied question styles and guided exploration. Activities support practice, not certification of mastery.'));
