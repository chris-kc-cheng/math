import {el} from './dom.js';
import {syncEnabled,getSync,onSync,startSync,login,logout,chooseAttach,accountLearners,deleteProfileEverywhere,accountExport,eraseAccountData,authClient,MESSAGES} from '../sync/index.js';
import {playerKey} from '../game/profile.js';

// The optional account: a small status button in the top-right corner, and a dialog for logging in, choosing what to save,
// managing saved players, and backing up this device. Playing never depends on any of it.
const ICONS={off:'☁',checking:'☁',syncing:'⟳',saved:'☁',offline:'☁',ask:'☁',error:'☁','signed-out':'☁'};
const SHORT={checking:'…',syncing:'Saving…',saved:'Saved',offline:'Offline','signed-out':'Log in',ask:'Choose',error:'Retrying'};
let dialog,body,learners=null,notice='',noticeKind='',busy=false,mode='main',lastFocus,typedId='',lastStatus='';

const field=(label,type,attrs={})=>{
 const wrap=el('label',undefined,'auth-field'),input=el('input');input.type=type;Object.assign(input,attrs);
 wrap.append(el('span',label),input);return [wrap,input];
};
const button=(text,onclick,cls='auth-button')=>{const b=el('button',text,cls);b.type='button';b.onclick=onclick;return b;};
const say=(text,kind='')=>{notice=text;noticeKind=kind;};
const plural=(n,one,many)=>`${n} ${n===1?one:many}`;

