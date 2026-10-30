# Claude's role: curriculum and presentation reviewer

This repo was built by ChatGPT (see `AGENTS.md` and `README.md` for the product concept). Claude's job here is **review, then fix**, not feature work. Re-run this review whenever curriculum content, lesson generators, or explanations change.

## What to check on every review

1. **Curriculum structure vs. the Ontario curriculum (Math 2020 for Grades 1–8, MTH1W 2021 for Grade 9, MPM2D 2005 for Grade 10), which YRDSB follows.**
   - Strands in official order: A (Social-emotional learning skills and the mathematical processes), B Number, C Algebra, D Data, E Spatial sense, F Financial literacy. Expectation codes (B1.1, E2.4 …) and the per-grade counts must match the official document; descriptions should paraphrase it, not invent scope.
   - Grade-appropriateness: a step must not use content from a later grade (e.g. negatives, common denominators or GCF in Grade 4 tenths work).
   - Each node needs a stable `id`; do not renumber IDs, since progress and activities reference them.
2. **Presentation of each worked example.**
   - Remove steps that restate the question, repeat the previous line, or only say "Calculate". One operation = one visible step unless an intermediate form is genuinely instructive (e.g. scaling a decimal divisor).
   - The first entry in `lesson.steps` ("Read the question.") is a hidden placeholder: `practice-view.js` starts playback at index 1. Never count it as visible content.
   - Show an answer in the form the question uses (decimals stay decimals; whole-number division shows quotient and remainder). No stray parentheses around positive numbers.
3. **Explanation quality (textbook standard).** Name the actual digits and numbers ("the digit to the right is 3, which is less than 5, so round down") instead of quoting abstract rules. Use "round up/down", not "away from/toward zero", below Grade 7. Singular/plural and grammar must be right. A lesson must answer exactly what its prompt asks, and its `verification` must check that same answer.
4. **Docs and screenshots.** Follow "Keep docs in sync" in `AGENTS.md`: when a change alters the UI or behavior, update `README.md`, `src/README.md`, `AGENTS.md`, and retake the affected `docs/images/*.png` (see the 2026-10-29 log for the method). Read `AGENTS.md` at the start of every review. Apply its screenshot standard: use light theme (dark theme only when explicitly requested), default to a verified 1920 × 1080 (16:9) CSS-pixel viewport at 100% zoom, inspect for compressed or clipped UI, and remove stale screenshots and references.
5. **Tests.** Every fix gets a regression test in `src/curriculum/review.test.js`. `src/math/fixtures/pre-refactor-behavior.json` hashes full lesson output: when wording changes deliberately, regenerate only the entries that changed and confirm the changed IDs are the ones you edited.

## Review log

### 2026-10-29 — first pass (Grades 4–8)

Fixed:
- Strand A renamed to the official "Social-emotional learning skills and the mathematical processes" (the 2005 name was used) and moved first in all five grade files.
- `round-number`: now names the rounding place and deciding digit; "away from zero" wording removed for non-negative numbers; "nearest 1" → "nearest whole number".
- `decimal-calculate`: wording matches the operation (place-value shift for ×/÷ 10, 100, 1000; decimal-point placement; scaling only when the divisor is a decimal); redundant "Calculate exactly, then simplify" step merged; no parentheses around positive operands; whole-number division shows `156 ÷ 7 = 22 R 2 = 22 2/7` instead of the tautology `156/7 = 156/7`.
- `rational-order`: answer stays in the question's form (G4 tenths were shown as 3/10, 7/10, 6/5) and the "negative values" sentence only appears when a value is negative.
- `decimal-equivalence`: no "divide by the GCF" step when the fraction is already simplest (0.7 = 7/10); otherwise names the GCF.
- `g8-proportion` (used by G6 B2.1/B2.12 and G8): the prompt asked for two things, answered one, and showed 72/5. It now asks one multi-step question (cost of the new count, then the percent increase), answers it as a decimal, and verifies it by working backwards.
- Fraction→mixed number "1 parts left over" → "1 part"; exact division "Reduce any fraction…" text replaced.

### Open items (not yet fixed — pick up on the next review)

