// Visual demos reuse the same bounded templates and teaching rules as the curriculum.
import grade3 from '../curriculum/data/grade-3-questions.json' with {type:'json'};
import grade6 from '../curriculum/data/grade-6-questions.json' with {type:'json'};
import grade8 from '../curriculum/data/grade-8-questions.json' with {type:'json'};
const pick=(questions,id)=>{const q=questions.find(q=>q.id===id);if(!q)throw Error(`Missing demo activity ${id}`);return {...q};};
export const visualExamples=[
 {topic:'Clock reading',template:pick(grade3,'g3-question-e2-6-1')},
 {topic:'Pythagoras’ theorem',template:{...pick(grade8,'g8-question-e2-4'),demoVisual:{type:'right-triangle',a:3,b:4,caption:'A right triangle: perpendicular legs 3 and 4; hypotenuse c is unknown'}}},
 {topic:'Read a chart',template:pick(grade3,'g3-question-d1-3-1')},
 {topic:'Calculator keys',template:{...pick(grade6,'g6-more-percent-story-b2-3'),calculatorDemo:true}},
 {topic:'Scientific notation',template:pick(grade8,'g8-question-b1-1')}
];
