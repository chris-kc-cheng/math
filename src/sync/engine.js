import {HttpError} from './http.js';
import {isFinished,toResult,toRound} from './result.js';

// The sync algorithm, independent of the browser: `api` talks to the server, `local` to this device's profiles and rounds,
// `store` to the remembered per-account state. Every step is safe to repeat (ids are client UUIDs, the server ignores duplicates).
//
//   1. read the account's profiles; adopt a same-named local profile instead of duplicating it; copy new ones to this device
//   2. if this device has data that was never attached, stop and ask (the person chooses; see attachAll / keepLocalOnly)
//   3. push local profiles that are new or newer (last write wins by updatedAt), then push finished rounds in batches
//   4. pull every profile's results after the saved cursor and add the ones this device does not have
const BATCH=25;
const keyOf=name=>String(name).normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-CA');

export function createEngine({api,local,store,uuid=()=>crypto.randomUUID(),now=()=>Date.now()}){

 // What could be attached: profiles with no account profile yet and finished rounds that were never uploaded or declined.
 async function pending(state){
  const profiles=(await local.profiles()).filter(p=>!state.links[p.id]&&!state.skipped[p.id]&&!state.detached[p.id]);
  const rounds=(await local.rounds()).filter(r=>isFinished(r)&&!r.remote&&!state.pushed[r.id]&&!state.skipped[r.id]);
  return {profiles,rounds,count:profiles.length+rounds.length};
 }

 function unlink(state,profileId,rounds){
  delete state.links[profileId];state.detached[profileId]=1;
  for(const r of rounds)if(r.profileId===profileId)state.skipped[r.id]=1;
 }

 async function pullProfiles(state,learners,deleted){
  const locals=new Map((await local.profiles()).map(p=>[p.id,p]));
  const rounds=deleted.length?await local.rounds():[];
  for(const [profileId,uuidValue] of Object.entries(state.links))if(deleted.includes(uuidValue))unlink(state,profileId,rounds);
  for(const learner of learners){
   const id=keyOf(learner.name);if(!id)continue;
   const mine=locals.get(id);
   state.links[id]=learner.id;delete state.skipped[id];delete state.detached[id];
   if(!mine||learner.updated_at>mine.updatedAt)await local.upsertProfile({id,name:learner.name,avatar:learner.avatar,updatedAt:learner.updated_at});
  }
 }

 async function pushProfiles(state,learners){
  const byId=new Map(learners.map(l=>[l.id,l]));
  const newRounds=new Set((await local.rounds()).filter(r=>isFinished(r)&&!r.remote&&!state.pushed[r.id]&&!state.skipped[r.id]).map(r=>r.profileId));
  for(const p of await local.profiles()){
   if(state.detached[p.id])continue;                                    // deleted on the account: only the person re-adding it brings it back
   if(state.skipped[p.id]&&!newRounds.has(p.id))continue;                // declined: stays here until there is new play to save
   const linked=state.links[p.id]||(state.links[p.id]=uuid()),known=byId.get(linked);
   if(known&&p.updatedAt<=known.updated_at)continue;
   const updatedAt=p.updatedAt||now();
   try{
    const saved=await api.putLearner(linked,{name:p.name,avatar:p.avatar||null,updated_at:Math.min(updatedAt,now())});
    if(saved.applied===false)await local.upsertProfile({id:p.id,name:saved.name,avatar:saved.avatar,updatedAt:saved.updated_at});
   }catch(error){
    if(!(error instanceof HttpError))throw error;
    if(error.status===409&&error.body?.learner)state.links[p.id]=error.body.learner.id;   // the account already has this name
    else if(error.status===410)unlink(state,p.id,await local.rounds());                  // deleted on the account from another device
    else if(error.status===422||error.status===409)state.skipped[p.id]=1;                // cannot be stored; never retry blindly
    else throw error;
   }
  }
 }

 async function pushRounds(state){
  const rounds=(await local.rounds()).filter(r=>isFinished(r)&&!r.remote&&!state.pushed[r.id]&&!state.skipped[r.id]&&state.links[r.profileId]);
  let sent=0;
  for(let i=0;i<rounds.length;i+=BATCH){
   const batch=[],byId=new Map();
   for(const round of rounds.slice(i,i+BATCH)){
    const body=toResult(round,state.links[round.profileId]);
    if(!body){state.skipped[round.id]=1;continue;}      // cannot be represented: do not retry forever
    batch.push(body);byId.set(round.id,round);
   }
   if(!batch.length)continue;
   const {results}=await api.postResults(batch);
   for(const r of results){
    const round=byId.get(r.id);if(!round)continue;
    if(r.status==='created'||r.status==='duplicate'){state.pushed[r.id]=1;sent+=r.status==='created'?1:0;}
    else if(r.status==='rejected')state.skipped[r.id]=1;             // the server will never accept it as it is
    else if(r.status==='gone')unlink(state,round.profileId,rounds);
    // unknown_learner: the profile is not on the account yet; the next run pushes the profile first
   }
  }
  return sent;
 }

 async function pullResults(state){
  let added=0;
  const profiles=new Map((await local.profiles()).map(p=>[p.id,p]));
  for(const [profileId,learnerId] of Object.entries(state.links)){
   const profile=profiles.get(profileId);if(!profile)continue;
   let cursor=state.cursors[learnerId]||0;
   for(let guard=0;guard<200;guard++){
    let page;
    try{page=await api.listResults(learnerId,cursor);}
    catch(error){if(error instanceof HttpError&&error.status===404){delete state.links[profileId];break;}throw error;}
    const known=new Set((await local.rounds()).map(r=>r.id)),fresh=page.results.filter(r=>!known.has(r.id));
    if(fresh.length){await local.addRounds(fresh.map(r=>toRound(r,profile)));added+=fresh.length;}
    for(const r of page.results)state.pushed[r.id]=1;
    cursor=page.next;state.cursors[learnerId]=cursor;
    if(!page.has_more)break;
   }
  }
  return added;
 }

 /** One full pass. Resolves {status:'saved'|'ask', pending?} or throws HttpError (status 0 = offline). */
 async function run(){
   const state=store.load();
   try{
    const {learners,deleted}=await api.listLearners();
    await pullProfiles(state,learners,deleted);
    if(state.attach==='ask'){
     const waiting=await pending(state);
     if(waiting.count)return {status:'ask',pending:waiting};
     state.attach='done';
    }
    await pushProfiles(state,learners);
    const uploaded=await pushRounds(state);
    const downloaded=await pullResults(state);
    return {status:'saved',uploaded,downloaded};
   }finally{store.save(state);}
 }

 return {
  pending:()=>pending(store.load()),run,
  /** The person chose to save this device's existing players and results to the account. */
  async attachAll(){const state=store.load();state.attach='done';store.save(state);return run();},
  /** The person chose to keep what is on this device here: it is never uploaded; new play from now on is. */
  async keepLocalOnly(){
   const state=store.load(),waiting=await pending(state);
   for(const p of waiting.profiles)state.skipped[p.id]=1;
   for(const r of waiting.rounds)state.skipped[r.id]=1;
   state.attach='done';store.save(state);return run();
  },
  /** Delete a profile from the account first (so nothing lingers online); the caller then removes it from this device. */
  async deleteProfile(profileId){
   const state=store.load(),linked=state.links[profileId];
   if(linked){
    try{await api.deleteLearner(linked);}catch(error){if(!(error instanceof HttpError&&error.status===404))throw error;}
    delete state.links[profileId];delete state.cursors[linked];
   }
   store.save(state);
  },
 };
}
