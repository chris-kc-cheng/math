import test from 'node:test';
import assert from 'node:assert/strict';
import {toResult,toRound,isFinished} from './result.js';
import {createHttp,HttpError,isOffline} from './http.js';
import {createAuth,summary,takeReturnParams} from './auth.js';
import {createState,rememberAccount,lastAccount} from './state.js';
import {syncAvailable} from './config.js';
import {curriculumForGrade} from '../curriculum/catalog.js';

const round={id:'7f3c2a10-0000-4000-8000-000000000001',grade:5,topics:['B2','B1.3'],difficulty:'medium',createdAt:1_800_000_000_000,updatedAt:1_800_000_120_000,status:'complete',profileId:'chloe',playerName:'Chloe',
 questions:[{templateId:'g5-b2-1',values:{a:12},attempts:1,correct:true,assisted:false,entry:'secret typed text'},{templateId:'g5-b2-2',values:{a:9},attempts:3,correct:false,assisted:true,entry:'4'}]};

test('a result keeps only ids, counts, timestamps and right/wrong per question',()=>{
 const out=toResult(round,'learner-1');
 assert.deepEqual(Object.keys(out).sort(),['correct','difficulty','finished_at','grade','id','items','learner_id','questions','started_at','time_spent_ms','topics']);
 assert.deepEqual(out.items,[{template_id:'g5-b2-1',correct:true,attempts:1,time_ms:null},{template_id:'g5-b2-2',correct:false,attempts:3,time_ms:null}]);
 assert.equal(out.correct,1);assert.equal(out.questions,2);assert.equal(out.time_spent_ms,120_000);
 const text=JSON.stringify(out);
 assert.ok(!text.includes('secret typed text')&&!text.includes('Chloe')&&!text.includes('values'));
});
test('unfinished or malformed rounds produce no result',()=>{
 assert.equal(toResult({...round,status:'active'},'x'),null);
 assert.equal(toResult({...round,grade:11},'x'),null);
 assert.equal(toResult({...round,questions:[{templateId:'bad id'}]},'x'),null);
 assert.equal(toResult({...round,questions:[]},'x'),null);
 assert.equal(isFinished(round),true);
});
test('legacy rounds with a strand and rounds with odd fields are normalised',()=>{
 const out=toResult({...round,topics:undefined,strand:'B',difficulty:undefined,updatedAt:1,createdAt:5},'x');
 assert.deepEqual(out.topics,['B']);assert.equal(out.difficulty,'auto');assert.equal(out.finished_at,out.started_at);assert.equal(out.time_spent_ms,0);
 assert.equal(toResult({...round,createdAt:0,updatedAt:1e12},'x').time_spent_ms,24*3600*1000);
});
test('every template in the catalogue fits the id rule the server enforces',()=>{
 for(let grade=1;grade<=10;grade++){
  const catalog=curriculumForGrade(grade);
  for(const q of catalog.questions)assert.match(q.id,/^[A-Za-z0-9._:-]{1,80}$/,`grade ${grade}: ${q.id}`);
 }
});
test('a pulled result becomes a finished local round that statistics can use',()=>{
 const wire=toResult(round,'learner-1');
 const back=toRound(wire,{id:'chloe',name:'Chloe'});
 assert.equal(back.status,'complete');assert.equal(back.remote,true);assert.equal(back.profileId,'chloe');assert.equal(back.grade,5);
 assert.deepEqual(back.questions.map(q=>[q.correct,q.assisted]),[[true,false],[false,true]]);
});

