# Product concept and agent memory

Build a web app that teaches elementary students math. Begin with a formula entered in plain text or LaTeX, then animate a clear LaTeX solution one step at a time. Work only with real numbers. Prefer the simplest correct solution with the fewest useful steps, while allowing multiple valid methods when they help understanding. Explain each step in language suitable for elementary students.

Avoid LLMs for solving: use deterministic parsing, exact arithmetic, and explicit mathematical rules. Never invent intermediate steps or evaluate arbitrary input as code. Reject unsupported expressions and non-real operations clearly. Expand supported mathematics deliberately, with tests for correctness.

Motion Canvas LaTeX (https://motion-canvas.io/docs/latex/) is a suggested renderer; an alternative is acceptable. This prototype uses KaTeX and browser animations to keep rendering lightweight. Respect reduced-motion preferences and provide manual stepping as well as playback.

The landing page is an auto-playing card slide show (order of operations, fractions, long division, long multiplication, an equation) that can be paused to type or draw a formula. `game.html` (Math quest) is a five-question battle built on the curriculum questions, with local saving, a previous-player picker and colour-coded per-topic progress. The curriculum page can also print an exercise sheet (topics, number of questions, answers on the last page, optional workings) through the browser print dialog. The solver supports two-number addition, subtraction, multiplication and division, plus a three-term addition example with alternative grouping. Decimal inputs use exact rational arithmetic. Do not imply this limited parser supports all LaTeX or general algebra.

# Development

Use the existing checkout; cloud tasks are already isolated, so do not create worktrees unless requested. Run `npm ci`, `npm run dev`, `npm test`, and `npm run build`. No API keys, LLMs, database, or backend are required.

# Keep docs in sync (all agents)

Applies to every agent working here (ChatGPT, Claude, others). When a change affects what users see or how they run the app:

1. Update `README.md` (feature descriptions, local development) and `src/README.md` (file map, architecture) in the same change. Delete sentences that are no longer true rather than appending.
2. Retake affected screenshots in `docs/images/` (landing, curriculum, dark mode, game) and fix their alt text in the README. Do not leave stale or orphaned images; remove unused ones. Root-level `*-preview.png` files are git-ignored scratch captures: delete them when done.
3. Re-read this file and `CLAUDE.md`; update them if the product concept, supported scope, or workflow changed.
4. Run `npm test` and `npm run build` before committing. Never commit secrets.
5. `CLAUDE.md` holds the reviewer role and review log. A reviewer pass should also confirm the docs and screenshots match the app.
