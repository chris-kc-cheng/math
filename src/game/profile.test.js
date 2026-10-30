import test from 'node:test';
import assert from 'node:assert/strict';
const store=new Map();
globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,v)};
const {chooseProfile,activeProfile,profilesIn}=await import('./profile.js');
const rounds=[{profileId:'ava',playerName:'Ava'},{profileId:'sam',playerName:'Sam'},{profileId:'ava',playerName:'Ava'}];
test('defaults to the most recent player, remembers a choice, and honours an explicit no-profile',()=>{
 store.clear();assert.deepEqual(activeProfile(rounds),{id:'ava',name:'Ava'});assert.equal(activeProfile([]),null);
 chooseProfile({id:'sam',name:'Sam'});assert.deepEqual(activeProfile(rounds),{id:'sam',name:'Sam'});
 chooseProfile(null);assert.equal(activeProfile(rounds),null);
 chooseProfile({id:'gone',name:'Gone'});assert.deepEqual(activeProfile(rounds),{id:'ava',name:'Ava'});
 assert.deepEqual(profilesIn(rounds),[{id:'ava',name:'Ava'},{id:'sam',name:'Sam'}]);
});
