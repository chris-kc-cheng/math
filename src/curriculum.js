import 'katex/dist/katex.min.css';
import './style.css';
import './curriculum.css';
import {catalog,curriculumForGrade} from './curriculum/catalog.js';
import {mountPractice} from './curriculum/practice-view.js';
import {setPlaybackIcon} from './curriculum/playback-controls.js';

let active=curriculumForGrade(new URLSearchParams(location.search).get('grade')||location.hash.match(/^#(?:g|grade-)([4-8])(?:-|$)/)?.[1]||'5');
let {curriculum,sources,suggestedSequence,questions}=active;
const activitiesForSkill=id=>active.activities.filter(item=>item.skillIds.includes(id));

const nodes=new Map();
function index(node,parents=[]){nodes.set(node.id,{node,parents});for(const child of node.children??[])index(child,[...parents,node]);}
index(curriculum);
const count=node=>node.children?node.children.reduce((n,c)=>n+count(c),0):1;
const app=document.querySelector('#app');
app.innerHTML='<main class="curriculum-page"><nav><a href="./">← Demo</a></nav><header class="curriculum-header"><div><p class="curriculum-eyebrow">ONTARIO · GRADE 5</p><h1>Math curriculum</h1></div><span class="curriculum-reference">Curriculum reference</span></header><div class="curriculum-layout"><aside class="curriculum-sidebar"><details id="curriculum-browser" open><summary>Browse curriculum</summary><label for="skill-search" class="sr-only">Find a skill</label><input id="skill-search" type="search" placeholder="Find a skill…" autocomplete="off"><nav id="curriculum-tree" aria-label="Grade 5 curriculum hierarchy"></nav><p id="search-status" role="status"></p></details></aside><article id="curriculum-detail" aria-live="polite" aria-atomic="true"></article></div></main>';
const tree=document.querySelector('#curriculum-tree'),detail=document.querySelector('#curriculum-detail');
let selected=curriculum.id,mode='learner',disposePractice=[];
const gradeLabel=document.createElement('label');gradeLabel.className='curriculum-grade';gradeLabel.textContent='Grade ';
const gradeSelect=document.createElement('select');gradeSelect.setAttribute('aria-label','Choose grade');
for(const item of catalog){const option=document.createElement('option');option.value=item.grade;option.textContent=item.grade;gradeSelect.append(option);}gradeSelect.value=active.grade;
gradeLabel.append(gradeSelect);document.querySelector('.curriculum-header>div').append(gradeLabel);
gradeSelect.onchange=()=>{
 active=curriculumForGrade(gradeSelect.value);({curriculum,sources,suggestedSequence,questions}=active);nodes.clear();index(curriculum);
 const url=new URL(location.href);url.searchParams.set('grade',active.grade);url.hash=curriculum.id;history.replaceState(null,'',url);
 document.querySelector('#skill-search').value='';select(curriculum.id);
};
const modeToggle=document.createElement('div');modeToggle.className='curriculum-modes';modeToggle.setAttribute('role','group');modeToggle.setAttribute('aria-label','Page mode');
for(const value of ['learner','parent']){
 const button=document.createElement('button');button.type='button';button.textContent=`${value==='learner'?'Learner':'Parent'} mode`;button.dataset.mode=value;button.setAttribute('aria-pressed',String(value===mode));
 button.onclick=()=>{mode=value;document.querySelectorAll('[data-mode]').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.mode===mode)));renderTree();renderDetail();};modeToggle.append(button);
}
document.querySelector('.curriculum-reference').replaceWith(modeToggle);
const el=(tag,text,className)=>{const item=document.createElement(tag);if(text!==undefined)item.textContent=text;if(className)item.className=className;return item;};
function chooseButton(node,className='curriculum-node'){
 const button=el('button',undefined,className);button.type='button';button.dataset.node=node.id;
 if(node.code&&mode==='parent')button.append(el('span',node.code,'curriculum-code'));
 button.append(el('span',node.title));
 if(node.children)button.append(el('small',`${count(node)} skills`));
 if(selected===node.id){button.classList.add('selected');button.setAttribute('aria-current','true');}
 button.onclick=()=>select(node.id);
 return button;
}
function matches(node,query){return `${node.code??''} ${node.title} ${node.description??''}`.toLowerCase().includes(query)||(node.children??[]).some(child=>matches(child,query));}
function renderTree(){
 tree.replaceChildren(chooseButton(curriculum,'curriculum-node grade-node'));
 const query=document.querySelector('#skill-search').value.trim().toLowerCase();
 const current=nodes.get(selected);
 let visible=0;
 for(const strand of curriculum.children){
  if(query&&!matches(strand,query))continue;
  const branch=el('details',undefined,'curriculum-branch');branch.dataset.branch=strand.id;
  branch.open=Boolean(query)||current.parents.some(n=>n.id===strand.id)||selected===strand.id||(!query&&selected===curriculum.id&&strand.code==='B');
  branch.append(el('summary',mode==='parent'?`${strand.code} · ${strand.title}`:strand.title));branch.append(chooseButton(strand,'curriculum-node overview-node'));
  for(const topic of strand.children){
   const fullMatch=query&&(`${strand.title} ${topic.title}`.toLowerCase().includes(query));
   if(query&&!fullMatch&&!matches(topic,query))continue;
   const group=el('details',undefined,'curriculum-topic');group.dataset.branch=topic.id;
   group.open=Boolean(query)||current.parents.some(n=>n.id===topic.id)||selected===topic.id;
   group.append(el('summary',mode==='parent'?topic.title:topic.title.replace(/^[A-F]\d+ · /,'')));group.append(chooseButton(topic,'curriculum-node overview-node'));
   for(const skill of topic.children){if(query&&!fullMatch&&!matches(skill,query))continue;group.append(chooseButton(skill));visible++;}
   branch.append(group);
  }
  tree.append(branch);
 }
 document.querySelector('#search-status').textContent=query?`${visible} matching ${visible===1?'skill':'skills'}`:'';
}
function sourceLink(url,label){const a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function renderLearner(node){
 const heading=el('div',undefined,'curriculum-detail-heading');
 heading.append(el('h2',node.title.replace(/^[A-F]\d+ · /,'')));
 if(node.children){
  const showAll=el('button');showAll.type='button';
  setPlaybackIcon(showAll,'all','Show all explanations');
  showAll.onclick=()=>disposePractice.forEach(practice=>practice.showAll());
  heading.append(showAll);
 }
 detail.append(heading);
 if(node.children)detail.append(el('p','Choose a topic on the left, or try a question below.','learner-intro'));
 const leaves=[];function collect(item){if(item.children)item.children.forEach(collect);else leaves.push(item);}collect(node);
 for(const skill of leaves){
  const samples=questions.filter(question=>question.skillId===skill.id);
  const group=el('div',undefined,'learner-skill');
  if(node.children)group.append(el('h3',skill.title));
  if(samples.length)for(const sample of samples)disposePractice.push(mountPractice(group,sample));
  else {group.append(el('p',skill.example,'learner-example'),el('p','Practice coming soon','curriculum-note'));}
  detail.append(group);
 }
}
function renderDetail(){
 disposePractice.forEach(dispose=>dispose());disposePractice=[];
 const {node,parents}=nodes.get(selected),strand=parents.find(n=>n.source)??(node.source?node:null);
 detail.replaceChildren();
 document.querySelector('.curriculum-page').dataset.view=mode;
 document.title=`Grade ${active.grade} Math Curriculum · Little Math Lab`;
 document.querySelector('.curriculum-eyebrow').textContent=`ONTARIO · GRADE ${active.grade}`;
 tree.setAttribute('aria-label',`Grade ${active.grade} curriculum hierarchy`);
 document.querySelector('.curriculum-header h1').textContent=mode==='learner'?'Let’s practise':'Math curriculum';
 if(mode==='learner'){renderLearner(node);return;}
 detail.append(el('p',[...parents.map(n=>n.title),node.code??node.title].join(' / '),'curriculum-breadcrumb'));
 if(node.code)detail.append(el('span',node.code,'expectation-tag'));
 detail.append(el('h2',node.title));
 if(!node.children)detail.append(el('h3','Curriculum requirement'));
 if(node.description)detail.append(el('p',node.description,'curriculum-description'));
 if(node.children){
  detail.append(el('p',`${count(node)} curriculum skills`,'curriculum-count'));
  const children=el('div',undefined,'curriculum-children');for(const child of node.children)children.append(chooseButton(child,'curriculum-card'));detail.append(children);
 }else{
  const example=el('div',undefined,'curriculum-example');example.append(el('h3','Example activity'),el('p',node.example));detail.append(example);
  const practiceSamples=questions.filter(question=>question.skillId===node.id);
  if(practiceSamples.length){
   detail.append(el('h3','Interactive samples'));
   const list=el('ul');for(const sample of practiceSamples)list.append(el('li',sample.title));detail.append(list);
   const trySamples=el('button','Try these questions');trySamples.type='button';trySamples.onclick=()=>document.querySelector('[data-mode="learner"]').click();detail.append(trySamples);
   detail.append(el('p',`${practiceSamples.length} activity ${practiceSamples.length===1?'type':'types'} available. Worked examples and guided activities provide practice; they do not certify mastery of every context or method. Some construction and discussion tasks benefit from paper, tools, or a partner.`,'curriculum-note'));
  }
  const linkedActivities=activitiesForSkill(node.id);
  if(linkedActivities.length){
   for(const item of linkedActivities){const activity=el('a',`Try ${item.title}`);activity.href=item.href;detail.append(activity);}
   detail.append(el('p',linkedActivities.some(item=>item.coverage==='complete')?'Practice is available for this expectation.':'These activities cover part of this expectation; further activities are still needed.','curriculum-note'));
  }else detail.append(el('p',practiceSamples.length?'Interactive samples cover part of this expectation. Further activities and representations are still needed.':'This is a curriculum skill description. A dedicated practice activity is not linked here yet.','curriculum-note'));
 }
 if(node.id==='learning'){
  detail.append(el('h3','Mathematical processes'));
  detail.append(el('p','Problem solving, reasoning and proving, reflecting, selecting tools and strategies, connecting, representing, and communicating are practised across the strands.'));
 }
 if(selected===curriculum.id){
  const sequence=el('details',undefined,'curriculum-sequence');sequence.append(el('summary','Suggested learning path'));
  sequence.append(el('p','This is a suggested route for the app, not a published YRDSB timetable. Coding, modelling, and mathematical processes should recur throughout.'));
  const list=el('ol');for(const [title,text] of suggestedSequence){const li=el('li');li.append(el('strong',title),el('p',text));list.append(li);}sequence.append(list);detail.append(sequence);
 }
 const provenance=el('div',undefined,'curriculum-provenance');
 provenance.append(el('h3','Curriculum and sequence'));
 provenance.append(el('p',`This hierarchy follows Ontario’s Grade ${active.grade} expectations. Strand order is an organizational structure, not a prescribed teaching sequence. YRDSB states that its board-developed long-range plans are internal; a board-preferred Grade ${active.grade} order has not been verified here.`));
 if(strand)provenance.append(sourceLink(strand.source,'Read curriculum source'),' · ');
 provenance.append(sourceLink(sources.board,'YRDSB planning information'));
 if(sources.boardCurriculum)provenance.append(' · ',sourceLink(sources.boardCurriculum,'YRDSB mathematics curriculum'));
 if(selected===curriculum.id){const list=el('ul');for(const item of curriculum.children){const li=el('li');li.append(sourceLink(item.source,`${item.code} · ${item.title}`));list.append(li);}provenance.append(list);}
 detail.append(provenance);
}
function select(id){if(!nodes.has(id))id=curriculum.id;selected=id;history.replaceState(null,'',`#${id}`);renderTree();renderDetail();}
const search=document.querySelector('#skill-search');search.oninput=renderTree;
window.addEventListener('hashchange',()=>select(location.hash.slice(1)));
if(matchMedia('(max-width:760px)').matches)document.querySelector('#curriculum-browser').open=false;
select(location.hash.slice(1)||curriculum.id);
window.addEventListener('pagehide',()=>disposePractice.forEach(dispose=>dispose()));
