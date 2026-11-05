// What this device remembers about one account's sync, kept in localStorage under the account id.
// It holds ids only: which local profile is which profile on the account, which results already went up, and the pull cursors.
const PREFIX='math-sync:';
export const emptyState=()=>({v:1,attach:'ask',links:{},pushed:{},skipped:{},detached:{},cursors:{}});

export function createState(accountId,storage=globalThis.localStorage){
 const key=PREFIX+accountId;
 return {
  load(){
   try{const raw=JSON.parse(storage.getItem(key)||'null');if(raw&&raw.v===1)return {...emptyState(),...raw};}catch{}
   return emptyState();
  },
  save(state){try{storage.setItem(key,JSON.stringify(state));}catch{}},
  forget(){try{storage.removeItem(key);}catch{}},
 };
}
// The account last used on this device, so the page can say "Will save when you are online" without reaching the login service.
const LAST='math-sync-last-account';
export const rememberAccount=(account,storage=globalThis.localStorage)=>{try{account?storage.setItem(LAST,JSON.stringify(account)):storage.removeItem(LAST);}catch{}};
export const lastAccount=(storage=globalThis.localStorage)=>{try{const v=JSON.parse(storage.getItem(LAST)||'null');return v&&typeof v.id==='string'?v:null;}catch{return null;}};
