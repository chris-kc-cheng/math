import {isFinished} from './result.js';

// A file the person can keep: this device's players, avatars and rounds. It is how local data moves to another browser or to a new
// address (browser storage belongs to one address, and the app moved from GitHub Pages to its own domain).
export const BACKUP_FORMAT='whack-a-math-device-1';
const MAX_BYTES=20*1024*1024,MAX_ROUNDS=20000;
const TOKEN=/^[0-9a-zA-Z._:-]{1,80}$/;

export function buildBackup({profiles,rounds,now=Date.now()}){
 return {format:BACKUP_FORMAT,exportedAt:now,profiles:profiles.map(p=>({id:p.id,name:p.name,avatar:p.avatar||null})),rounds:rounds.filter(r=>!r.remote)};
}

/** Parse and bound a backup file. Throws an Error with a message fit to show the person. */
export function parseBackup(text){
 if(typeof text!=='string'||text.length>MAX_BYTES)throw Error('This file is too large to be a backup.');
 let data;try{data=JSON.parse(text);}catch{throw Error('This is not a Whack-a-Math backup file.');}
 if(!data||data.format!==BACKUP_FORMAT||!Array.isArray(data.profiles)||!Array.isArray(data.rounds))throw Error('This is not a Whack-a-Math backup file.');
 if(data.rounds.length>MAX_ROUNDS||data.profiles.length>200)throw Error('This backup holds more than the app can import.');
 const profiles=data.profiles.filter(p=>p&&typeof p.id==='string'&&p.id.length>=1&&p.id.length<=40&&typeof p.name==='string'&&p.name.length>=1&&p.name.length<=40)
  .map(p=>({id:p.id,name:p.name,avatar:typeof p.avatar==='string'&&p.avatar.length<=8?p.avatar:null}));
 const known=new Set(profiles.map(p=>p.id));
 const rounds=data.rounds.filter(r=>r&&typeof r.id==='string'&&TOKEN.test(r.id)&&typeof r.profileId==='string'&&known.has(r.profileId)&&typeof r.playerName==='string'
  &&Number.isSafeInteger(r.grade)&&Array.isArray(r.questions)&&r.questions.length<=50&&r.questions.every(q=>q&&typeof q.templateId==='string'));
 return {profiles,rounds,skipped:data.rounds.length-rounds.length};
}

export async function importBackup(text,{local}){
 const {profiles,rounds,skipped}=parseBackup(text);
 const have=new Set((await local.rounds()).map(r=>r.id));
 const fresh=rounds.filter(r=>!have.has(r.id)).map(({remote,...round})=>round);
 const present=new Set((await local.profiles()).map(p=>p.id));   // players already on this device keep their own name and avatar
 for(const p of profiles)if(!present.has(p.id))await local.upsertProfile({...p,updatedAt:Date.now()});
 const added=await local.addRounds(fresh);
 return {profiles:profiles.length,rounds:added,skipped,finished:fresh.filter(isFinished).length};
}
