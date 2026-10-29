import './style.css';
import './curriculum.css';
import {curriculum,sources,suggestedSequence,activitiesForSkill} from './curriculum-data.js';

const nodes=new Map();
function index(node,parents=[]){nodes.set(node.id,{node,parents});for(const child of node.children??[])index(child,[...parents,node]);}
index(curriculum);
const count=node=>node.children?node.children.reduce((n,c)=>n+count(c),0):1;
const app=document.querySelector('#app');
app.innerHTML='<main class="curriculum-page"><nav><a href="./">← Demo</a> · <a href="./skills.html">Math skills & captions</a></nav><header class="curriculum-header"><div><p class="curriculum-eyebrow">ONTARIO · GRADE 5</p><h1>Math curriculum</h1></div><span class="curriculum-reference">Curriculum reference</span></header><div class="curriculum-layout"><aside class="curriculum-sidebar"><details id="curriculum-browser" open><summary>Browse curriculum</summary><label for="skill-search" class="sr-only">Find a skill</label><input id="skill-search" type="search" placeholder="Find a skill…" autocomplete="off"><nav id="curriculum-tree" aria-label="Grade 5 curriculum hierarchy"></nav><p id="search-status" role="status"></p></details></aside><article id="curriculum-detail" aria-live="polite" aria-atomic="true"></article></div></main>';
const tree=document.querySelector('#curriculum-tree'),detail=document.querySelector('#curriculum-detail');
let selected='grade-5';
const el=(tag,text,className)=>{const item=document.createElement(tag);if(text!==undefined)item.textContent=text;if(className)item.className=className;return item;};
function chooseButton(node,className='curriculum-node'){
 const button=el('button',undefined,className);button.type='button';button.dataset.node=node.id;
 if(node.code)button.append(el('span',node.code,'curriculum-code'));
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
  branch.open=Boolean(query)||current.parents.some(n=>n.id===strand.id)||selected===strand.id||(!query&&selected==='grade-5'&&strand.id==='number');
  branch.append(el('summary',`${strand.code} · ${strand.title}`));branch.append(chooseButton(strand,'curriculum-node overview-node'));
  for(const topic of strand.children){
   const fullMatch=query&&(`${strand.title} ${topic.title}`.toLowerCase().includes(query));
   if(query&&!fullMatch&&!matches(topic,query))continue;
   const group=el('details',undefined,'curriculum-topic');group.dataset.branch=topic.id;
   group.open=Boolean(query)||current.parents.some(n=>n.id===topic.id)||selected===topic.id;
   group.append(el('summary',topic.title));group.append(chooseButton(topic,'curriculum-node overview-node'));
   for(const skill of topic.children){if(query&&!fullMatch&&!matches(skill,query))continue;group.append(chooseButton(skill));visible++;}
   branch.append(group);
  }
  tree.append(branch);
 }
 document.querySelector('#search-status').textContent=query?`${visible} matching ${visible===1?'skill':'skills'}`:'';
}
function sourceLink(url,label){const a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function renderDetail(){
 const {node,parents}=nodes.get(selected),strand=parents.find(n=>n.source)??(node.source?node:null);
 detail.replaceChildren();
 detail.append(el('p',[...parents.map(n=>n.title),node.code??node.title].join(' / '),'curriculum-breadcrumb'));
 if(node.code)detail.append(el('span',node.code,'expectation-tag'));
 detail.append(el('h2',node.title));
 if(node.description)detail.append(el('p',node.description,'curriculum-description'));
 if(node.children){
  detail.append(el('p',`${count(node)} curriculum skills`,'curriculum-count'));
  const children=el('div',undefined,'curriculum-children');for(const child of node.children)children.append(chooseButton(child,'curriculum-card'));detail.append(children);
 }else{
  const example=el('div',undefined,'curriculum-example');example.append(el('h3','Example activity'),el('p',node.example));detail.append(example);
  const linkedActivities=activitiesForSkill(node.id);
  if(linkedActivities.length){
   for(const item of linkedActivities){const activity=el('a',`Try ${item.title}`);activity.href=item.href;detail.append(activity);}
   detail.append(el('p',linkedActivities.some(item=>item.coverage==='complete')?'Practice is available for this expectation.':'These activities cover part of this expectation; further activities are still needed.','curriculum-note'));
  }else detail.append(el('p','This is a curriculum skill description. A dedicated practice activity is not linked here yet.','curriculum-note'));
 }
 if(node.id==='learning'){
  detail.append(el('h3','Mathematical processes'));
  detail.append(el('p','Problem solving, reasoning and proving, reflecting, selecting tools and strategies, connecting, representing, and communicating are practised across the strands.'));
 }
 if(selected==='grade-5'){
  const sequence=el('details',undefined,'curriculum-sequence');sequence.append(el('summary','Suggested learning path'));
  sequence.append(el('p','This is a suggested route for the app, not a published YRDSB timetable. Coding, modelling, and mathematical processes should recur throughout.'));
  const list=el('ol');for(const [title,text] of suggestedSequence){const li=el('li');li.append(el('strong',title),el('p',text));list.append(li);}sequence.append(list);detail.append(sequence);
 }
 const provenance=el('div',undefined,'curriculum-provenance');
 provenance.append(el('h3','Curriculum and sequence'));
 provenance.append(el('p','This hierarchy follows Ontario’s Grade 5 expectations. Strand order is an organizational structure, not a prescribed teaching sequence. YRDSB states that its board-developed long-range plans are on its internal website; a board-preferred Grade 5 order has not been verified here.'));
 if(strand)provenance.append(sourceLink(strand.source,'Read curriculum source'),' · ');
 provenance.append(sourceLink(sources.board,'YRDSB planning information'));
 if(selected==='grade-5'){const list=el('ul');for(const item of curriculum.children){const li=el('li');li.append(sourceLink(item.source,`${item.code} · ${item.title}`));list.append(li);}provenance.append(list);}
 detail.append(provenance);
}
function select(id){if(!nodes.has(id))id='grade-5';selected=id;history.replaceState(null,'',`#${id}`);renderTree();renderDetail();}
const search=document.querySelector('#skill-search');search.oninput=renderTree;
window.addEventListener('hashchange',()=>select(location.hash.slice(1)));
if(matchMedia('(max-width:760px)').matches)document.querySelector('#curriculum-browser').open=false;
select(location.hash.slice(1)||'grade-5');
