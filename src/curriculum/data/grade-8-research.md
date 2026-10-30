# Grade 8 curriculum research

Checked 2026-10-29. The curriculum JSON contains concise paraphrases, not reproduced teacher-support text.

## Authority and sequence

- [YRDSB mathematics](https://www2.yrdsb.ca/schools-programs/school-programs-nav/school-programs/mathematics) points to Ontario's 2020 elementary mathematics curriculum.
- [YRDSB planning information](https://www2.yrdsb.ca/about-us/director-education/directors-annual-report/board-improvement-plan-math) says board-developed long-range plans and curriculum continuums are on its internal website. No public board-preferred Grade 8 teaching sequence was verified. The app's suggested path is explicitly its own, not a YRDSB timetable.
- [Ontario curriculum overview](https://www.ontario.ca/page/math-curriculum-grades-1-8) describes the six strands and Grade 8 progression.

The official comparison PDFs were read by their Grade 8 column and visually checked to avoid mixing expectations from adjacent grades:

| Strand | Grade 8 entries | Official source |
| --- | --- | --- |
| B Number | B1.1–B1.4, B2.1–B2.8: 12 | [Number](https://assets-us-01.kc-usercontent.com/fbd574c4-da36-0066-a0c5-849ffb2de96e/c2dea171-e219-4ec0-b097-24c959fcc924/Number_AODA.pdf) |
| C Algebra | C1.1–C1.4, C2.1–C2.4, C3.1–C3.2, C4 overall: 11 | [Algebra](https://assets-us-01.kc-usercontent.com/fbd574c4-da36-0066-a0c5-849ffb2de96e/08f5a14f-576a-4282-af82-096dc302ed10/Algebra_AODA.pdf) |
| D Data | D1.1–D1.6, D2.1–D2.2: 8 | [Data](https://assets-us-01.kc-usercontent.com/fbd574c4-da36-0066-a0c5-849ffb2de96e/60e2b2c7-5a7a-4038-bc06-fb88ffd6c861/Data_AODA.pdf) |
| E Spatial sense | E1.1–E1.4, E2.1–E2.4: 8 | [Spatial sense](https://assets-us-01.kc-usercontent.com/fbd574c4-da36-0066-a0c5-849ffb2de96e/01b0b598-d5dc-455b-83de-9b7436bcefeb/Spatial_AODA.pdf) |
| F Financial literacy | F1.1–F1.6: 6 | [Financial literacy](https://assets-us-01.kc-usercontent.com/fbd574c4-da36-0066-a0c5-849ffb2de96e/8a374255-069f-4539-b020-5737aaf672f9/Financial_AODA.pdf) |
| A Learning skills/processes | A1.1–A1.6: 6, integrated across strands | [Grade 8 A1](https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-mathematics/grades/g8-math/strand-a/a1) |

There are **51 entries**, including the C4 overall modelling expectation, which has no separately numbered specific expectations, and six integrated learning-skill entries.

## Implementation and limits

`ontario-math-grade-8.json` contains the hierarchy, sources and activity references; `grade-8-questions.json` contains 60 named-parameter activity variants. IDs use a `g8-` prefix so Grade 5 references remain stable. `../catalog.js` selects grades without duplicating the page or renderer.

`src/math/grade8/` groups rules by domain. The activities reuse exact rational arithmetic, powers, root bounds, linear equations, statistics, scaling and balance operations. Existing Grade 5 budget, graph-critique, repeating-pattern and reflection activities are reused directly where appropriate. Shared builders add editable data-analysis conditions, paired measurements and compound-probability experiments. Numeric examples are bounded; code activities execute predefined operations rather than arbitrary source text.

Coverage is deliberately marked **partial** for each expectation: an activity demonstrates practice, not exhaustive coverage of every context or certified mastery. Collecting physical measurements, constructing real objects, open-ended modelling, and social-emotional learning require hands-on work or human judgement. Reflection text is not automatically graded or persisted.

Financial examples use explicitly supplied fictional rates and simplified assumptions, never live offers or inferred current tax law. Radical and π expressions remain exact; graph coordinates and shape illustrations may use floating-point layout. The existing free-text/handwriting parser remains bounded; the new Grade 8 capabilities are exposed through structured curriculum activities, not an unrestricted algebra parser.

Tests assert every researched entry has an activity, all referenced IDs exist, randomized tutorials render correctly, and exact results hold for negative inequalities, rational operations, dependent probability, geometry, scale and interest. Grade 5 regression fixtures continue to protect its original lessons.
