import test from 'node:test';
import assert from 'node:assert/strict';
import {createEngine} from './engine.js';
import {emptyState} from './state.js';
import {HttpError} from './http.js';

// ---- an in-memory server with the same rules as the real one (first write wins for results, last write wins for profiles) ----
function fakeServer(){
 const learners=new Map(),results=new Map(),deleted=new Set();let seq=0;const calls=[];let offline=false;
 const guard=()=>{if(offline)throw new HttpError('Could not reach the server.',0);};
 const api={
  async listLearners(){guard();calls.push('listLearners');return {learners:[...learners.values()].map(l=>({...l})),deleted:[...deleted]};},
  async putLearner(id,body){
   guard();calls.push('putLearner');
   if(deleted.has(id))throw new HttpError('gone',410,{});
   const clash=[...learners.values()].find(l=>l.id!==id&&l.name.toLowerCase()===body.name.toLowerCase());
   if(clash)throw new HttpError('exists',409,{learner:{...clash}});
   const row=learners.get(id);
   if(!row||body.updated_at>=row.updated_at){learners.set(id,{id,...body});return {...learners.get(id),applied:true};}
   return {...row,applied:false};
  },
  async deleteLearner(id){guard();if(!learners.has(id))throw new HttpError('nf',404,{});learners.delete(id);deleted.add(id);for(const [k,r] of results)if(r.learner_id===id)results.delete(k);},
  async postResults(list){
   guard();calls.push('postResults');
   return {results:list.map(r=>{
    if(deleted.has(r.learner_id))return {id:r.id,status:'gone'};
    if(!learners.has(r.learner_id))return {id:r.id,status:'unknown_learner'};
    if(results.has(r.id))return {id:r.id,status:'duplicate'};
    if(r.questions>50)return {id:r.id,status:'rejected',reason:'too many'};
    results.set(r.id,{...r,seq:++seq});return {id:r.id,status:'created'};
   })};
  },
  async listResults(id,since){
   guard();const all=[...results.values()].filter(r=>r.learner_id===id&&r.seq>since).sort((a,b)=>a.seq-b.seq),page=all.slice(0,2);
   return {results:page,next:page.length?page.at(-1).seq:since,has_more:all.length>page.length};
  },
 };
 return {api,learners,results,deleted,calls,setOffline:v=>{offline=v;}};
}

// ---- one device ----
function device(server,{profiles=[],rounds=[]}={}){
 const mem={state:emptyState(),profiles:new Map(profiles.map(p=>[p.id,{avatar:null,updatedAt:0,...p}])),rounds:new Map(rounds.map(r=>[r.id,r]))};
 const local={
  async profiles(){const ids=new Map(mem.profiles);for(const r of mem.rounds.values())if(!ids.has(r.profileId))ids.set(r.profileId,{id:r.profileId,name:r.playerName,avatar:null,updatedAt:0});return [...ids.values()];},
  async rounds(){return [...mem.rounds.values()];},
  async upsertProfile(p){mem.profiles.set(p.id,{...p});},
  async addRounds(list){let n=0;for(const r of list)if(!mem.rounds.has(r.id)){mem.rounds.set(r.id,r);n++;}return n;},
 };
 const store={load:()=>structuredClone(mem.state),save:s=>{mem.state=structuredClone(s);}};
 let n=0;
 const engine=createEngine({api:server.api,local,store,uuid:()=>`00000000-0000-4000-8000-${String(++n).padStart(12,'0')}`,now:()=>Date.now()});
 return {engine,mem,local};
}
const round=(id,profileId='chloe',over={})=>({id,version:1,revision:3,grade:4,topics:['B2'],difficulty:'auto',createdAt:1_800_000_000_000,updatedAt:1_800_000_090_000,index:1,status:'complete',
 profileId,playerName:profileId[0].toUpperCase()+profileId.slice(1),questions:[{templateId:'g4-a',values:{a:1},attempts:1,correct:true,assisted:false,entry:'7'},{templateId:'g4-b',values:{a:2},attempts:2,correct:false,assisted:true,entry:'3'}],...over});

