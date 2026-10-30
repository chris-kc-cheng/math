// The player whose progress the app shows. Shared by Math quest and the curriculum page; stored only on this device.
const KEY='math-active-profile';
export function chooseProfile(profile){
 try{localStorage.setItem(KEY,profile?JSON.stringify({id:profile.id,name:profile.name}):'none');}catch{}
}
// Explicit "no profile" wins; otherwise the saved choice, else the most recently played profile (rounds are newest first).
export function activeProfile(rounds){
 let saved;try{saved=localStorage.getItem(KEY);}catch{}
 if(saved==='none')return null;
 try{const profile=saved&&JSON.parse(saved);if(profile&&rounds.some(r=>r.profileId===profile.id))return profile;}catch{}
 return rounds[0]?{id:rounds[0].profileId,name:rounds[0].playerName}:null;
}
export function profilesIn(rounds){
 const seen=new Map();for(const r of rounds)if(!seen.has(r.profileId))seen.set(r.profileId,r.playerName);
 return [...seen].map(([id,name])=>({id,name}));
}
