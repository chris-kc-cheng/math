# Little Math Lab

An elementary math prototype with KaTeX formulas and animated, explained steps. No LLM, API key, or backend is used. Recognition and solving are separate: a trained model transcribes ink; exact arithmetic rules solve supported formulas.

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
npm test
npm run build
```

Use npm run preview to serve the production build. Open the printed local URL.

The lesson page shows only 2 + 3 × 4 and 1/2 + 2/3. Next step or Play/Pause reveals each new line while earlier lines remain visible. Reduced-motion settings suppress entry animations.

The solver supports two signed integers/decimals with +, -, */×, or /÷; three-term addition with two grouping methods; the bounded a + b × c pattern; and a/b + c/d with integer fraction components. Simple LaTeX fractions and multiplication/division commands work. Other mixed operations, general LaTeX parsing, variables, powers, and roots are unsupported. Answers use reduced exact fractions; division by zero is rejected. The skills.html page documents every rule and its captions with calculated examples.

## Trained handwriting recognition

Open write.html via Write a formula. Draw a whole formula in the single pad and review the rendered formula, then Solve. Pen, Eraser, Undo, and Clear are icon controls inside the drawing box. Raw LaTeX and model descriptions are hidden. Read handwriting appears only when Live is off. Editing ink invalidates pending recognition so old results cannot overwrite a changed drawing. The math solver does not gain support for an operation merely because the recognizer can read it.

Recognition uses ink-on 0.1.0 with trained INT8 CoMER encoder/decoder weights and ONNX Runtime Web (CPU/WASM). It runs in a dedicated web worker; no handwriting leaves the browser. This is a specialized handwriting model, not an LLM. A backend is unnecessary. The initial load includes roughly 7.6 MB of model weights plus the WASM runtime. The model is cached in IndexedDB by ink-on; runtime files are bundled by Vite from the installed package, with no CDN dependency. Model provenance and license are in public/models/comer/.

The model supports full expression transcription, including stacked fractions. Recognition is experimental and can be wrong; accuracy on children's handwriting has not been measured. Sample ink is synthetic demonstration data, not an accuracy benchmark. The old geometric template matcher has been removed; sample-ink.js only supplies demo strokes.

npm test runs exact solver tests and a real encoder-to-decoder inference smoke test with the shipped model weights and vocabulary. The inference smoke test validates integration, not handwriting accuracy. Browser checks should additionally cover recognition, correction, stale results, errors, and subsequent solution steps.

Live recognition is enabled by default: after a 650 ms pause following a completed stroke, the latest ink is recognized. Only one inference runs at a time, with changed ink queued for the next pass and stale results discarded. Turn Live recognition off for manual-only reading. Pen/Eraser switches tools; dragging the eraser removes touched whole strokes. Undo restores the previous drawing or erasing gesture (up to 30 actions), including Clear. Use the eraser or redraw to correct the formula.
