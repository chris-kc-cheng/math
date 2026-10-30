import data from './data/ontario-math-grade-5.json' with {type:'json'};

// Shared curriculum content; views keep presentation and learner progress separate.
export const {schemaVersion,curriculum,sources,suggestedSequence,activities}=data;
export function activitiesForSkill(skillId){
 return activities.filter(activity=>activity.skillIds.includes(skillId));
}
