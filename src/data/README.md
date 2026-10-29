# Shared curriculum data

`ontario-math-grade-5.json` is the presentation-independent source for curriculum content. Import it directly or use `../curriculum-data.js` in Vite views. It contains no executable rules or learner records.

- `schemaVersion`: data structure version, currently 1.
- `id`, `jurisdiction`, `grade`, `language`: identify the curriculum.
- `curriculum`: nested grade → strand → topic → expectation nodes. Every node has a unique, stable `id` and `title`; expectation leaves have `code`, `description`, and `example`. Keep IDs stable so saved progress and activity references remain valid.
- `sources`: original reference URLs.
- `suggestedSequence`: optional app learning path, not an official board timetable.
- `activities`: reusable activity IDs, linked `skillIds`, title, route (`href`), coverage (`partial` or `complete`), and implemented `modes`. Conversion also lists its supported directions. Only advertise modes that are implemented.

Parent, revision, and game views can traverse the same hierarchy and join activities or separately stored learner progress using skill IDs. A curriculum expectation's presence does not mean it has an implemented activity. Practice is the only activity mode currently provided; revision and games are future views. The JSON describes content and links; deterministic math remains in tested solver modules.

Run `npm test` to check unique IDs, required leaf fields, and valid activity references and routes.