- G4 B2.8 (whole-number rates) reuses the ratio scaler (`2:3 → 4:6`); it should show a rate such as "3 books per shelf".
- G4 B1.5 compares fair shares with common denominators; the Grade 4 expectation uses sharing contexts and benchmarks. G4 D2.1 shows `3/8 = 0.375` (only tenths are Grade 4).
- G4 E1.1 is titled "Properties of rectangles" but runs the generic quadrilateral lesson; check the wording against the official E1.1.
- G6 C1.2/C1.3 show `2+(3)n`; drop the parentheses around positive coefficients.
- G4/G6/G7 strand A and several "guided-discussion" skills are paraphrases, not official wording; G5/G8 are closer. Compare expectation wording with the ontario.ca source for every grade (this pass checked structure and counts from memory of the 2020 document, not line by line).
- Long multiplication plays 13 steps for 24 × 13; consider grouping each digit's multiply-and-carry into one step.

### 2026-10-29 — landing slide show, Math quest, docs

- Landing page redesigned (slide-show cards, own-formula box); Math quest finished (battle scene, results, past rounds, previous-player picker). `README.md`, `src/README.md` and `AGENTS.md` updated; screenshots `landing.png`, `landing-long-division.png` and `game.png` added and the stale `equation.png` removed.
- Screenshot method: start `npm run dev`, drive headless Edge over the DevTools protocol, and use `?slide=N` to select a landing card. Wait about 9 s for the equation card to finish before it auto-advances.
- Follow-ups: nav is now a grouped fixed switcher (`src/nav.js`), the dark toggle is frameless (it needs an ID selector to beat the dark-theme `:is(#debug-panel…)` override), "Write" became "Draw" with an ink-pen icon, previous players are badges that start the game directly, and all five screenshots were retaken.
- Open: equation rows on the landing card sit right of centre because the equation grid is asymmetric.
- Math quest follow-up: hit animation, zombie leaves the screen on a win, in-round view hides setup, quit icon and (i) info tip. Bug found while verifying: a handler parameter named `event` shadowed the shot state so the animation never ran; always exercise animations in a browser, not only in tests.
- Math quest progress panel added (last-10 correct rate per strand/topic/skill, coloured dots); `game-progress.png` added.
- Hero lives (5, wrong answers only, cries at zero) and progress dots on the curriculum page with a profile switcher (incl. No profile); `game-cry.png` and `curriculum-progress.png` added.
- Curriculum toolbar regrouped into one row (grade, progress profile, mode); grade row now rolls up all attempts; non-scorable nodes get a lighter dashed circle; brand title/logo enlarged and recoloured to the theme text colour.
- Curriculum header simplified: sidebar top bar has the icon view toggle and active-profile chip (menu), grade changes via an icon button on the Grade row. On phones the grade row sits inside the collapsed Browse curriculum panel (open it to change grade).
- Profile avatars/initials removed everywhere (names only); view toggle icons are a smiley child and a teacher at a board; screenshots retaken.
- Math quest topic picker (all / strand / topic; Continue matches grade and topic); `game-setup.png` added.
- Math quest: multi-select topics (strands and topics), Data/Probability now scorable (`data-measure`, `probability-single`), two-step setup (player first, then grade and topics); `game-setup.png` retaken. Saved rounds keep `strand` for old rounds and use `topics` for new ones (`roundTopics`).
- Curriculum page: exercise-sheet PDF generator (printer icon → dialog: topics, count, workings; answers on the last page). Verified with headless Edge `Page.printToPDF` (3 pages without workings, 7 with) and print-media screenshots; `worksheet-dialog.png` added. Known: some Grade 5 generators produce trivial items such as 1/2 + 0/2.
- Variety audit (281 skills, 5 grades): before, 235 had one template, 159 had a single wording and 70 had any auto-scored question. Added `variants.js` (story-add/subtract/multiply/divide, missing-number, compare-values, digit-value) and Data rules; now 57 skills have 2+ templates and 82 are auto-scored. Still thin: most spatial, financial, algebra-pattern, coding and probability skills (one template each), decimals/fractions word problems, and any 'explain your reasoning' skills. Next batches should add per-strand stems (fractions of a quantity, decimals in money contexts, area/perimeter from words and diagrams, unit conversions, patterns as tables/rules, percent of a quantity) the same way: one rule with a style parameter, a test that each style gives the correct exact answer, and template JSON per grade.
- Math quest: topic selector and progress statistics merged into one two-column panel (checkbox + dot + percentage per strand/topic), Grade and Play on one row; fits 720px height. `game-progress.png` retired (README uses `game-setup.png`); skill-level rows were dropped from the Math quest panel (the curriculum page still shows them).
- Variety batch 2 (`variants-more.js`, 16 rules + mode in `data-measure`, ~56 templates over Grades 4–8). Audit before → after batch 1 → after batch 2 (281 skills): templates 338 → 359 → 415; skills with 2+ templates 46 → 57 → 98; skills with 3+ templates 9 → 14 → 22; skills with only one template 235 → 224 → 183; sampled distinct wordings 576 → 705 → 1007; skills with 3+ wordings 71 → 83 → 124; auto-scored skills (Math quest and worksheets) 70 → 82 → 102, auto-scored templates 83 → 104 → 160. Still single-template: mostly discussion and learning-skills items, constructions and diagrams (transformations, views, graphs), coding and modelling, many financial-literacy explanations, and algebra/geometry items that need non-numeric answers. Reviewer notes: unit-rate questions must give terminating decimals; integer prompts bracket only a negative second operand; every stem has a key-word hint.
- Variety batches 3–6 (`variants-number.js`, `variants-space.js`, `variants-extra.js`, ~100 new templates). The Social-Emotional strand (A1) is excluded from all variant targets and from the stats below (251 skills remain). Audit, start → after batch 2 → now: templates 308 → 385 → 545; skills with 2+ templates 46 → 98 → 196 (78%); skills with 3+ templates 9 → 22 → 72; skills with a single template 205 → 153 → 55; sampled distinct wordings 456 → 887 → 1,627; skills with 3+ wordings 41 → 94 → 196; auto-scored skills 70 → 102 → 188; auto-scored templates 83 → 160 → 320. Still single-template (55): coding and modelling, pattern-type classification, words-to-expression, sampling and infographics, constructions, views and visual transformations, financial-literacy explanations, and Grade 8 association/paired-data. They need choice, drawing or open-ended question types, not more numeric stems. Rule-name collisions with older engines (pattern-table, simple-interest, elapsed-time) were fixed by suffixing the new rules; check for collisions before adding a rule. Reviewer notes: every stem has a key-word hint, money prompts use cents only when needed, tips and discounts are realistic, times carry a.m./p.m., rate answers are exact decimals.

