import {AUTH_BASE} from './config.js';
import {createHttp,HttpError} from './http.js';

// Client for the shared login service (same calls as the platform's clients/js/sso-auth.js, without its throw-on-timeout gaps).
export function createAuth({base=AUTH_BASE,fetchImpl,timeoutMs,location=globalThis.location}={}){
 const call=createHttp({base,fetchImpl,timeoutMs});
 const here=()=>location.origin+location.pathname;
 return {
  login:(identifier,password)=>call('/login',{method:'POST',body:{email:identifier,password}}),
  logout:()=>call('/logout',{method:'POST'}),
  forgotPassword:email=>call('/forgot-password',{method:'POST',body:{email,return_to:here()}}),
  resetPassword:(token,newPassword)=>call('/reset-password',{method:'POST',body:{token,new_password:newPassword}}),
  providerUrl:(provider,returnTo=here())=>`${base}/${provider}/start?return_to=${encodeURIComponent(returnTo)}`,
  /** The signed-in person, refreshing once if the short-lived access cookie lapsed. null = signed out; throws only when offline. */
  async me(){
   try{return summary(await call('/me'));}
   catch(error){
    if(!(error instanceof HttpError)||error.status!==401)throw error;
    try{await call('/refresh',{method:'POST'});return summary(await call('/me'));}
    catch(second){if(second instanceof HttpError&&second.status===0)throw second;return null;}
   }
  },
 };
}
// Only what the page needs: a stable id to key this device's sync state, and a name to greet.
export const summary=info=>{const user=info?.user;return user&&typeof user.id==='string'?{id:user.id,name:String(user.name||user.email||'').slice(0,80),email:String(user.email||'').slice(0,120)}:null;};

/** Read `?auth_error=` (set by the login service when a Google/Microsoft round trip fails) and `?reset_token=`, and remove them from the address. */
export function takeReturnParams(win=globalThis){
 const url=new URL(win.location.href),error=url.searchParams.get('auth_error'),reset=url.searchParams.get('reset_token');
 if(error===null&&reset===null)return {error:null,resetToken:null};
 url.searchParams.delete('auth_error');url.searchParams.delete('reset_token');
 try{win.history.replaceState(win.history.state,'',url.pathname+url.search+url.hash);}catch{}
 return {error:error?error.slice(0,200):null,resetToken:reset&&reset.length<=2048?reset:null};
}
