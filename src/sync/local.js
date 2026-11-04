import {listRounds,addRounds,deleteRoundsOf} from '../game/storage.js';
import {profilesIn,avatarFor,chooseAvatar,addProfile,profileTime,touchProfile,removeProfile} from '../game/profile.js';

// This device's side of the sync: players from localStorage, rounds from IndexedDB.
export const browserLocal={
 rounds:listRounds,
 async profiles(){
  const rounds=await listRounds();
  return profilesIn(rounds).map(p=>({id:p.id,name:p.name,avatar:avatarFor(p.id)||null,updatedAt:profileTime(p.id)}));
 },
 async upsertProfile({id,name,avatar,updatedAt}){
  addProfile({id,name});chooseAvatar(id,avatar||null,updatedAt);   // keeps the account's timestamp, so the next pass does not push it back
 },
 addRounds,
 async deleteProfile(id){await deleteRoundsOf(id);removeProfile(id);},
 touchProfile,
};