### 2026-10-30 — Codex primary implementation (awaiting reviewer pass)

Added Grades 1–3 with 45/46/53 source-audited entries, 291 templates, grouped teaching rules, diagrams, and game/worksheet reuse. Rich variety is now lasting agent memory in `AGENTS.md`: preserve `cbb2989`, provide substantive template/stem variety, audit all styles, retain grade limits and honest scoring. Tests check code inventories, exact answers, styles, and invalid domains. This records implementation, not a Claude reviewer sign-off. See `src/curriculum/data/grades-1-2-3-research.md`.

### 2026-10-30 — Codex practice UX follow-up (implementation, awaiting review)

Fixed crossing tally strokes, connected grade toggles, and fraction-only demo spacing. Renamed the shared nav route label to Practice. Added a Captain Patty profile waiting room and editable 1–50-question selection after profiles. All checked answers reveal their worked explanation; wrong answers become explored examples without points, and feedback has readable colour plus text/icons. Showing the explanation after a wrong answer does not count a second miss. Model tests cover scoring, invalid entries, round lengths, and completion. Docs and affected screenshots refreshed; this is not a separate reviewer sign-off.

### 2026-10-30 — Codex calculator and visual demos (implementation, awaiting review)

Added a shared 36X Pro key-entry subset with a custom seven-segment display, conditional function keys, safe keyboard handling, and contextual opening in learning/practice. Suitable explanations have independently playable, colour-coded key steps. Added landing examples for clock reading, a labelled Pythagorean triangle, chart reading, and calculator percentages using canonical curriculum templates. The triangle topic is Pythagoras, not trigonometry. Tests cover 36X Pro-style sequences, arithmetic, domain failures, contextual plans, and real demo lessons; device limitations and primary TI sources are in `src/calculator/README.md`. This is implementation evidence, not an independent reviewer sign-off.

