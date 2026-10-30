// A player's id is their normalised name, so "Chloe" and " chloe " are the same person.
export function playerKey(name){
 const key=String(name).normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-CA');
 if(!key||key.length>40||/[\u0000-\u001f\u007f]/.test(key))throw Error('Enter a name from 1 to 40 characters.');
 return key;
}

// The player whose progress the app shows. Shared by Math quest and the curriculum page; stored only on this device.
const KEY='math-active-profile';
export function chooseProfile(profile){
 try{localStorage.setItem(KEY,profile?JSON.stringify({id:profile.id,name:profile.name}):'none');}catch{}
}
// Players created from the badge menu before they have played a round; rounds alone cannot list them.
const LIST_KEY='math-profiles';
const readList=()=>{try{const list=JSON.parse(localStorage.getItem(LIST_KEY)||'[]');return Array.isArray(list)?list.filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string'):[];}catch{return [];}};
export function addProfile(profile){
 const list=readList().filter(p=>p.id!==profile.id);list.push({id:profile.id,name:profile.name});
 try{localStorage.setItem(LIST_KEY,JSON.stringify(list));}catch{}
}
// Explicit "no profile" wins; otherwise the saved choice, else the most recently played profile (rounds are newest first).
export function activeProfile(rounds){
 let saved;try{saved=localStorage.getItem(KEY);}catch{}
 if(saved==='none')return null;
 try{const profile=saved&&JSON.parse(saved);if(profile&&(rounds.some(r=>r.profileId===profile.id)||readList().some(p=>p.id===profile.id)))return profile;}catch{}
 return rounds[0]?{id:rounds[0].profileId,name:rounds[0].playerName}:null;
}
export function profilesIn(rounds){
 const seen=new Map();for(const r of rounds)if(!seen.has(r.profileId))seen.set(r.profileId,r.playerName);
 for(const p of readList())if(!seen.has(p.id))seen.set(p.id,p.name);
 return [...seen].map(([id,name])=>({id,name}));
}

// Lifetime statistics for one player, from their saved rounds. A round counts once it is complete.
//   perfect: every question solved; won: at least 80% solved; correct: every solved question, finished rounds or not.
export const WIN_ACCURACY=0.8;
export function profileStats(rounds,profileId){
 const mine=rounds.filter(r=>r.profileId===profileId);
 const stats={games:0,won:0,perfect:0,correct:0,attempts:0,questions:0,accuracy:null,lastPlayed:null};
 for(const round of mine){
  let solved=0;
  for(const q of round.questions){if(q.correct){solved++;stats.correct++;}stats.attempts+=q.attempts||0;if(q.attempts||q.correct||q.assisted)stats.questions++;}
  if(round.status==='complete'){
   stats.games++;
   if(solved===round.questions.length)stats.perfect++;
   if(solved/round.questions.length>=WIN_ACCURACY)stats.won++;
  }
  if(!stats.lastPlayed||round.updatedAt>stats.lastPlayed)stats.lastPlayed=round.updatedAt;
 }
 stats.accuracy=stats.questions?stats.correct/stats.questions:null;
 return stats;
}

// 24 emoji choices plus the letter avatar, stored per profile on this device.
export const AVATARS=['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🦌','🐸','🐧','🦉','🦋','🐢','🐙','🦄','🦕','🦖','👽'];
const AVATAR_KEY='math-avatars';
const readAvatars=()=>{try{return JSON.parse(localStorage.getItem(AVATAR_KEY)||'{}')||{};}catch{return {};}};
export const avatarFor=id=>readAvatars()[id]||null;
export function chooseAvatar(id,avatar){const all=readAvatars();if(avatar)all[id]=avatar;else delete all[id];try{localStorage.setItem(AVATAR_KEY,JSON.stringify(all));}catch{}}
