import test from 'node:test';
import assert from 'node:assert/strict';
const store=new Map();
globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,v)};
const {chooseProfile,activeProfile,profilesIn,addProfile,playerKey}=await import('./profile.js');
const rounds=[{profileId:'ava',playerName:'Ava'},{profileId:'sam',playerName:'Sam'},{profileId:'ava',playerName:'Ava'}];
test('defaults to the most recent player, remembers a choice, and honours an explicit no-profile',()=>{
 store.clear();assert.deepEqual(activeProfile(rounds),{id:'ava',name:'Ava'});assert.equal(activeProfile([]),null);
 chooseProfile({id:'sam',name:'Sam'});assert.deepEqual(activeProfile(rounds),{id:'sam',name:'Sam'});
 chooseProfile(null);assert.equal(activeProfile(rounds),null);
 chooseProfile({id:'gone',name:'Gone'});assert.deepEqual(activeProfile(rounds),{id:'ava',name:'Ava'});
 assert.deepEqual(profilesIn(rounds),[{id:'ava',name:'Ava'},{id:'sam',name:'Sam'}]);
});

test('lifetime statistics count games, wins at 80%, perfect games and correct answers',async()=>{
 const {profileStats}=await import('./profile.js');
 const round=(id,solved,total=5,status='complete',updatedAt=1)=>({profileId:id,status,updatedAt,questions:Array.from({length:total},(_,i)=>({correct:i<solved,assisted:i>=solved,attempts:1}))});
 const stats=profileStats([round('a',5),round('a',4),round('a',3),round('a',2,5,'active',9),round('b',5)],'a');
 assert.deepEqual({games:stats.games,won:stats.won,perfect:stats.perfect,correct:stats.correct,attempts:stats.attempts,lastPlayed:stats.lastPlayed},{games:3,won:2,perfect:1,correct:14,attempts:20,lastPlayed:9});
 assert.equal(stats.accuracy,0.7);
 assert.equal(profileStats([],'a').accuracy,null);
});

test('a player added from the badge menu is listed and active before any round exists',()=>{
 store.clear();assert.equal(playerKey('  Chloe '),'chloe');assert.throws(()=>playerKey('   '),/1 to 40/);
 addProfile({id:'chloe',name:'Chloe'});chooseProfile({id:'chloe',name:'Chloe'});
 assert.deepEqual(activeProfile([]),{id:'chloe',name:'Chloe'});
 assert.deepEqual(profilesIn(rounds).map(p=>p.id),['ava','sam','chloe']);
 addProfile({id:'chloe',name:'Chloe'});assert.equal(profilesIn([]).length,1);
});