test('first login with local data asks, uploads nothing until the person chooses, then saves everything once',async()=>{
 const server=fakeServer(),a=device(server,{profiles:[{id:'chloe',name:'Chloe',avatar:'🦊',updatedAt:5}],rounds:[round('r1'),round('r2')]});
 const first=await a.engine.run();
 assert.equal(first.status,'ask');assert.equal(first.pending.profiles.length,1);assert.equal(first.pending.rounds.length,2);
 assert.equal(server.learners.size+server.results.size,0);
 const done=await a.engine.attachAll();
 assert.equal(done.status,'saved');assert.equal(done.uploaded,2);assert.equal(server.learners.size,1);assert.equal(server.results.size,2);
 assert.equal([...server.learners.values()][0].avatar,'🦊');
 const again=await a.engine.run();assert.equal(again.uploaded,0);assert.equal(server.results.size,2);
});

test('retrying after a lost response creates no duplicates',async()=>{
 const server=fakeServer(),a=device(server,{rounds:[round('r1')]});
 await a.engine.attachAll();
 a.mem.state.pushed={};                                      // the device never learned the first push worked
 const out=await a.engine.run();
 assert.equal(out.uploaded,0);assert.equal(server.results.size,1);   // the server answered "duplicate"
 assert.equal(a.mem.state.pushed.r1,1);
});

test('a new device receives profiles and finished rounds, and does not push them back',async()=>{
 const server=fakeServer(),a=device(server,{profiles:[{id:'chloe',name:'Chloe',avatar:'🐸',updatedAt:5}],rounds:[round('r1'),round('r2'),round('r3')]});
 await a.engine.attachAll();
 const b=device(server);
 const out=await b.engine.run();                             // nothing local, so no question
 assert.equal(out.status,'saved');assert.equal(out.downloaded,3);
 assert.equal(b.mem.profiles.get('chloe').avatar,'🐸');
 const pulled=b.mem.rounds.get('r1');
 assert.equal(pulled.remote,true);assert.equal(pulled.status,'complete');assert.equal(pulled.profileId,'chloe');
 assert.deepEqual(pulled.questions.map(q=>[q.templateId,q.correct,q.assisted]),[['g4-a',true,false],['g4-b',false,true]]);
 const callsBefore=server.calls.filter(c=>c==='postResults').length;
 await b.engine.run();assert.equal(server.calls.filter(c=>c==='postResults').length,callsBefore);   // nothing to push
 assert.equal(server.results.size,3);
});

test('paging through many results uses the cursor and gets all of them',async()=>{
 const server=fakeServer(),a=device(server,{rounds:[1,2,3,4,5].map(n=>round('r'+n))});
 await a.engine.attachAll();
 const b=device(server);const out=await b.engine.run();
 assert.equal(out.downloaded,5);assert.equal((await b.engine.run()).downloaded,0);
});

test('declining keeps existing local data off the account but new play is saved',async()=>{
 const server=fakeServer(),a=device(server,{rounds:[round('old')]});
 assert.equal((await a.engine.run()).status,'ask');
 await a.engine.keepLocalOnly();
 assert.equal(server.results.size,0);
 a.mem.rounds.set('new',round('new'));
 await a.engine.run();
 assert.deepEqual([...server.results.keys()],['new']);
});

test('a same-named local profile joins the account profile instead of duplicating it',async()=>{
 const server=fakeServer(),a=device(server,{rounds:[round('r1')]});
 await a.engine.attachAll();
 const b=device(server,{rounds:[round('r9')]});                // another device where Chloe also played anonymously
 assert.equal((await b.engine.run()).status,'ask');            // the pull linked the names; its own round is still the person's choice
 await b.engine.attachAll();
 assert.equal(server.learners.size,1);assert.equal(server.results.size,2);
 assert.equal(b.mem.rounds.size,2);
});

