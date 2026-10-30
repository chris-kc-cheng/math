import grade5 from './data/ontario-math-grade-5.json' with {type:'json'};
import grade8 from './data/ontario-math-grade-8.json' with {type:'json'};
import questions5 from './data/practice-questions.json' with {type:'json'};
import questions8 from './data/grade-8-questions.json' with {type:'json'};
import grade4 from './data/ontario-math-grade-4.json' with {type:'json'};
import grade6 from './data/ontario-math-grade-6.json' with {type:'json'};
import grade7 from './data/ontario-math-grade-7.json' with {type:'json'};
import questions4 from './data/grade-4-questions.json' with {type:'json'};
import questions6 from './data/grade-6-questions.json' with {type:'json'};
import questions7 from './data/grade-7-questions.json' with {type:'json'};
import grade1 from './data/ontario-math-grade-1.json' with {type:'json'};
import grade2 from './data/ontario-math-grade-2.json' with {type:'json'};
import grade3 from './data/ontario-math-grade-3.json' with {type:'json'};
import questions1 from './data/grade-1-questions.json' with {type:'json'};
import questions2 from './data/grade-2-questions.json' with {type:'json'};
import questions3 from './data/grade-3-questions.json' with {type:'json'};
import grade9 from './data/ontario-math-grade-9.json' with {type:'json'};
import grade10 from './data/ontario-math-grade-10.json' with {type:'json'};
import questions9 from './data/grade-9-questions.json' with {type:'json'};
import questions10 from './data/grade-10-questions.json' with {type:'json'};

export const catalog=[{...grade1,questions:questions1},{...grade2,questions:questions2},{...grade3,questions:questions3},{...grade4,questions:questions4},{...grade5,questions:questions5},{...grade6,questions:questions6},{...grade7,questions:questions7},{...grade8,questions:questions8},{...grade9,questions:questions9},{...grade10,questions:questions10}];
export function curriculumForGrade(grade){return catalog.find(item=>item.grade===Number(grade))||catalog.find(item=>item.grade===5);}
