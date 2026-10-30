# App structure

The app has three separate layers: curriculum content, mathematical rules, and tutorial presentation. There is **no JavaScript file per expectation or activity**. A domain module groups related rules, and every view uses the same rules and tutorial renderer.

```text
src/
  nav.js                         Shared grouped page switcher (current page highlighted)
  main.js                        Landing page: auto-playing slide-show cards, own-formula box, handwriting modal
  game.js / game.css             Math quest page: battle scene, setup form, previous-player picker, history
  game/
    model.js                     Round creation, answer parsing, scoring, battleState and per-topic progress stats (pure, tested)
    storage.js                   IndexedDB persistence of rounds by player
    profile.js                   Active profile (last used or none), shared with the curriculum page
    model.test.js                Scoring, parsing and battle-state tests
  curriculum.js                  Curriculum page: hierarchy and learner/parent modes
  curriculum.css                 Curriculum and activity presentation
  curriculum/
    catalog.js                   Grade 5/8 datasets and reusable grade selection
    data/
      ontario-math-grade-5.json   Grade → strand → topic → expectation hierarchy
      practice-questions.json    Question types, named parameters, default examples
      ontario-math-grade-8.json   Researched Grade 8 expectation hierarchy and sources
      grade-8-questions.json      Grade 8 named-parameter activities
      grade-8-research.md         Source audit and coverage limits
      README.md                  Content schema and IDs
    data.js                      Shared content exports and activity lookup
    practice.js                  Generate a question and dispatch to its math rule
    practice-view.js             Shared stepping, playback, refresh, and answer UI
    visuals.js                   Shared tables, graphs, grids, shapes, and number lines
    builders.js                  Bounded coding, graph, budget, and geometry tools
    *.test.js                    Content and question integration tests
  math/
    lesson.js                    Shared tutorial data contract for all grades
    core/
      exact.js                   One BigInt rational arithmetic and rounding implementation
      format.js                  Shared fraction, decimal, mixed-number, and money formatting
      relationships.js           Shared division, carries, balance, sequences, and statistics
      core.test.js               Independent arithmetic/relationship correctness tests
    arithmetic.js                Bounded plain-text/LaTeX arithmetic parser
    fractions.js                 Mixed-number/fraction conversions
    equations.js                 Bounded one-variable equation parser
    long-division.js             Digit-by-digit exact division
    long-multiplication.js       Digit-by-digit exact multiplication
    *.test.js                    Tests beside the algorithms
    grade5/
      index.js                   Domain-rule registry and argument validation
      common.js                  Lesson contract, diagram descriptions, and format adapters
      number.js                  Place value, comparisons, fractions, decimals, ratios
      algebra.js                 Patterns, expressions, inequalities, coding, modelling
      data.js                    Sampling, frequencies, graphs, statistics, probability
      spatial.js                 Geometry, coordinates, transformations, measurement
      financial.js               Money, tax exercises, budgets, debt, unit prices
      reflection.js              Guided learning habits; no automatic grading
      grade5.test.js             Reference results, invariants, ranges, rendering tests
    grade8/                      Grouped number, algebra, data, spatial and financial methods
```

Other root files implement the existing handwriting surface, debugging, individual demo entry points, and calculation-board views. These are UI integrations, not separate activities in the curriculum library.

## How the layers connect

1. An expectation has a stable ID, such as `b1-6`. The hierarchy stores its title, requirement, and reference example. It does not run calculations or store learner progress.
2. A question template references that ID and a reusable `rule`. For example:

   ```json
   {
     "id": "grade5-round-tenth",
     "skillId": "b1-6",
     "title": "Round to the nearest tenth",
     "rule": "round-tenth",
     "parameters": ["hundredths"],
     "example": {"hundredths": 347}
   }
   ```

   Money is stored as integer cents; decimal questions use integer tenths or hundredths. Names make those units explicit. The parameter list defines the argument order used by the rule; callers may supply the named object instead.
3. `curriculum/practice.js` converts named parameters to validated arguments and calls a rule in the grouped math modules. Refresh uses that rule's bounded `generate(rng)` function, then rejects an identical question. Rules contain no DOM code and never evaluate input as executable code.
4. A rule returns tutorial **data**, not HTML. A typical result contains `kind`, `prompt`, optional `formula`, `steps`, `answer`, and optional `response`, `builder`, or `visual` descriptions. Each step contains a caption (`text`), optional LaTeX (`math`), and optional structured diagram (`visual`). Captions use explicit templates and calculated values. The first step describes the original question; the view starts at step 1 so it is not repeated in the solution.
5. The shared view renders the same result for every activity. Expression steps are equivalent expressions and receive a leading equals sign. Equation steps preserve their own equals sign. General worked steps may state different facts or show diagrams, so they do not receive an invented leading equals sign. Playback reveals steps in order; completed controls disappear; refresh starts a new question. Reduced-motion settings suppress entry animations.

