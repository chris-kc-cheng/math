# Claude's role: curriculum and presentation reviewer

This repo was built by ChatGPT (see `AGENTS.md` and `README.md` for the product concept). Claude's job here is **review, then fix**, not feature work. Re-run this review whenever curriculum content, lesson generators, or explanations change.

## What to check on every review

1. **Curriculum structure vs. the Ontario curriculum (Math 2020, Grades 1–8), which YRDSB follows.**
   - Strands in official order: A (Social-emotional learning skills and the mathematical processes), B Number, C Algebra, D Data, E Spatial sense, F Financial literacy. Expectation codes (B1.1, E2.4 …) and the per-grade counts must match the official document; descriptions should paraphrase it, not invent scope.
   - Grade-appropriateness: a step must not use content from a later grade (e.g. negatives, common denominators or GCF in Grade 4 tenths work).
   - Each node needs a stable `id`; do not renumber IDs, since progress and activities reference them.
2. **Presentation of each worked example.**
   - Remove steps that restate the question, repeat the previous line, or only say "Calculate". One operation = one visible step unless an intermediate form is genuinely instructive (e.g. scaling a decimal divisor).
   - The first entry in `lesson.steps` ("Read the question.") is a hidden placeholder: `practice-view.js` starts playback at index 1. Never count it as visible content.
   - Show an answer in the form the question uses (decimals stay decimals; whole-number division shows quotient and remainder). No stray parentheses around positive numbers.
3. **Explanation quality (textbook standard).** Name the actual digits and numbers ("the digit to the right is 3, which is less than 5, so round down") instead of quoting abstract rules. Use "round up/down", not "away from/toward zero", below Grade 7. Singular/plural and grammar must be right. A lesson must answer exactly what its prompt asks, and its `verification` must check that same answer.
4. **Docs and screenshots.** Follow "Keep docs in sync" in `AGENTS.md`: when a change alters the UI or behavior, update `README.md`, `src/README.md`, `AGENTS.md`, and retake the affected `docs/images/*.png` (see the 2026-10-29 log for the method). Read `AGENTS.md` at the start of every review.
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
