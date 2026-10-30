# Contextual calculator

This is a curriculum-focused 36X Pro key-entry subset, not a complete hardware emulator. Its seven-segment LED-style result display is a custom presentation requested for this app; the physical calculator has a four-line LCD.

## Modules

- `engine.js`: pure template editor, bounded arithmetic evaluator, key reducer, and result formatting. Fractions and powers retain separate fields; arrow keys leave those fields. No input is evaluated as JavaScript.
- `plans.js`: compiles the bounded numerical notation emitted by lesson generators into executable key sequences. It chooses a calculation matching the lesson answer where possible. It also publishes the active activity and its required keys.
- `view.js`: one show/hide icon and floating calculator per page, scoped keyboard handling, seven-segment SVGs, and reusable key-by-key tutorial controls.
- `calculator.css`: keypad, result display, colour highlights, desktop space reservation, and print exclusions.
- `calculator.test.js`: documented key sequences, exact answers, invalid domains, answer reuse, contextual recommendations, and real demo activities.

`nav.js` mounts the shared calculator after the page markup exists. Curriculum cards activate their context on pointer/focus; refresh changes that context. Practice sets the current question directly. Suitable explanations append a calculator tutorial after the worked mathematics. Main lesson playback and calculator-key playback have separate controls, so showing all mathematics does not skip the calculator animation. Number keys highlight amber, operations teal, and navigation/2nd/enter violet; the key name and sequence position also appear as text.

## Recommendation policy

A calculator opens automatically only when a safe numerical key plan exists and the question warrants it: normally Grade 4+ powers/roots, percentages/financial calculations, scientific notation, decimal methods, large products/quotients, or multi-operation computations. Basic primary counting, clock reading, recall, discussion, and unsupported symbolic expressions do not open it. This is an app teaching heuristic, not a statement about assessment permissions. The icon always permits manual opening, and a learner can hide it for the current activity. Only the current activity's relevant functions are shown; ordinary arithmetic typed on the keyboard is still accepted.

The editor supports basic arithmetic, parentheses, negative entries, fractions, mixed-number entry/conversion, percent, integer powers, square roots, reciprocal, pi, EE, and Ans. Other scientific menus and solvers, statistical lists, history editing, trigonometry, and a full hardware MODE menu (only NORM/SCI number formatting is implemented) are outside the subset. The calculator does not automatically fill or score a learner's answer.

## Sources and verified sequences

The manufacturer's [official guidebook](https://education.ti.com/html/eguides/scientifics/PDFs/EN/TI-36X-PRO-Guidebook_EN.pdf), pages 10–18, and [percent example](https://education.ti.com/en/customer-support/knowledge-base/scientific-elem-calculators/product-usage/34292) informed the implemented sequence conventions. Primary/secondary labels were checked against the manufacturer's [product image](https://education.ti.com/products/calculators/scientific-calculators/ti-36x-pro).

- Square root: `2nd`, `x²`, value, `enter`.
- Percent: value, `2nd`, `÷`, then the remaining operation.
- Fraction: a plain numerator, `n/d`, denominator, `→` (a number typed before `n/d` becomes the numerator); for a numerator with operations, `n/d`, numerator, `↓`, denominator, `→`.
- Mixed entry: whole, `2nd`, `7` (the `Un/d` template over the 7 key), numerator, `↓`, denominator, `→`. Starting with `2nd`, `7`, whole, `→` also works.
- Mixed conversion: evaluated result, `math`, `1`, `enter`.
- Last answer: `2nd`, `(−)`; a leading binary operation also starts with Ans.
- Scientific formatting: evaluate the number, then `mode`, `↓`, `→`, `enter`, `clear`, `enter` to select SCI and return to the calculation. Scientific lessons retain ×10ⁿ and also offer EE and SCI walkthroughs.
- Powers use an exponent field; `→` leaves it. Nested powers are right-associated, while repeated square keys square the previous square.

## Numerical limits

Arithmetic uses the app's exact BigInt rational core. Non-square roots and pi are explicitly approximate; root approximations retain 14 significant digits and decimal results display up to 10. Limits include 16 digits per entered number, integer exponents −30…30, 12 template levels, 200 tokens per field, and bounded intermediate rational sizes. Unsupported or non-real operations produce recoverable errors. This subset does not promise the device's complete symbolic output, precision implementation, or editing behaviour.

Keyboard numbers, `.`, `+`, `-`, `*`, `/`, `=`, Enter, delete/backspace and cursor keys work while the calculator is open. Typing in inputs, textareas, selects, editable content, and dialogs remains with that control. Escape hides the calculator. There is no network, backend, or external runtime dependency.

Scientific notation has separate ×10ⁿ, EE, and SCI-display walkthroughs. The subset's MODE screen implements NORM/SCI number formatting only, preserving the documented down/right/enter/clear sequence. The fraction landing example explicitly enters n/d templates. Landing auto-play includes the key sequence before advancing; manual key controls pause auto-advance. Hiding the calculator pauses a running tutorial.

The demo and practice question panes stay in the same position when the calculator opens or closes. Desktop space reservation applies only to the curriculum page.

## Trigonometry (Grades 9–10)

`sin`, `cos` and `tan` follow the manufacturer's multi-tap behaviour: one press enters the function, pressing the same key again straight away selects the inverse, and `enter` closes any open bracket. The angle mode defaults to DEG; `MODE`, `→`, `enter`, `clear` selects RAD and `MODE`, `enter`, `clear` confirms DEG. Results that are not exact are marked approximate. A trigonometry walkthrough starts with the vendor-recommended angle check and shows sin, cos and tan together, with the decimal point and brackets. The calculator is recommended for trigonometry, powers, scientific notation, compound interest, π volumes, conversions and the quadratic formula, and is not recommended for expanding, factoring, simplifying or mental angle sums. Data lists and one-variable statistics are not simulated.

