const DATABASE='little-math-lab-game';
let opening;
export function openGameDatabase(){
 if(!globalThis.indexedDB)return Promise.reject(Error('Local saving is unavailable in this browser.'));
 if(!opening)opening=new Promise((resolve,reject)=>{
  const request=indexedDB.open(DATABASE,1);
  request.onupgradeneeded=()=>{const db=request.result;const rounds=db.createObjectStore('rounds',{keyPath:'id'});rounds.createIndex('updatedAt','updatedAt');};
  request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();opening=undefined;};resolve(db);};
  request.onerror=()=>{opening=undefined;reject(request.error);};
  request.onblocked=()=>{opening=undefined;reject(Error('Close other game tabs to update local storage.'));};
 });
 return opening;
}
export async function listRounds(){
 const db=await openGameDatabase();return new Promise((resolve,reject)=>{
  const tx=db.transaction('rounds','readonly'),request=tx.objectStore('rounds').getAll();
  tx.oncomplete=()=>resolve(request.result.sort((a,b)=>b.updatedAt-a.updatedAt));tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Local reading was interrupted.'));
 });
}
export async function saveRound(round){
 const db=await openGameDatabase();return new Promise((resolve,reject)=>{
  const tx=db.transaction('rounds','readwrite'),store=tx.objectStore('rounds'),request=store.get(round.id);let saved,error;
  request.onsuccess=()=>{
   const existing=request.result;if(existing&&existing.revision!==round.revision){error=Error('This round changed in another tab. Reload to resume its latest progress.');tx.abort();return;}
   saved={...round,revision:round.revision+1,updatedAt:Date.now()};store.put(saved);
  };
  tx.oncomplete=()=>resolve(saved);tx.onerror=()=>reject(error||tx.error);tx.onabort=()=>reject(error||tx.error||Error('Could not save progress.'));
 });
}
// Rounds that arrive from the account: added only when the id is new, stored exactly as given.
export async function addRounds(rounds){
 if(!rounds.length)return 0;
 const db=await openGameDatabase();return new Promise((resolve,reject)=>{
  const tx=db.transaction('rounds','readwrite'),store=tx.objectStore('rounds');let added=0;
  for(const round of rounds){const request=store.add(round);request.onsuccess=()=>{added++;};request.onerror=event=>{event.preventDefault();};}  // an existing id is simply kept
  tx.oncomplete=()=>resolve(added);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Could not save the rounds.'));
 });
}
export async function deleteRoundsOf(profileId){
 const db=await openGameDatabase();return new Promise((resolve,reject)=>{
  const tx=db.transaction('rounds','readwrite'),store=tx.objectStore('rounds'),request=store.getAll();
  request.onsuccess=()=>{for(const round of request.result)if(round.profileId===profileId)store.delete(round.id);};
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Could not delete the rounds.'));
 });
}
