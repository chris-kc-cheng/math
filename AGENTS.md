# Product concept and agent memory

Build a web app that teaches elementary students math. Begin with a formula entered in plain text or LaTeX, then animate a clear LaTeX solution one step at a time. Work only with real numbers. Prefer the simplest correct solution with the fewest useful steps, while allowing multiple valid methods when they help understanding. Explain each step in language suitable for elementary students.

Avoid LLMs for solving: use deterministic parsing, exact arithmetic, and explicit mathematical rules. Never invent intermediate steps or evaluate arbitrary input as code. Reject unsupported expressions and non-real operations clearly. Expand supported mathematics deliberately, with tests for correctness.

Motion Canvas LaTeX (https://motion-canvas.io/docs/latex/) is a suggested renderer; an alternative is acceptable. This prototype uses KaTeX and browser animations to keep rendering lightweight. Respect reduced-motion preferences and provide manual stepping as well as playback.

The prototype supports two-number addition, subtraction, multiplication and division, plus a three-term addition example with alternative grouping. Decimal inputs use exact rational arithmetic. Do not imply this limited parser supports all LaTeX or general algebra.

# Development

Use the existing checkout; cloud tasks are already isolated, so do not create worktrees unless requested. Run `npm ci`, `npm run dev`, `npm test`, and `npm run build`. No API keys, LLMs, database, or backend are required.