function download(name,text,type='application/json'){
 const url=URL.createObjectURL(new Blob([text],{type})),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function guarded(work,done){
 if(busy)return;busy=true;paint();
 try{await work();if(done)say(done,'ok');}catch(error){say(error.message,'bad');}
 busy=false;paint();
}

function loginView(snapshot){
 const view=el('div');
 view.append(el('p','You can play without an account. Log in to save your players and results online, so any device can use them.','auth-note'));
 const form=el('form',undefined,'auth-form'),[idLabel,id]=field('Email or username','text',{autocomplete:'username',required:true,maxLength:254,spellcheck:false,autocapitalize:'none'});
 const [pwLabel,pw]=field('Password','password',{autocomplete:'current-password',required:true,maxLength:128});
 const submit=el('button','Log in','auth-button auth-primary');submit.type='submit';submit.disabled=busy;
 form.append(idLabel,pwLabel,submit);
 id.value=typedId;id.oninput=()=>{typedId=id.value;};
 form.onsubmit=event=>{event.preventDefault();guarded(async()=>{await login(id.value,pw.value);say('','');typedId='';learners=null;});};
 const providers=el('div',undefined,'auth-providers');
 for(const [name,label] of [['google','Continue with Google'],['microsoft','Continue with Microsoft']]){
  const a=el('a',label,'auth-button');a.href=authClient.providerUrl(name);providers.append(a);
 }
 const forgot=button('Forgot password?',()=>{mode='forgot';say('');paint();},'auth-link');
 view.append(form,el('p','or','auth-or'),providers,forgot);
 return view;
}
function forgotView(){
 const form=el('form',undefined,'auth-form'),[label,email]=field('Email address','email',{autocomplete:'email',required:true,maxLength:254});
 const send=el('button','Send reset link','auth-button auth-primary');send.type='submit';send.disabled=busy;
 form.append(el('p','Enter your email and we will send a link to choose a new password.','auth-note'),label,send,button('Back to log in',()=>{mode='main';say('');paint();},'auth-link'));
 form.onsubmit=event=>{event.preventDefault();guarded(()=>authClient.forgotPassword(email.value.trim()),'If that account exists, a reset link has been sent.');};
 return form;
}
function resetView(token){
 const form=el('form',undefined,'auth-form'),[label,pw]=field('New password','password',{autocomplete:'new-password',required:true,minLength:12,maxLength:128});
 const save=el('button','Save new password','auth-button auth-primary');save.type='submit';save.disabled=busy;
 form.append(el('p','Choose a new password: at least 12 characters with upper-case, lower-case and a number.','auth-note'),label,save);
 form.onsubmit=event=>{event.preventDefault();guarded(async()=>{await authClient.resetPassword(token,pw.value);mode='main';getSync().returned.resetToken=null;},'Password changed. You can log in now.');};
 return form;
}

function accountView(snapshot){
 const view=el('div'),who=snapshot.account;
 view.append(el('p',`Signed in as ${who.name||who.email||'your account'}`,'auth-note'));
 const status=el('p',snapshot.message,'auth-status');status.dataset.status=snapshot.status;view.append(status);

 if(snapshot.status==='ask'&&snapshot.pending){
  const p=snapshot.pending,box=el('div',undefined,'auth-ask');
  box.append(el('h3','Save this device’s players and results?'),el('p',`This device has ${plural(p.profiles.length,'player','players')} and ${plural(p.rounds.length,'finished round','finished rounds')} that are not on your account yet. Nothing has been uploaded.`));
  const row=el('div',undefined,'auth-row');
  row.append(button('Save them to my account',()=>guarded(()=>chooseAttach(true)),'auth-button auth-primary'),button('Keep them on this device only',()=>guarded(()=>chooseAttach(false),'Kept on this device. New rounds you play will be saved.')));
  box.append(row);view.append(box);
 }

 const list=el('div',undefined,'auth-learners');view.append(el('h3','Players saved on your account'),list);
 if(!learners)list.append(el('p','Loading…','auth-note'));
 else if(!learners.length)list.append(el('p','No players saved yet.','auth-note'));
 else{
  const ul=el('ul');
  for(const learner of learners){
   const li=el('li');li.append(el('span',learner.name,'auth-learner-name'),el('span',plural(learner.result_count,'saved round','saved rounds'),'auth-muted'));
   const del=button('Delete…',()=>{
    li.textContent='';
    li.append(el('span',`Delete ${learner.name} and all their results from your account and this device? This cannot be undone.`,'auth-warn'),
     button('Delete',()=>guarded(async()=>{await deleteProfileEverywhere(playerKey(learner.name));learners=null;},`${learner.name} was deleted.`),'auth-button auth-danger'),
     button('Cancel',()=>paint()));
    li.querySelector('button')?.focus();
   },'auth-link');
   del.setAttribute('aria-label',`Delete ${learner.name} and their results`);li.append(del);ul.append(li);
  }
  list.append(ul);
 }
 const row=el('div',undefined,'auth-row');
 row.append(
  button('Download my account data',()=>guarded(async()=>download('whack-a-math-account.json',await accountExport()),'Downloaded.')),
  button('Log out',()=>guarded(async()=>{await logout();learners=null;},'Logged out. This device keeps its own copy.'),'auth-button auth-primary'),
 );
 view.append(row);
 const erase=el('details',undefined,'auth-erase'),sum=el('summary','Delete everything saved on my account');
 erase.append(sum,el('p','This removes every player and result stored online for this account. Copies on your devices stay.','auth-note'),
  button('Delete all my online data',()=>guarded(async()=>{await eraseAccountData();learners=null;},'Your online data was deleted.'),'auth-button auth-danger'));
 view.append(erase);
 return view;
}

function paint(){
 if(!body)return;
 const snapshot=getSync();body.textContent='';
 const message=el('p',notice,`auth-message ${noticeKind}`);message.setAttribute('role',noticeKind==='bad'?'alert':'status');
 const returned=snapshot.returned||{};
 if(!notice&&returned.error)message.textContent=returned.error,message.className='auth-message bad',message.setAttribute('role','alert');
 body.append(message);
 if(syncEnabled()){
  if(snapshot.account)body.append(accountView(snapshot));
  else if(returned.resetToken)body.append(resetView(returned.resetToken));
  else body.append(mode==='forgot'?forgotView():loginView(snapshot));
 }
 if(snapshot.account&&!learners&&!busy)accountLearners().then(list=>{learners=list;paint();}).catch(()=>{learners=[];paint();});
}

export function openAccount(){
 if(!dialog){
  dialog=el('dialog',undefined,'auth-dialog');dialog.setAttribute('aria-labelledby','auth-title');
  const head=el('div',undefined,'auth-head'),close=button('×',()=>dialog.close(),'auth-close');close.setAttribute('aria-label','Close');
  const title=el('h2','Your account','');title.id='auth-title';head.append(title,close);
  body=el('div',undefined,'auth-body');dialog.append(head,body);document.body.append(dialog);
  dialog.addEventListener('close',()=>{lastFocus?.focus?.();});
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  onSync(snapshot=>{if(snapshot.status==='saved'&&lastStatus!=='saved')learners=null;lastStatus=snapshot.status;if(dialog.open&&!busy)paint();});
 }
 lastFocus=document.activeElement;mode='main';learners=null;say('');paint();
 if(!dialog.open)dialog.showModal();
 dialog.querySelector('input:not([hidden]),button.auth-primary')?.focus();
}

// The small button beside the player badge: a cloud with a short status word; the full sentence is its label.
export function createAccountButton(){
 const wrap=el('span',undefined,'account-wrap');
 if(syncEnabled()){
  const b=el('button',undefined,'account-button');b.type='button';b.setAttribute('aria-haspopup','dialog');
  const icon=el('span','☁','account-icon'),text=el('span',undefined,'account-text');icon.setAttribute('aria-hidden','true');b.append(icon,text);
  b.onclick=openAccount;
  const live=el('span',undefined,'sr-only');live.setAttribute('role','status');live.setAttribute('aria-live','polite');
  const update=snapshot=>{
   b.dataset.status=snapshot.status;text.textContent=SHORT[snapshot.status]??'';icon.textContent=ICONS[snapshot.status]??'☁';
   const full=MESSAGES[snapshot.status]||'';b.title=full;b.setAttribute('aria-label',`Account. ${full}`);live.textContent=snapshot.status==='checking'||snapshot.status==='syncing'?'':full;
   b.hidden=snapshot.status==='off';
  };
  onSync(update);update(getSync());wrap.append(b,live);
  startSync().then(()=>{const r=getSync().returned;if(r.error||r.resetToken)openAccount();});
 }
 return wrap;
}
