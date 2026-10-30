# Product concept and agent memory

Build a web app that teaches elementary students math. Begin with a formula entered in plain text or LaTeX, then animate a clear LaTeX solution one step at a time. Work only with real numbers. Prefer the simplest correct solution with the fewest useful steps, while allowing multiple valid methods when they help understanding. Explain each step in language suitable for elementary students.

Avoid LLMs for solving: use deterministic parsing, exact arithmetic, and explicit mathematical rules. Never invent intermediate steps or evaluate arbitrary input as code. Reject unsupported expressions and non-real operations clearly. Expand supported mathematics deliberately, with tests for correctness.

Motion Canvas LaTeX (https://motion-canvas.io/docs/latex/) is a suggested renderer; an alternative is acceptable. This prototype uses KaTeX and browser animations to keep rendering lightweight. Respect reduced-motion preferences and provide manual stepping as well as playback.

The landing page is an auto-playing card slide show (order of operations, fractions, long division, long multiplication, an equation, clock reading, a labelled Pythagorean triangle, chart reading, and calculator keys) that can be paused to type or draw a formula. `game.html` (Practice) has a Captain Patty waiting room, previous-player picker, editable 1–50-question rounds (default 5), local saving and colour-coded topic progress. Every checked answer shows its explanation; wrong answers become unscored explored examples, with text/icon/colour feedback. The curriculum page can also print an exercise sheet (topics, number of questions, answers on the last page, optional workings) through the browser print dialog. The solver supports two-number addition, subtraction, multiplication and division, plus a three-term addition example with alternative grouping. Decimal inputs use exact rational arithmetic. Do not imply this limited parser supports all LaTeX or general algebra.

Every page mounts a shared player badge with lifetime statistics (`profile-corner.js`, `game/profile.js#profileStats`: perfect = every question solved, won = at least 80% solved, pear = all correct answers) and uses one grade picker (`grade-picker.js`) as both display and selector; pages react to the `math-profile-change` and `math-rounds-changed` events. The curriculum catalog covers Grades 1–10. Grades 1–3 use shared primary domain rules and visual models, with grade-bounded JSON variants; physical tasks and SEL remain unscored representative coverage. Grades 9–10 (MTH1W and MPM2D) use `src/math/secondary/`: one registry of rules, each with many styles, plus `math/core/tidy.js` (last-line notation cleanup), `math/core/terms.js` (clean algebraic terms) and `math/check-policy.js` (only independent checks are shown). Graphs belong in the worked steps, never beside a question they would answer. Calculator use follows the manufacturer's practice: DEG mode check, multi-tap trig keys, and no calculator for by-hand algebra.

# Development

Use the existing checkout; cloud tasks are already isolated, so do not create worktrees unless requested. Run `npm ci`, `npm run dev`, `npm test`, and `npm run build`. No API keys, LLMs, database, or backend are required.

# Keep docs in sync (all agents)

## Curriculum variety is the baseline (agent memory)

- Preserve Claude's rich-variant work in commit `cbb2989`; changing only random numbers is not sufficient variety. Read `CLAUDE.md` and the current `variants*.js` families before adding curriculum.
- For new non-SEL skills, provide at least two meaningfully different activity templates where the expectation supports them, and at least three distinct stems across their style/mode domains. Vary context, representation, the unknown, or reasoning task—not just names or operands. A single diagram/construction/discussion template is acceptable only when it has several substantive variants and an explicit coverage reason in the research audit.
- Every stem needs a specific clue or strategy, useful worked steps, and a check of the exact requested answer when objectively checkable. The hidden initial step is not teaching content. Avoid generic “Calculate” filler, repeated question lines, tautological checks, and irrelevant 1×/0× terms.
- Keep each grade's number ranges, vocabulary, notation, representations, and methods appropriate to the official expectation. Do not copy older-grade teaching into primary grades or introduce later-grade algorithms to inflate coverage.
- Use style parameters and shared domain modules rather than one JavaScript file per activity. Declare bounded named parameters in JSON and keep game/worksheet eligibility honest; open-ended construction, discussion, and SEL must not receive fabricated correctness scores.
- Add an automated variety audit for new grades, exercise every declared style, test exact answers and invalid domains, and verify sample/randomized rendering and refresh. Exclude strand A from numerical variety targets; retain its six outcomes as unscored guidance.

Applies to every agent working here (ChatGPT, Claude, others). When a change affects what users see or how they run the app:

1. Update `README.md` (feature descriptions, local development) and `src/README.md` (file map, architecture) in the same change. Delete sentences that are no longer true rather than appending.
2. Retake affected screenshots in `docs/images/` (landing, curriculum, dark mode, game) and fix their alt text in the README. Do not leave stale or orphaned images; remove unused ones. Root-level `*-preview.png` files are git-ignored scratch captures: delete them when done.
3. Re-read this file and `CLAUDE.md`; update them if the product concept, supported scope, or workflow changed.
4. Run `npm test` and `npm run build` before committing. Never commit secrets.
5. `CLAUDE.md` holds the reviewer role and review log. A reviewer pass should also confirm the docs and screenshots match the app.

## Calculator teaching memory

The shared calculator is a bounded 36X Pro key-entry subset with a custom seven-segment LED-style display. Verify additional sequences against the manufacturer's official guidebook before extending it. Keep exact arithmetic in the common rational core, label approximations, and reject non-real/unsupported entries. Contextual recommendations and visible function keys belong in `calculator/plans.js`; do not add one calculator per activity or automatically fill a learner's answer. Basic primary skills stay uncluttered; suitable learning/practice explanations have independent, colour-coded key playback. Landing visual demos must reuse real implemented curriculum lessons. Pythagoras is the intended triangle topic, not trigonometry.

Fraction calculator tutorials must use the calculator's n/d fields and cursor sequence. Scientific-notation lessons retain the existing ×10ⁿ teaching and add EE entry plus a SCI display alternative; do not substitute decimal-to-fraction conversion for moving a decimal point. The current landing sequence has ten examples.

Practice defaults to Mole meadow: a full-window grassy five-choice quiz with five mole variants, click confirmation, hit/dizzy or escape feedback, and explanations after every answer. Captain Patty remains selectable.

The curriculum grade overview and selector form one connected header, with grade choices expanding directly below.

Project name: **Whack-a-Math**. Preserve existing browser storage keys when updating branding.

Brand mascot: the fifth waving mole (`public/game-art/moles/mole-5.png`), used for the landing logo, favicon and PWA icons.
