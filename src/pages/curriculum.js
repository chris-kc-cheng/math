import {clearCalculatorContext} from '../calculator/plans.js';
import 'katex/dist/katex.min.css';
import {pageNav} from '../ui/nav.js';
import '../styles/base.css';
import '../styles/curriculum.css';
import {catalog,curriculumForGrade} from '../curriculum/catalog.js';
import {mountPractice} from '../curriculum/practice-view.js';
import {setPlaybackIcon} from '../curriculum/playback-controls.js';
import {listRounds} from '../game/storage.js';
import {progressTree,attemptHistory,recentRate,levelOf} from '../game/model.js';
import {activeProfile} from '../game/profile.js';
import {mountGradePicker} from '../ui/grade-picker.js';
import {el} from '../ui/dom.js';

let active=curriculumForGrade(new URLSearchParams(location.search).get('grade')||location.hash.match(/^#(?:g|grade-)(10|[1-9])(?:-|$)/)?.[1]||'5');
let {curriculum,sources,suggestedSequence,questions}=active;
const activitiesForSkill=id=>active.activities.filter(item=>item.skillIds.includes(id));

const nodes=new Map();
function index(node,parents=[]){nodes.set(node.id,{node,parents});for(const child of node.children??[])index(child,[...parents,node]);}
index(curriculum);
const count=node=>node.children?node.children.reduce((n,c)=>n+count(c),0):1;
const app=document.querySelector('#app');
app.innerHTML='<main class="curriculum-page">'+pageNav('curriculum')+'<header class="curriculum-header"><div><p class="curriculum-eyebrow">ONTARIO</p><h1>Math curriculum</h1></div></header><div class="curriculum-layout"><aside class="curriculum-sidebar"><div class="sidebar-bar"><div id="mode-toggle" class="curriculum-modes" role="group" aria-label="View"></div><button id="worksheet-button" type="button" class="sheet-button" aria-haspopup="dialog" aria-label="Create exercise sheet (PDF)" title="Create exercise sheet (PDF)"></button></div><details id="curriculum-browser" open><summary>Browse curriculum</summary><label for="skill-search" class="sr-only">Find a skill</label><input id="skill-search" type="search" placeholder="Find a skill…" autocomplete="off"><nav id="curriculum-tree" aria-label="Grade 5 curriculum hierarchy"></nav><p id="search-status" role="status"></p></details></aside><article id="curriculum-detail" aria-live="polite" aria-atomic="true"></article></div></main>';
const tree=document.querySelector('#curriculum-tree'),detail=document.querySelector('#curriculum-detail');
let selected=curriculum.id,mode='learner',disposePractice=[];
const icons={
 learner:['M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 000-17z','M9.2 10.2h.01','M14.8 10.2h.01','M8.3 13.8c.9 1.7 2.1 2.5 3.7 2.5s2.8-.8 3.7-2.5','M10.5 3.7c.2-1.2 1.4-2 2.8-1.7'],
 parent:['M8 10a3 3 0 100-6 3 3 0 000 6z','M2.5 20v-2a4.5 4.5 0 014.5-4.5h2a4.5 4.5 0 014.5 4.5v2','M15 5h7v8h-7z','M17 8h3','M17 10.5h2'],
 swap:['M8 9l4-4 4 4','M8 15l4 4 4-4'],
 menu:['M5 7h14','M5 12h14','M5 17h14'],
 person:['M12 12a4 4 0 100-8 4 4 0 000 8z','M4 20c1-4 4-6 8-6s7 2 8 6'],
 print:['M7 8V3h10v5','M7 17H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-2','M7 14h10v7H7z']
};
function icon(name){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.7');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');
 for(const d of icons[name]){const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',d);svg.append(path);}return svg;
}
function setGrade(value){
 active=curriculumForGrade(value);({curriculum,sources,suggestedSequence,questions}=active);nodes.clear();index(curriculum);computeStats();
 const url=new URL(location.href);url.searchParams.set('grade',active.grade);url.hash=curriculum.id;history.replaceState(null,'',url);
 document.querySelector('#skill-search').value='';select(curriculum.id);
}
// Popovers are fixed-position so the scrolling sidebar cannot clip them; one is open at a time.
let openPopover=null;
function closePopover(){if(openPopover){openPopover.panel.hidden=true;openPopover.button.setAttribute('aria-expanded','false');openPopover=null;}}
function togglePopover(button,panel){
 if(openPopover?.panel===panel){closePopover();return;}
 closePopover();const box=button.getBoundingClientRect();panel.hidden=false;
 panel.style.top=`${box.bottom+6}px`;panel.style.left=`${Math.max(8,Math.min(box.left,innerWidth-panel.offsetWidth-8))}px`;
 button.setAttribute('aria-expanded','true');openPopover={button,panel};
}
document.addEventListener('click',event=>{if(openPopover&&!openPopover.panel.contains(event.target)&&!openPopover.button.contains(event.target))closePopover();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&openPopover){const {button}=openPopover;closePopover();button.focus();}});
addEventListener('resize',closePopover);addEventListener('scroll',closePopover,true);
const sheetButton=document.querySelector('#worksheet-button');sheetButton.append(icon('print'));
// The exercise-sheet dialog and print layout load only when asked for.
sheetButton.onclick=async()=>{closePopover();const {openWorksheetDialog}=await import('../curriculum/worksheet.js');openWorksheetDialog(active);};
const modeToggle=document.querySelector('#mode-toggle');
for(const value of ['learner','parent']){
 const button=document.createElement('button');button.type='button';button.className='mode-button';button.append(icon(value));
 const label=`${value==='learner'?'Learner':'Parent or teacher'} mode`;button.setAttribute('aria-label',label);button.title=label;button.dataset.mode=value;button.setAttribute('aria-pressed',String(value===mode));
 button.onclick=()=>{mode=value;document.querySelectorAll('[data-mode]').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.mode===mode)));renderTree();renderDetail();};modeToggle.append(button);
}
// Progress dots come from the active player's saved Math quest rounds; with no profile nothing is shown.
const statLabel={good:'Strong',fair:'Getting there',weak:'Needs practice',none:'Not tried yet',na:'Not in Practice'};
let rounds=[],profile=null,stats=new Map();
function computeStats(){
 stats=new Map();if(!profile)return;
 const walk=n=>{stats.set(n.id,n);n.children?.forEach(walk);};progressTree(active,rounds,profile.id).forEach(walk);
 // The grade row summarises every scored question, so it matches the topics beneath it.
 const overall=recentRate(attemptHistory(active,rounds,profile.id));stats.set(curriculum.id,{id:curriculum.id,stat:overall,status:levelOf(overall)});
}
// Nodes the game cannot score still get a (lighter) circle so every row lines up.
const statFor=node=>profile?stats.get(node.id)||{status:'na',stat:null}:undefined;
const statText=stat=>stat.status==='na'?'Not scored in Practice yet':stat.stat?`${Math.round(stat.stat.rate*100)}% of last ${stat.stat.attempts} questions`:'Not tried yet';
function statDot(stat){const dot=el('span',undefined,'stat-dot '+stat.status);dot.setAttribute('role','img');dot.setAttribute('aria-label',`${statLabel[stat.status]}: ${statText(stat)}`);dot.title=`${statLabel[stat.status]} · ${statText(stat)}`;return dot;}
function summaryFor(text,node){const summary=el('summary'),stat=statFor(node);if(stat)summary.append(statDot(stat));summary.append(text);return summary;}
function chooseButton(node,className='curriculum-node'){
 const button=el('button',undefined,className);button.type='button';button.dataset.node=node.id;
 const stat=statFor(node);if(stat)button.append(statDot(stat));
 if(node.code&&mode==='parent')button.append(el('span',node.code,'curriculum-code'));
 button.append(el('span',node.title));
 if(node.children)button.append(el('small',`${count(node)} skills`));
 if(selected===node.id){button.classList.add('selected');button.setAttribute('aria-current','true');}
 button.onclick=()=>select(node.id);
 return button;
}
function matches(node,query){return `${node.code??''} ${node.title} ${node.description??''}`.toLowerCase().includes(query)||(node.children??[]).some(child=>matches(child,query));}
function renderTree(){
 const gradeRow=el('div',undefined,'grade-row');gradeRow.append(chooseButton(curriculum,'curriculum-node grade-node'));
 // One connected control: grade overview on the left, grade menu on the right.
 const picker=mountGradePicker(gradeRow,{grades:catalog.map(item=>item.grade),value:active.grade,onChange:value=>setGrade(value),compact:true,collapsible:true});
 picker.trigger.title='Choose grade';
 tree.replaceChildren(gradeRow);
 const query=document.querySelector('#skill-search').value.trim().toLowerCase();
 const current=nodes.get(selected);
 let visible=0;
 for(const strand of curriculum.children){
  if(query&&!matches(strand,query))continue;
  const branch=el('details',undefined,'curriculum-branch');branch.dataset.branch=strand.id;
  branch.open=Boolean(query)||current.parents.some(n=>n.id===strand.id)||selected===strand.id||(!query&&selected===curriculum.id&&strand.code==='B');
  branch.append(summaryFor(mode==='parent'?`${strand.code} · ${strand.title}`:strand.title,strand));branch.append(chooseButton(strand,'curriculum-node overview-node'));
  for(const topic of strand.children){
   const fullMatch=query&&(`${strand.title} ${topic.title}`.toLowerCase().includes(query));
   if(query&&!fullMatch&&!matches(topic,query))continue;
   const group=el('details',undefined,'curriculum-topic');group.dataset.branch=topic.id;
   group.open=Boolean(query)||current.parents.some(n=>n.id===topic.id)||selected===topic.id;
   group.append(summaryFor(mode==='parent'?topic.title:topic.title.replace(/^[A-F]\d+ · /,''),topic));group.append(chooseButton(topic,'curriculum-node overview-node'));
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
 // Every level, including a single skill, can show all its explanations at once.
 const showAll=el('button');showAll.type='button';
 setPlaybackIcon(showAll,'all','Show all explanations');
 showAll.onclick=()=>disposePractice.forEach(practice=>practice.showAll());
 heading.append(showAll);
 detail.append(heading);
 const mine=stats.get(node.id);if(mine){const note=el('p',undefined,'curriculum-stat');note.append(statDot(mine),`${profile.name}: ${mine.stat?statLabel[mine.status]+" ("+statText(mine)+")":statText(mine)}`);detail.append(note);}
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
 clearCalculatorContext();
 disposePractice.forEach(dispose=>dispose());disposePractice=[];
 const {node,parents}=nodes.get(selected),strand=parents.find(n=>n.source)??(node.source?node:null);
 detail.replaceChildren();
 document.querySelector('.curriculum-page').dataset.view=mode;
 document.title=`Grade ${active.grade} Math Curriculum · Whack-a-Math`;
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
try{rounds=await listRounds();}catch{rounds=[];}
profile=activeProfile(rounds);computeStats();
// The player badge in the corner chooses whose progress is shown; its stats refresh when a Practice round is saved.
document.addEventListener('math-profile-change',event=>{profile=event.detail;computeStats();renderTree();renderDetail();});
document.addEventListener('math-rounds-changed',async()=>{try{rounds=await listRounds();}catch{}profile=activeProfile(rounds);computeStats();renderTree();renderDetail();});
select(location.hash.slice(1)||curriculum.id);
window.addEventListener('pagehide',()=>disposePractice.forEach(dispose=>dispose()));
