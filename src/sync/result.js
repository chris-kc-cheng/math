// Conversion between a finished local round (IndexedDB) and the minimal result stored on the account.
// Stored: ids, grade, topic ids, difficulty, counts, timestamps, and per question the template id with right/wrong and tries.
// Never stored: the learner's typed answers, the generated numbers, the device, the address.
const TOKEN=/^[A-Za-z0-9._:-]{1,80}$/,TOPIC=/^[A-Za-z0-9._:-]{1,40}$/;
const DAY=24*3600*1000,LEVELS=new Set(['simple','medium','hard','auto']);
const clamp=(n,lo,hi)=>Math.min(hi,Math.max(lo,Math.trunc(Number(n))||0));

export const isFinished=round=>Boolean(round&&round.status==='complete'&&Array.isArray(round.questions)&&round.questions.length>=1&&round.questions.length<=50);

export function roundTopicIds(round){
 const list=Array.isArray(round.topics)?round.topics:round.strand?[round.strand]:[];
 return list.filter(t=>typeof t==='string'&&TOPIC.test(t)).slice(0,20);
}

/** Returns the API shape for a finished round, or null when it cannot be sent (so it is never retried). */
export function toResult(round,learnerId){
 if(!isFinished(round)||typeof round.id!=='string'||!(round.grade>=1&&round.grade<=10))return null;
 if(!round.questions.every(q=>TOKEN.test(String(q.templateId))))return null;
 const startedAt=clamp(round.createdAt,0,4e12),finishedAt=Math.max(startedAt,clamp(round.updatedAt,0,4e12));
 const items=round.questions.map(q=>({template_id:q.templateId,correct:Boolean(q.correct),attempts:clamp(q.attempts,0,50),time_ms:null}));
 return {
  id:round.id,learner_id:learnerId,grade:round.grade,topics:roundTopicIds(round),
  difficulty:LEVELS.has(round.difficulty)?round.difficulty:'auto',questions:items.length,correct:items.filter(i=>i.correct).length,
  // Wall-clock time from the first to the last answer; it includes pauses if the round was resumed later.
  time_spent_ms:Math.min(finishedAt-startedAt,DAY),started_at:startedAt,finished_at:finishedAt,items,
 };
}

/** A completed round rebuilt from the account's copy, so statistics and progress work on a new device. It carries no question values. */
export function toRound(result,profile){
 return {
  id:result.id,version:1,revision:0,grade:result.grade,topics:result.topics||[],difficulty:result.difficulty,
  createdAt:result.started_at,updatedAt:result.finished_at,index:result.items.length-1,status:'complete',remote:true,
  profileId:profile.id,playerName:profile.name,
  questions:result.items.map(i=>({templateId:i.template_id,values:{},attempts:i.attempts,correct:i.correct,assisted:!i.correct,entry:''})),
 };
}
