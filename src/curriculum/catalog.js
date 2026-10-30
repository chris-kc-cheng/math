import grade5 from './data/ontario-math-grade-5.json';
import grade8 from './data/ontario-math-grade-8.json';
import questions5 from './data/practice-questions.json';
import questions8 from './data/grade-8-questions.json';
import grade4 from './data/ontario-math-grade-4.json';
import grade6 from './data/ontario-math-grade-6.json';
import grade7 from './data/ontario-math-grade-7.json';
import questions4 from './data/grade-4-questions.json';
import questions6 from './data/grade-6-questions.json';
import questions7 from './data/grade-7-questions.json';

export const catalog=[{...grade4,questions:questions4},{...grade5,questions:questions5},{...grade6,questions:questions6},{...grade7,questions:questions7},{...grade8,questions:questions8}];
export function curriculumForGrade(grade){return catalog.find(item=>item.grade===Number(grade))||catalog.find(item=>item.grade===5);}
