import {syncAvailable} from './config.js';
import {createAuth,takeReturnParams} from './auth.js';
import {createApi} from './api.js';
import {HttpError,isOffline} from './http.js';
import {createEngine} from './engine.js';
import {createState,rememberAccount,lastAccount} from './state.js';
import {browserLocal} from './local.js';

// The optional account: signing in saves this device's players and results to the person's account and loads them on any device.
// Nothing here is required to play. A failed or slow call only changes the status text; the app keeps working from this device.
export const MESSAGES={
 off:'',
 checking:'Checking your account…',
 'signed-out':'Log in to save results to your account',
 syncing:'Saving to your account…',
 saved:'Saved to your account',
 offline:'Will save when you are online',
 ask:'Choose what to save to your account',
 error:'Could not save just now. It will try again.',
};

const auth=createAuth(),api=createApi();
let snapshot={status:'off',message:MESSAGES.off,account:null,pending:null,returned:{error:null,resetToken:null}};
let engine=null,running=false,again=false,timer=null,started=false;
const listeners=new Set();

export const syncEnabled=()=>syncAvailable();
export const getSync=()=>snapshot;
export function onSync(listener){listeners.add(listener);return ()=>listeners.delete(listener);}
export const authClient=auth;
function set(patch){snapshot={...snapshot,...patch};snapshot.message=patch.message??MESSAGES[snapshot.status]??'';for(const fn of listeners)fn(snapshot);}

function useAccount(account){
 rememberAccount(account);
 engine=account?createEngine({api,local:browserLocal,store:createState(account.id)}):null;
 set({account,pending:null});
}

export function requestSync(delay=1500){
 if(!engine)return;
 clearTimeout(timer);timer=setTimeout(runSync,delay);
}

async function runSync(){
 if(!engine)return;
 if(running){again=true;return;}
 running=true;set({status:'syncing'});
 try{
  const before=(await browserLocal.profiles()).length;
  const result=await engine.run();
  const after=(await browserLocal.profiles()).length;
  if(result.status==='ask')set({status:'ask',pending:result.pending});
  else set({status:'saved',pending:null});
  if(result.downloaded||after!==before)document.dispatchEvent(new CustomEvent('math-rounds-changed'));
 }catch(error){
  if(isOffline(error))set({status:'offline'});
  else if(error instanceof HttpError&&error.status===401){
   // The access cookie lapsed or the person logged out elsewhere: check once, and fall back to signed out.
   const me=await auth.me().catch(()=>undefined);
   if(me===undefined)set({status:'offline'});
   else if(me===null){useAccount(null);set({status:'signed-out'});}
   else requestSync(500);
  }else{
   set({status:'error'});
   requestSync(Math.max(60,error?.retryAfter||0)*1000);
  }
 }finally{
  running=false;
  if(again){again=false;requestSync(500);}
 }
}

export async function startSync(){
 if(started||typeof document==='undefined'||!syncAvailable())return;
 started=true;
 const returned=takeReturnParams();set({status:'checking',returned});
 try{
  const me=await auth.me();
  if(me){useAccount(me);requestSync(0);}else set({status:'signed-out'});
 }catch{
  const last=lastAccount();
  if(last){useAccount(last);set({status:'offline'});}else set({status:'signed-out'});
 }
 for(const type of ['math-rounds-changed','math-profile-change'])document.addEventListener(type,()=>requestSync(2000));
 addEventListener('online',()=>requestSync(500));
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')requestSync(1000);});
 setInterval(()=>{if(document.visibilityState==='visible')requestSync(0);},5*60*1000);
}

export async function login(identifier,password){
 try{await auth.login(identifier.trim(),password);}
 catch(error){throw friendly(error);}
 let me;try{me=await auth.me();}catch(error){throw friendly(error);}
 if(!me)throw Error('Signed in, but the session was not kept. Check that cookies are allowed for this site.');
 useAccount(me);await runSync();return me;
}

export async function logout(){
 try{await auth.logout();}catch(error){if(!isOffline(error)&&!(error instanceof HttpError&&error.status===401))throw friendly(error);}
 useAccount(null);set({status:'signed-out'});
}

export async function chooseAttach(save){
 if(!engine)return;
 running=true;set({status:'syncing'});
 try{
  const result=save?await engine.attachAll():await engine.keepLocalOnly();
  set({status:result.status==='ask'?'ask':'saved',pending:null});
  document.dispatchEvent(new CustomEvent('math-rounds-changed'));
 }catch(error){set({status:isOffline(error)?'offline':'error'});throw friendly(error);}
 finally{running=false;}
}

/** What the account holds (profiles and counts), for the account panel. */
export async function accountLearners(){return api.listLearners().then(r=>r.learners);}

/** Delete a profile and all its results from the account and from this device. */
export async function deleteProfileEverywhere(profileId){
 if(engine)try{await engine.deleteProfile(profileId);}catch(error){throw friendly(error,'Could not delete from your account. Check your connection and try again.');}
 await browserLocal.deleteProfile(profileId);
 document.dispatchEvent(new CustomEvent('math-rounds-changed'));
}

/** The account's data as a JSON file download. */
export async function accountExport(){
 try{return JSON.stringify(await api.exportAll(),null,1);}catch(error){throw friendly(error);}
}

/** Erase everything the account holds (profiles, results). This device's own copy stays. */
export async function eraseAccountData(){
 try{await api.deleteAccountData();}catch(error){throw friendly(error);}
 const state=createState(snapshot.account.id);state.forget();
 useAccount(snapshot.account);set({status:'ask'});requestSync(0);
}

function friendly(error,fallback='Something went wrong. Please try again.'){
 if(isOffline(error))return Error('Could not reach the server. You can keep playing; try again when you are online.');
 if(error instanceof HttpError&&error.status>=400&&error.status<500&&error.message)return Error(error.message);
 return Error(fallback);
}
