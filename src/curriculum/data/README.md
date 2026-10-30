# Shared curriculum data

`ontario-math-grade-5.json` is the presentation-independent source for curriculum content. Import it directly or use `../data.js` in Vite views. It contains no executable rules or learner records.

- `schemaVersion`: data structure version, currently 1.
- `id`, `jurisdiction`, `grade`, `language`: identify the curriculum.
- `curriculum`: nested grade → strand → topic → expectation nodes. Every node has a unique, stable `id` and `title`; expectation leaves have `code`, `description`, and `example`. Keep IDs stable so saved progress and activity references remain valid.
- `sources`: original reference URLs.
- `suggestedSequence`: optional app learning path, not an official board timetable.
- `activities`: reusable activity IDs, linked `skillIds`, title, route (`href`), coverage (`partial` or `complete`), and implemented `modes`. Conversion also lists its supported directions. Only advertise modes that are implemented.

Parent, revision, and game views can traverse the same hierarchy and join activities or separately stored learner progress using skill IDs. Every one of the 58 expectations currently has an activity. Coverage remains `partial` to distinguish available activities from exhaustive coverage or mastery. Practice, Math quest, and printable worksheets reuse this content; open-ended activities remain unscored. The JSON describes content and links; deterministic math remains in tested solver modules.

Run `npm test` to check unique IDs, required leaf fields, and valid activity references and routes.

`practice-questions.json` lists question variants independently of the UI. Each template has a stable `id`, its curriculum `skillId`, a learner-facing `title`, a supported deterministic `rule`, ordered `parameters` names, and a named `example` object. Units appear in parameter names, such as `incomeCents` or `startHundredths`. `../practice.js` generates bounded random values and delegates to grouped math engines in `../../math/grade5/`. Views never evaluate strings as code. `activities[].questionIds` references these templates. Personal reflection remains unscored.

See `../../README.md` for the folder map, tutorial result contract, and extension workflow.

Grades 4, 6, and 7 use the same hierarchy and activity schema. See `grades-4-6-7-research.md` for the source audit. `generation` optionally holds one integer range (`min`, `max`, optional `step`) or allowed-integer list per named parameter. These domains are both generation rules and input bounds. `answerMinimum` is an optional lower bound for scalar answers. `discussion` holds explicit unscored prompt/teaching variants for the shared `guided-discussion` family. All other teaching steps are calculated by grouped mathematical rules.

Grades 9 and 10 follow the same schema; their rules live in `math/secondary/` (see `grades-9-10-research.md`). Grades 1–3 use `ontario-math-grade-{grade}.json`, `grade-{grade}-questions.json`, and grouped `math/primary/` rules. Every non-SEL expectation has two or more templates and three or more substantive stems. `answerMaximum` optionally bounds scalar answers. See `grades-1-2-3-research.md`.

Grades 9–10 data is generated: edit `scripts/secondary-spec.mjs` (skills, descriptions, guided prompts, which rule and styles each template uses) and run `npm run build:secondary-data`. The generator picks each template's example from values the rule accepts, so a rule change that invalidates an example fails loudly.