test('http: sends cookies and the CSRF header, parses errors, and never hangs',async()=>{
 let seen;
 const call=createHttp({base:'https://x.test',fetchImpl:async(url,init)=>{seen={url,init};return new Response(JSON.stringify({detail:'Invalid email or password'}),{status:401});}});
 await assert.rejects(call('/login',{method:'POST',body:{a:1}}),e=>e.status===401&&e.message==='Invalid email or password');
 assert.equal(seen.init.credentials,'include');assert.equal(seen.init.headers['X-Auth-Request'],'1');assert.equal(seen.init.headers['Content-Type'],'application/json');
 const slow=createHttp({base:'https://x.test',timeoutMs:20,fetchImpl:(_u,init)=>new Promise((_,reject)=>init.signal.addEventListener('abort',()=>reject(new Error('aborted'))))});
 await assert.rejects(slow('/me'),e=>isOffline(e));
 const down=createHttp({base:'https://x.test',fetchImpl:async()=>{throw new TypeError('fetch failed');}});
 await assert.rejects(down('/me'),e=>isOffline(e));
 const empty=createHttp({base:'https://x.test',fetchImpl:async()=>new Response(null,{status:204})});
 assert.equal(await empty('/logout',{method:'POST'}),null);
 const limited=createHttp({base:'https://x.test',fetchImpl:async()=>new Response('{"detail":"Too many failed sign-in attempts."}',{status:429,headers:{'Retry-After':'300'}})});
 await assert.rejects(limited('/login'),e=>e.status===429&&e.retryAfter===300&&/Too many/.test(e.message));
});

test('auth: me() refreshes once on 401, returns null when signed out, throws only when offline',async()=>{
 const log=[];
 const user={user:{id:'u1',name:'Pat',email:'pat@example.test'}};
 const make=script=>createAuth({base:'https://auth.test',location:{origin:'https://math.test',pathname:'/game.html'},fetchImpl:async(url,init)=>{
  const path=new URL(url).pathname;log.push(`${init.method} ${path}`);return script(path);}});
 const res=(status,body)=>new Response(body?JSON.stringify(body):null,{status});
 assert.deepEqual(await make(()=>res(200,user)).me(),{id:'u1',name:'Pat',email:'pat@example.test'});
 let n=0;
 assert.equal((await make(path=>path==='/me'?(n++?res(200,user):res(401,{detail:'x'})):res(200,{})).me()).id,'u1');
 assert.ok(log.includes('POST /refresh'));
 assert.equal(await make(()=>res(401,{detail:'x'})).me(),null);
 await assert.rejects(make(()=>{throw new TypeError('offline');}).me(),e=>isOffline(e));
 assert.equal(make(()=>res(200,{})).providerUrl('google'),'https://auth.test/google/start?return_to='+encodeURIComponent('https://math.test/game.html'));
});

test('auth return parameters are read once and removed from the address',()=>{
 const win={location:{href:'https://math.test/game.html?auth_error=Account%20not%20enabled&x=1&reset_token=abc'},history:{state:null,replaceState(_s,_t,url){this.last=url;}}};
 const out=takeReturnParams(win);
 assert.deepEqual(out,{error:'Account not enabled',resetToken:'abc'});assert.equal(win.history.last,'/game.html?x=1');
 const none={location:{href:'https://math.test/'},history:{replaceState(){throw Error('should not touch history');}}};
 assert.deepEqual(takeReturnParams(none),{error:null,resetToken:null});
 assert.equal(summary({user:{}}),null);
});

test('sync state is stored per account and the last account is remembered',()=>{
 const mem=new Map(),storage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k)};
 const a=createState('u1',storage),b=createState('u2',storage);
 const s=a.load();s.links.chloe='x';a.save(s);
 assert.equal(a.load().links.chloe,'x');assert.deepEqual(b.load().links,{});
 mem.set('math-sync:u1','{broken');assert.deepEqual(a.load().links,{});
 rememberAccount({id:'u1',name:'Pat'},storage);assert.equal(lastAccount(storage).id,'u1');rememberAccount(null,storage);assert.equal(lastAccount(storage),null);
});

test('account features appear only on the shared domain',()=>{
 assert.equal(syncAvailable('math.hedgies.cloud'),true);
 for(const host of ['localhost','127.0.0.1','chris-kc-cheng.github.io','evilhedgies.cloud','hedgies.cloud.evil.test'])assert.equal(syncAvailable(host),false,host);
});

test('the login user becomes the player: name from the account, trimmed and bounded',async()=>{
 globalThis.localStorage??={getItem:()=>null,setItem(){},removeItem(){}};
 const {ownName}=await import('./index.js');
 assert.equal(ownName({name:'  Pat   Parent ',email:'pat@example.test'}),'Pat Parent');
 assert.equal(ownName({name:'',email:'chloe-mum@example.test'}),'chloe-mum');
 assert.equal(ownName({name:'x'.repeat(80),email:'a@b.c'}).length,40);
 assert.equal(ownName({name:'',email:''}),'Me');
});
