# Little Math Lab

An elementary math prototype with KaTeX formulas and animated, explained steps. No LLM, API key, or backend is used.

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Run `npm test` for deterministic solver tests and `npm run build` for the production build. Use `npm run preview` to serve the production build.

Choose one of six samples, or enter two signed integers/decimals with `+`, `-`, `*`/`×`, or `/`/`÷`. Three-term addition offers two grouping methods. Simple LaTeX `\frac{3}{4}`, `\times`, `\cdot`, and `\div` are supported. General LaTeX parsing, algebra, powers, and mixed operations are deliberately unsupported. Answers are reduced exact fractions where necessary, and division by zero is rejected.

Use Play, Pause, or the arrow buttons to move through the explanation. Reduced-motion settings suppress formula transitions. The product concept and agent guidance are saved in AGENTS.md.
