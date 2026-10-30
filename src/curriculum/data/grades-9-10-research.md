# Grades 9–10: research and coverage audit

Researched 2026-10-30. YRDSB follows the Ontario secondary mathematics curriculum for Grades 9 and 10. The public board pages ([mathematics](https://www2.yrdsb.ca/schools-programs/school-programs-nav/school-programs/mathematics), with links to a secondary learning overview and a de-streaming page) do not publish an expectation-by-expectation teaching sequence, so the app keeps the ministry order and labels its learning route as an app suggestion.

## Courses chosen

| App grade | Course | Curriculum document | Notes |
| --- | --- | --- | --- |
| 9 | MTH1W, Mathematics, Grade 9 (de-streamed) | The Ontario Curriculum: Mathematics, Grade 9, 2021 | Replaced MPM1D/MFM1P. Expectations are numbered by the ministry. |
| 10 | MPM2D, Principles of Mathematics, Grade 10, Academic | The Ontario Curriculum, Grades 9 and 10: Mathematics, 2005 (revised) | The 2005 document does not number specific expectations, so the app labels them QR1.1…, AG1.1…, TR1.1… in document order. These labels are the app's own. |

Not modelled: MFM2P (Grade 10 applied) and locally developed courses. Its linear-relation, quadratic and trigonometry topics overlap MPM2D, but its measurement strand and applied emphasis are different. Adding it would be a separate hierarchy.

## Primary sources

- Grade 9 course data was read from the Ministry's public content service behind [dcp.edu.gov.on.ca](https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w): 3 strand headings, 14 overall expectations and **43 specific expectations** (B1.1–F1.4). The test `secondary-grades.test.js` embeds that code list and fails if the hierarchy drifts.
- Grade 10 expectations were read from the ministry PDF [math910curr.pdf](https://www.edu.gov.on.ca/eng/curriculum/secondary/math910curr.pdf): 3 strands, 10 overall expectations in 10 subheadings and 38 specific expectations (QR 18, AG 10, TR 10).
- Strand pages: [B Number](https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/b-number), [C Algebra](https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/c-algebra), [D Data](https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/d-data), [E Geometry and Measurement](https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/e-geometry-and-measurement), [F Financial Literacy](https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-mathematics/courses/mth1w/strands/f-financial-literacy).
- Calculator practice: the manufacturer's [36X Pro guidebook](https://education.ti.com/html/eguides/scientifics/PDFs/EN/TI-36X-PRO-Guidebook_EN.pdf) says to enter trigonometric functions "just as you would write them" and to set the angle mode before starting trigonometric work. The sin, cos and tan keys are multi-tap keys; a second press selects the inverse. Enter closes any open brackets.

## Inventory and variety

| Grade | Expectation entries | Non-SEL entries | Question templates | Distinct rules used |
| --- | ---: | ---: | ---: | ---: |
| 9 | 51 (43 specific + 2 process + 6 SEL) | 45 | 131 | 39 |
| 10 | 39 (38 specific + 1 process) | 39 | 116 | 37 |

The two grades draw on one registry of 68 secondary teaching rules with 448 styles in total.

Every non-SEL entry has at least two templates and at least six substantive stems; most computational entries have three templates (two focused style sets and a mixed-practice set). A style is a different context, representation or unknown, not only different numbers. Higher grades have more variants per entry than Grades 1–3 because the same idea is asked as a calculation, a reading of a graph or table, a word problem, a check and a judgement.

## Grade boundaries

- Grade 9: integers, rationals and powers (including negative and zero exponents, scientific notation and the exponent laws); ratios, rates, percentages and proportions; linear relations, systems of two lines compared by their intersection, graph forms (x = k, ax + by = k, xy = k) and line transformations; code tracing; quartiles, box plots and scatter plots; circle and triangle properties, unit conversion, the effect of scaling, Pythagoras and volumes of prisms, pyramids, cylinders and cones; appreciation, depreciation, simple and compound interest and budgets.
- Grade 10 (MPM2D): the quadratic relation and its parabola (second differences, features, transformations, expanding, factoring, completing the square, the discriminant, the quadratic formula and applications); linear systems by substitution and elimination, midpoint, length, circles at the origin, and verification of geometric properties with coordinates; similar triangles, the primary trigonometric ratios and the sine and cosine laws in acute triangles.
- Obtuse triangles, the ambiguous case, quadratic equations with complex roots, and the general circle equation are outside these courses and are not generated.

## Honest coverage and scoring

Every entry has representative worked or guided activities, and every activity is marked partial coverage. Researching a concept, discussing implications, planning data collection, building a model, and reporting need learner participation beyond a supplied example, so those entries (about 25) are guided-discussion activities with explicit teaching prompts and no invented score. Social-emotional learning skills in Grade 9 reuse the existing unscored prompts.

Math quest and the printable worksheets use only single-answer questions whose answers parse exactly: whole numbers, decimals rounded as the question states, and `\frac{n}{d}`. Choice answers (for example yes/no or “linear / quadratic / exponential”) remain in practice mode. Trigonometric answers are computed with floating-point sin, cos and tan and rounded as asked; a value too close to a rounding tie is rejected instead of being marked on a coin flip.

## Calculator policy

The calculator opens on its own only when a numerical key plan exists and the question warrants a calculator: trigonometry, powers, scientific notation, compound interest, π volumes, unit conversions, percentages, the quadratic formula and long computations. Expanding, factoring, simplifying, midpoints, and angle sums stay by hand because the algebra or mental arithmetic is the learning goal. Trigonometry plans start with the vendor-recommended angle check (MODE, enter on DEG, clear) and use the multi-tap sin, cos and tan keys, with the inverse by pressing the key twice. Data lists and the device's 1-Var Stats are not simulated; quartiles are taught by hand.

## Review notes

An automated scan of about 10 000 generated Grade 9–10 questions found no `1x`, `+-`, `0x` coefficients or unit exponents outside intentional cases. The scan found and the authors fixed answer-revealing graphs placed beside the question (graphs now appear in the worked steps), a Grade 9 power question with exponent 1, and decimal formatting such as `49.0`.