Parent mode reads requirements, sources, activity links, and coverage metadata from the same JSON. Learner mode consumes the templates and rule results. Future revision or game modes can reuse `createPractice`, `generateValues`, stable question IDs, and structured answers without copying mathematical logic or changing the hierarchy.

## Extending the library

- Reuse a rule when only the numbers or wording need to change. Add another JSON template linked to the relevant expectation.
- When a mathematical operation needs a new rule, put it in the existing domain module, register its argument ranges in `math/grade5/index.js`, and add correctness tests.
- Add a shared visual or builder only when an activity needs a genuinely new representation or interaction. Do not create a new component for every expectation.
- Run `npm test` and `npm run build`. Tests check all 58 expectation references, named parameter schemas, randomized questions, exact results, mathematical invariants, invalid inputs, and KaTeX rendering.

Activities provide worked or guided practice for all 58 entries. The coverage field deliberately remains `partial`: having an activity is not a claim to exhaust every context, demonstrate physical measurement, or certify mastery. Open-ended modelling, discussion, and personal reflection need human judgement; they are not automatically marked correct.

Grade 8 adds 60 activity variants across 51 entries. The grade selector preserves Grade 5 IDs and uses `g8-` IDs for Grade 8. Both grades share the core, lesson schema and UI. Grade 8 extends structured activity methods; it does not silently broaden the free-text parser. Research and source mapping are documented in `curriculum/data/grade-8-research.md`.

## Calculation reuse and teaching composition

`math/core/exact.js` is the authoritative implementation of exact rational arithmetic, normalization, comparison, common denominators, decimal parsing, quotient/remainder, and explicit half-up rounding (ties away from zero for negative values). `format.js` contains display policy; `relationships.js` composes operations into reusable mathematical facts. Neither layer imports curriculum or UI code.

- Arithmetic parsing and equation isolation use the same rational operations as curriculum activities.
- Long division, improper-to-mixed conversion, partial-quotient lessons, coding conditions, and grouping problems share division facts. Long division still owns its divide/multiply/subtract/bring-down sequence and board snapshots.
- Long multiplication uses shared products, sums, and digit/carry facts instead of its own arithmetic implementation.
- Decimal addition/subtraction share one place-value lesson builder, and like-denominator fraction addition/subtraction share another. Their distinct wording is retained.
- Odd/even statistics share one exact statistics implementation and one lesson builder; the explanation of the median changes with sample size.
- Budgets and debt use shared sums and balances; the budget tool uses the same balance relationship. Tax exercises use proportional scaling and exact rounding. Metric conversion uses the same scaling operation.
- Pattern lessons and the editable loop tool share linear sequences. Parser equations and inverse-operation lessons share linear isolation and substitution.

Composition happens at the calculation/fact level, with shared teaching methods where the explanation truly matches. A long-division lesson does not automatically include an entire multiplication tutorial. Domain modules retain the pedagogical order and wording. Visual geometry and pixel layout may use floating-point coordinates; numeric answers and validation use the exact core within their declared input ranges.

The fixed `math/fixtures/pre-refactor-behavior.json` records hashes of 240 complete curriculum lessons and representative parser examples captured before consolidation. Its regression test verifies answers, captions, diagrams, and board snapshots stay unchanged. Do not regenerate this fixture merely to make a refactor pass; investigate a mismatch and review any intentional teaching change.

## Grades 4, 6, and 7

The catalog now includes Grades 4–8 (default remains Grade 5). Each additional grade has a separate `ontario-math-grade-{grade}.json` hierarchy and `grade-{grade}-questions.json` template list. The same renderer and learner/parent controls consume every grade.

`math/elementary/` groups shared number, algebra, data, spatial, and financial rules used across Grades 4, 6, and 7. Existing Grade 5/8 rules are reused directly where appropriate. There is no rule module per expectation. Research, audited code counts, and coverage limits are recorded in `curriculum/data/grades-4-6-7-research.md`.

Question templates may declare `generation`, one domain per named parameter: either a list of allowed integers, or `{min,max,step}`. `generateQuestionValues(template,rng)` respects these grade-specific domains; `createPractice` checks the same bounds. `nextValues` generates a different valid question. Use the template-aware generator for curriculum activities; `generateValues(rule,rng)` remains available for the original rule defaults. `answerMinimum` can exclude negative subtraction answers in Grade 4. A solver can reject cross-parameter conditions, such as a cash payment below the purchase total.

`guided-discussion` uses bounded, explicit JSON prompt variants with no correctness score. It does not evaluate user code or invoke a model. A fixed conceptual question hides refresh if its entire domain has only one possible value.
