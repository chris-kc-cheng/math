# Grades 4, 6, and 7: research and implementation audit

Reviewed 2026-10-29. YRDSB's public mathematics page points to Ontario's 2020 elementary mathematics curriculum. The board says its own long-range plans are on its internal website. The app therefore follows the Ministry's strand → overall expectation → specific expectation hierarchy. Its suggested learning path is an app recommendation, not a verified YRDSB teaching sequence.

## Authoritative sources

- [YRDSB mathematics](https://www2.yrdsb.ca/schools-programs/school-programs-nav/school-programs/mathematics)
- [YRDSB planning information](https://www2.yrdsb.ca/about-us/director-education/directors-annual-report/board-improvement-plan-math)
- [Ontario curriculum overview](https://www.ontario.ca/page/math-curriculum-grades-1-8)
- The five Ministry strand comparison PDFs linked by `sources.number`, `sources.algebra`, `sources.data`, `sources.spatial`, and `sources.financial` in each grade JSON. These tables place all eight grades in adjacent columns; each requested grade was extracted from its own column and the layout was visually checked.
- Strand A and the mathematical processes: each grade's official `sources.learning` link. Six learning-skill outcomes recur across the mathematical strands. C4 is an overall modelling expectation without numbered specific expectations.

## Audited expectation counts

| Grade | B Number | C Algebra (including C4) | D Data | E Spatial | F Financial | A Learning | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 4 | 17 | 10 | 8 | 9 | 5 | 6 | 55 |
| 6 | 18 | 11 | 8 | 10 | 5 | 6 | 58 |
| 7 | 17 | 11 | 8 | 11 | 6 | 6 | 59 |

The B–F specific-expectation code sets were compared programmatically with the relevant PDF columns: no missing or invented codes. Each expectation has a short app-authored summary, the source link, and at least one representative worked or guided activity. The complete official text remains at the source.

## Grade distinctions

- Grade 4: whole numbers through 10,000; multiplication facts through 10 × 10; tenths; common unit fractions; two/three-digit by one-digit arithmetic; whole-dollar purchases; first-quadrant coordinates; elapsed time; rectangle area; stem-and-leaf and multiple-bar graphs.
- Grade 6: whole numbers through one million; integers and decimal thousandths; divisibility tests; prime factors; unlike-denominator fraction addition/subtraction; whole numbers multiplied/divided by proper fractions and decimal tenths; conditional code; interval data/histograms/broken-line graphs; four quadrants; polygon decomposition and prism/pyramid surface area; goals, rates, and fees.
- Grade 7: whole numbers through one billion and powers of ten; signed rational ordering; numbers between quantities; GCF/LCM; exponent notation; decimal/fraction multiplication/division; proportional versus non-proportional situations; circle graphs; dependent events; circles and cylinders; currency conversion; longer-term budgets and interest comparisons.

## Architecture and coverage limits

Canonical content lives in `ontario-math-grade-{grade}.json` and `grade-{grade}-questions.json`. Stable grade-prefixed IDs prevent collisions. Shared number/algebra/data/spatial/financial rules live in `src/math/elementary/`, alongside the existing Grade 5/8 grouped engines. A grade may reuse any suitable rule; the folder containing a rule does not determine curriculum placement.

Optional question `generation` domains bound named parameters for that grade. The same bounds are checked when creating a lesson, not only during refresh. Cross-parameter conditions are checked by the solver, and generation retries within a bounded limit. Grade 4 subtraction examples reject negative answers. Concepts that do not have meaningful numerical variation use alternate discussion prompts or hide refresh when fixed.

Coverage stays `partial`. Representative examples do not exhaust each expectation's contexts, methods, or physical construction requirements. Open-ended collection, infographics, modelling, construction, financial choices, coding design, and personal reflection need learner work and often human judgement. Guided prompts are explicitly unscored. Financial rates are stated classroom assumptions, not current market quotes or personalized advice. Exact π is retained for circles; exact rational arithmetic supports decimals internally. The free-form formula parser is unchanged.

Tests audit all expectation codes, stable references, named parameter schemas, grade bounds, refresh, exact known answers, independent inverse identities, invalid domains, and KaTeX rendering for sample and randomized lessons. UI verification covers grade selection, learner/parent mode, diagrams in dark mode, individual playback, refresh, and page-wide fast-forward.
