import {API_BASE} from './config.js';
import {createHttp} from './http.js';

// Client for this app's results API. Every call is bounded by a timeout and reports failures as HttpError.
export function createApi({base=API_BASE,fetchImpl,timeoutMs}={}){
 const call=createHttp({base,fetchImpl,timeoutMs});
 return {
  listLearners:()=>call('/me/learners'),
  /** 200 {…learner, applied} | HttpError 409 (body.learner = the profile that already has this name) | 410 deleted on the account. */
  putLearner:(id,learner)=>call(`/learners/${id}`,{method:'PUT',body:learner}),
  deleteLearner:id=>call(`/learners/${id}`,{method:'DELETE'}),
  postResults:results=>call('/results',{method:'POST',body:{results}}),
  listResults:(id,since=0)=>call(`/learners/${id}/results?since=${since}&limit=100`),
  exportAll:()=>call('/export'),
  deleteAccountData:()=>call('/me',{method:'DELETE'}),
 };
}