test('409 on a name clash adopts the existing account profile',async()=>{
 const server=fakeServer();
 server.learners.set('11111111-1111-4111-8111-111111111111',{id:'11111111-1111-4111-8111-111111111111',name:'chloe',avatar:null,updated_at:1});
 const a=device(server,{rounds:[round('r1')]});
 a.mem.state.attach='done';                                    // pretend the link was not seen yet
 await a.engine.run();
 assert.equal(server.learners.size,1);assert.ok(server.results.get('r1'));
});

test('profile avatar: the newer change wins on both sides',async()=>{
 const server=fakeServer(),a=device(server,{profiles:[{id:'chloe',name:'Chloe',avatar:'🦊',updatedAt:100}],rounds:[round('r1')]});
 await a.engine.attachAll();
 const b=device(server);await b.engine.run();assert.equal(b.mem.profiles.get('chloe').avatar,'🦊');
 b.mem.profiles.get('chloe').avatar='🐸';b.mem.profiles.get('chloe').updatedAt=Date.now();   // a later change on device B
 await b.engine.run();
 assert.equal([...server.learners.values()][0].avatar,'🐸');
 await a.engine.run();assert.equal(a.mem.profiles.get('chloe').avatar,'🐸');                  // A picks it up
 a.mem.profiles.get('chloe').avatar='🐱';a.mem.profiles.get('chloe').updatedAt=50;            // a stale local edit loses
 await a.engine.run();assert.equal([...server.learners.values()][0].avatar,'🐸');
});

test('offline: nothing is lost and the next pass catches up',async()=>{
 const server=fakeServer(),a=device(server,{rounds:[round('r1')]});
 await a.engine.attachAll();
 a.mem.rounds.set('r2',round('r2'));
 server.setOffline(true);
 await assert.rejects(a.engine.run(),error=>error instanceof HttpError&&error.status===0);
 assert.equal(server.results.size,1);
 server.setOffline(false);
 assert.equal((await a.engine.run()).uploaded,1);assert.equal(server.results.size,2);
});

test('a profile deleted from the account on another device stops syncing here but keeps its local data',async()=>{
 const server=fakeServer(),a=device(server,{rounds:[round('r1')]});
 await a.engine.attachAll();
 const learnerId=[...server.learners.keys()][0];
 await server.api.deleteLearner(learnerId);
 a.mem.rounds.set('r2',round('r2'));
 await a.engine.run();
 assert.equal(server.results.size,0);assert.equal(server.learners.size,0);
 assert.equal(a.mem.rounds.size,2);                            // the device's own copy is untouched
 assert.equal(a.mem.state.links.chloe,undefined);
});

test('a result the server rejects is not retried forever',async()=>{
 const server=fakeServer(),a=device(server,{rounds:[round('big')]});
 a.mem.rounds.get('big').questions=Array.from({length:3},(_,n)=>({templateId:'t'+n,attempts:1,correct:true}));
 server.api.postResults=async list=>({results:list.map(r=>({id:r.id,status:'rejected',reason:'no'}))});
 await a.engine.attachAll();
 assert.equal(a.mem.state.skipped.big,1);
 let posted=0;server.api.postResults=async list=>{posted++;return {results:list.map(r=>({id:r.id,status:'created'}))};};
 await a.engine.run();assert.equal(posted,0);
});

test('unfinished rounds and rounds that cannot be represented are never sent',async()=>{
 const server=fakeServer(),a=device(server,{rounds:[round('open',undefined,{status:'active'}),round('odd',undefined,{questions:[{templateId:'has space',attempts:1,correct:true}]})]});
 await a.engine.attachAll();
 assert.equal(server.results.size,0);
});

test('deleting a profile removes it from the account first',async()=>{
 const server=fakeServer(),a=device(server,{rounds:[round('r1')]});
 await a.engine.attachAll();
 await a.engine.deleteProfile('chloe');
 assert.equal(server.learners.size,0);assert.equal(server.results.size,0);assert.equal(a.mem.state.links.chloe,undefined);
 server.setOffline(true);
 const b=device(server,{rounds:[round('r5','sam')]});b.mem.state.links.sam='22222222-2222-4222-8222-222222222222';
 await assert.rejects(b.engine.deleteProfile('sam'));          // offline: the caller must not delete locally then
});