Calculator follow-up: fraction demo uses n/d fields; scientific questions retain ×10ⁿ and offer EE/SCI alternatives. Added scientific notation as landing example 10. Default slide auto-play includes key highlighting before advancing, while manual stepping and hiding the calculator pause it.

Demo layout follow-up: calculator visibility no longer changes the landing question pane’s margins or position. Curriculum/practice retain their desktop calculator space reservation.

### 2026-10-30 — Claude Grades 9–10 (implementation, awaiting independent review)

Added Grade 9 (MTH1W, 43 ministry specific expectations plus process and SEL entries, 131 templates) and Grade 10 (MPM2D, 38 specific expectations labelled QR/AG/TR by the app because the 2005 document does not number them, 116 templates). One registry of 68 rules and 448 styles in `src/math/secondary/` serves both grades; tests check the ministry code sets, six or more distinct stems per entry, independently worked answers, exact machine-readable answers and game/worksheet reuse. Graphs appear in worked steps, not beside the question. The calculator gained sin/cos/tan with multi-tap inverses, a DEG/RAD angle mode, and trigonometry walkthroughs that begin with the vendor angle check; by-hand algebra never opens it. Reviewers should audit the quartile convention (exclude the median), rounding-tie rejection, and whether MFM2P should become a separate hierarchy. Sources and decisions are in `src/curriculum/data/grades-9-10-research.md`.


Reviewed Grades 1–3 against the Grade 5–10 standard. Numeric answers now get an answer box (derived `response`, fraction-tolerant comparison); counting chains skip by 2+; fair-share and equal-group fractions are worded (halves, fourths) with multiple choice in Grades 1–2 and notation in Grade 3; the estimate rule shows an estimate before the exact count; chart answers end with a contextual sentence; singular/plural tidying covers more nouns. Tests: `src/math/primary/primary.test.js`. This is the author's review, not an independent sign-off.

### 2026-10-30 — Claude profile and grade-selector follow-up (implementation, awaiting review)

New players are created inside the badge menu (name field, Add), stored in `math-profiles` and made active at once; no game starts and no page change. Signed-in players skip the Practice name step; Guest still sees the waiting room. The grade display and its selector share one row: the grade chip plus a frameless icon button in the same accent colour. The Practice name step was removed; players are chosen only in the badge menu. The fictional player in docs and screenshots is always Chloe (method: seed rounds, drive headless Edge). Not an independent sign-off.

### 2026-10-30 — Codex practice start/resume fix

The shared action cleanup still accessed removed `change-player` and `player-next` buttons after a successful save, throwing before `renderRound`. Replaced that cleanup with `game/controls.js`, which restores existing controls and preserves readiness/count validation. A regression test covers absent old player-step controls. Browser checks confirmed Continue, Next question, and a fresh Play round. Calculator visibility no longer shifts the Practice pane; only curriculum keeps desktop space reservation.

### 2026-10-30 — Mole meadow (implementation, awaiting review)
Added a selectable five-choice full-window game using all five generated mole sprites, grassy holes, hit/dizzy or escape feedback, exact unique answer choices, and existing scoring and worked explanations. Browser checked correct/wrong confirmation, Next, continuation, and full-screen persistence. Updated docs and added `docs/images/mole-meadow.png`.

Curriculum header follow-up: grade overview, skill count and dropdown arrow share one connected surface, with segmented choices below. Browser checked expansion and Grade 1 to Grade 5 switching; screenshot in `docs/images/curriculum-grade-header.png`.

Branding follow-up: renamed the project, page titles, manifest, worksheet title and game choice to Whack-a-Math; preserved browser storage identifiers. Avatar picker now has 25 choices including the initial, dinosaurs and an alien. Browser verified the brand and avatar count; landing and avatar screenshots refreshed.

Mascot follow-up: selected fifth waving mole for the landing logo, ICO favicon, Apple touch icon and regular/maskable PWA icons. Removed previous mascot artwork and source references; branding packaging trims transparent margins and keeps maskable safe padding. Refreshed landing/demo screenshots.

Screenshot standard applied: all 11 README screenshots retaken in light theme using a verified 1920 × 1080 browser viewport, with paused worked examples and current branding. Checked PNG format, wide 16:9 output and README links; captures with browser scrollbars export at 1905 × 1072 without resizing. Removed outdated captures and references.
