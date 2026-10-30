# Grades 1–3: research and coverage audit

Researched 2026-10-30. YRDSB follows Ontario's 2020 Mathematics curriculum for Grades 1–8. The public board pages do not establish a preferred expectation-by-expectation teaching sequence; the app retains official A–F order and labels its learning route as an app suggestion.

## Primary sources

- [YRDSB mathematics](https://www2.yrdsb.ca/schools-programs/school-programs-nav/school-programs/mathematics)
- [YRDSB elementary learning overview](https://www2.yrdsb.ca/schools-programs/school-programs-nav/school-programs/mathematics/elementary-math-learning-overview)
- [Ontario curriculum overview](https://www.ontario.ca/page/math-curriculum-grades-1-8)
- [Grade 1 expectations](https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-mathematics/grades/g1-math/strands)
- [Grade 2 expectations](https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-mathematics/grades/g2-math/strands)
- [Grade 3 expectations](https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-mathematics/grades/g3-math/strands)

The ministry strand comparison PDFs were downloaded and their Grade 1/2/3 columns extracted independently. The implementation's B–F codes matched the extracted inventories, with no missing or extra codes. C4 is an overall modelling expectation; six A1 outcomes are retained separately as unscored guidance.

- [Number strand comparison PDF](https://assets-us-01.kc-usercontent.com/fbd574c4-da36-0066-a0c5-849ffb2de96e/c2dea171-e219-4ec0-b097-24c959fcc924/Number_AODA.pdf)
- [Algebra strand comparison PDF](https://assets-us-01.kc-usercontent.com/fbd574c4-da36-0066-a0c5-849ffb2de96e/08f5a14f-576a-4282-af82-096dc302ed10/Algebra_AODA.pdf)
- [Data strand comparison PDF](https://assets-us-01.kc-usercontent.com/fbd574c4-da36-0066-a0c5-849ffb2de96e/60e2b2c7-5a7a-4038-bc06-fb88ffd6c861/Data_AODA.pdf)
- [Spatial strand comparison PDF](https://assets-us-01.kc-usercontent.com/fbd574c4-da36-0066-a0c5-849ffb2de96e/01b0b598-d5dc-455b-83de-9b7436bcefeb/Spatial_AODA.pdf)
- [Financial strand comparison PDF](https://assets-us-01.kc-usercontent.com/fbd574c4-da36-0066-a0c5-849ffb2de96e/8a374255-069f-4539-b020-5737aaf672f9/Financial_AODA.pdf)

## Inventory and variety

| Grade | Expectation entries | Non-SEL entries | Question templates (including SEL) |
| --- | ---: | ---: | ---: |
| 1 | 45 | 39 | 90 |
| 2 | 46 | 40 | 93 |
| 3 | 53 | 47 | 108 |

All 126 non-SEL entries have at least two templates and at least three normalized question stems. Style parameters vary context, representation, the requested unknown, or reasoning, not merely numbers. Tests exercise every declared style, sample and refresh domains, valid exact answers, invalid inputs, KaTeX rendering, diagram contracts, and shared game/worksheet construction. Claude's existing Grades 4–8 variant families are preserved. The rich-variant standard is now recorded in AGENTS.md and CLAUDE.md as lasting agent memory.

## Grade boundaries

- Grade 1: whole numbers through 50, facts through 10, mental addition/subtraction through 20, one-attribute sorting, repeating patterns, one-to-one graphs, sharing with two/four people, calendar language, coins through 50 cents and bills through 50 dollars. Sharing uses models and words rather than later fraction algorithms.
- Grade 2: whole numbers through 200; mental addition/subtraction through 50 and stories through 100; repeated groups and division through 12; halves/quarters/thirds/sixths in sharing; two-attribute sorting; modes, one-to-one graphs and line plots; sequential/concurrent code; centimetres/metres; money combinations through 200 cents or dollars.
- Grade 3: whole numbers through 1000; multiplication facts for 2, 5, and 10; bounded multiplication/division models; equivalent sharing and unit fractions; scales 1:2, 1:5, 1:10; repeating-operation patterns and code; many-to-one graphs, mean/mode; metric length, perimeter, clocks/timers, area models, and change.

## Honest coverage and scoring

Every entry has representative worked or guided activities, and every activity is marked partial coverage. Physical constructions, real measurements, conducting surveys/experiments, designing code, comparing real objects, mathematical modelling, and discussion need learner participation beyond a supplied example. Guided variants provide explicit tasks and teaching prompts; they do not certify completion or mastery. No expectation is declared exhaustively assessed.

SEL, open-ended discussion, and nonnumeric or unsupported response forms do not receive invented game scores. Math quest selects supported single numerical answers; printable worksheets reuse the same lesson generators. Early fractional-group questions are excluded from typed game answers. Arithmetic is deterministic and exact, with no LLM/backend calls.

## Verification

The automated tests pass and the production build succeeds. Browser checks cover primary curriculum navigation, sharing diagrams, chart variants, playback completion, refresh, dark-mode diagrams, and the grade selector. The build retains a bundle-size warning; this is not a test failure. An independent review (2026-10-30) sampled generated questions in all three grades, checked them against the stated grade boundaries, and fixed: zero or one-item groupings ("1 counters", "0 left"), place-value prompts that named zero places, make-a-ten questions that were one step, near-trivial equality comparisons, singular/plural wording, and money questions that called bills and coins "pieces". Known remaining limit: Grades 1–2 sharing answers are typed as fractions (for example 5/4) although the Grade 1–2 expectations describe them in words; the game excludes the early fractional-group form.
