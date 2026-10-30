# Shared mathematical operations

Dependencies flow in one direction: parsers, methods, curriculum activities, and UI tools **use this core**. Core modules never import those consumers.

- `exact.js`: immutable normalized `{n: BigInt, d: BigInt}` values. Positive denominator, reduced fraction, zero represented as `0/1`. `add`, `subtract`, `multiply`, `divide`, `compare`, and `sum` operate on exact values. `parseDecimal` is a bounded numeric parser, not a formula evaluator. `safeInteger` explicitly adapts an integral result for bounded Number-based activity/visual metadata and rejects overflow or fractional values.
- `format.js`: LaTeX and decimal presentation. `tex` simplifies; `rawFraction` deliberately preserves intermediate notation. `scaledDecimal` formats an integer count of decimal units without rounding. `fixed` explicitly applies exact half-up rounding; ties for negative values go away from zero.
- `relationships.js`: reusable facts built from the operations: additive inverse checks, balances, proportional scaling, linear isolation and substitution, sequences, grouping, division facts, digit carries, and statistics.

For example, `divisionFacts(37, 12)` returns quotient `3`, product `36`, and remainder `1` as BigInts. Long division shows these as separate teaching steps; mixed-number conversion uses the quotient and remainder to show `3 1/12`. Each caller owns the explanation, while sharing the same numerical facts.

Do not copy normalization, cross multiplication, division/remainder, rounding, or statistics algorithms into a new activity. Add a new relationship here only when it is independent of wording and reusable; keep curriculum-specific prompts and step order in the domain modules. Ordinary coordinate/pixel layout need not be routed through exact arithmetic.
