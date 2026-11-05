// Small fetch wrapper shared by the login and results clients: cookies included, the CSRF header on every call, and a hard
// timeout so a slow or absent server can never block the app.
export class HttpError extends Error{
 constructor(message,status,body){super(message);this.status=status;this.body=body;}
}
// status 0 = the network (or the timeout) failed; anything else is an HTTP answer from the server.
export const isOffline=error=>error instanceof HttpError&&error.status===0;

export function createHttp({base,fetchImpl=globalThis.fetch,timeoutMs=8000}){
 return async function call(path,{method='GET',body,signal}={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  signal?.addEventListener('abort',()=>controller.abort(),{once:true});
  let response;
  try{
   response=await fetchImpl(base+path,{
    method,credentials:'include',signal:controller.signal,cache:'no-store',
    headers:{'X-Auth-Request':'1',...(body!==undefined?{'Content-Type':'application/json'}:{})},
    body:body!==undefined?JSON.stringify(body):undefined,
   });
  }catch{throw new HttpError('Could not reach the server.',0);}
  finally{clearTimeout(timer);}
  const text=response.status===204?'':await response.text().catch(()=>'');
  let data=null;try{data=text?JSON.parse(text):null;}catch{}
  if(!response.ok){
   const detail=typeof data?.detail==='string'?data.detail:Array.isArray(data?.detail)?'Please check what you typed.':response.statusText||'Something went wrong.';
   const error=new HttpError(detail,response.status,data);error.retryAfter=Number(response.headers?.get?.('Retry-After'))||0;throw error;
  }
  return data;
 };
}
