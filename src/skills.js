import katex from 'katex';
import 'katex/dist/katex.min.css';
import './style.css';
import {solve} from './solver.js';

// Examples document every supported rule; formulas and captions come from the solver.
const skills = [
  ['Addition', '2 + 3', 'Two signed whole numbers or decimals joined by +.', 'Combine the two exact amounts and reduce the result.'],
  ['Subtraction', '9 - 4', 'Two signed whole numbers or decimals joined by −.', 'Subtract the second amount from the first. Negative answers are allowed.'],
  ['Subtraction: bridge a ten', '23 - 8', 'Positive whole numbers where subtracting a one-digit number crosses the previous ten, and the first number has a nonzero ones digit.', 'Split the amount being subtracted: 8 becomes 3 + 5. Subtract 3 to reach 20, then subtract 5.'],
  ['Multiplication', '6 × 4', 'Two signed whole numbers or decimals joined by ×, x, *, \\times, or \\cdot.', 'Multiply the numerators and denominators of the exact amounts, then reduce.'],
  ['Division / a single fraction', '6 / 8', 'Two signed whole numbers or decimals joined by /, ÷, or \\div; also a standalone \\frac{6}{8}. The divisor must be nonzero.', 'Divide by multiplying by the reciprocal of the second amount. Reduce the fraction: 6/8 becomes 3/4. A single slash means division.'],
  ['Three-number addition', '8 + 2 + 5', 'Exactly three signed whole numbers or decimals joined by +.', 'Two methods are available: combine the first pair, or group and combine the last pair. Both preserve the total.'],
  ['Multiply, then add', '2 + 3 × 4', 'Exactly a + b × c, with signed whole numbers or decimals.', 'Replace only 3 × 4 with its product, 12. Keep 2 + in place. Then replace 2 + 12 with 14. Blue follows the product.'],
  ['Add two fractions', '1/2 + 2/3', 'Exactly a/b + c/d with signed integer numerators and nonzero integer denominators. LaTeX fractions also work.', 'Reduce each fraction internally. Find the least common denominator (6 here). Scale each numerator and denominator by the same number: 1/2 becomes 3/6 and 2/3 becomes 4/6. Combine the numerators, keep the denominator, then reduce the answer. Blue and orange follow the two fractions.'],
  ['Exact decimals', '0.5 + 0.25', 'Decimals work in two-number arithmetic, three-number addition, and a + b × c. This is a number format, not an additional operation.', 'Convert each decimal to an exact fraction: 0.5 becomes 1/2 and 0.25 becomes 1/4. Apply the matching arithmetic rule. The result stays exact: 3/4.'],
];

const app = document.querySelector('#app');
app.innerHTML = `<main class="reference"><nav><a href="./">← Questions</a></nav><h1>Math skills & captions</h1><p>Every rule the current solver supports. The examples below are calculated by the same solver as the lesson. Each caption is the exact text returned for that example.</p><section><h2>How a formula becomes steps</h2><ol><li>Normalize supported symbols: ×, x, and LaTeX multiplication become the same operation. Remove whitespace.</li><li>Match one of the limited patterns below. No input is run as code, and no LLM solves the question.</li><li>Store numbers as exact integer fractions. Use explicit arithmetic rules to create a list of equivalent formulas and caption text.</li><li>Render each formula with KaTeX. Next step or Play appends the next line, adds an equals sign, and replaces the current caption. The browser animates only the new line; reduced-motion preferences turn that animation off.</li></ol><p>Captions are predefined sentences or templates with calculated values inserted. They are not generated freely. Expand “Formula source” to see the LaTeX passed to the renderer.</p></section><div id="catalog"></div><section><h2>Current limits</h2><p>This is a small arithmetic solver for real numbers, not a general algebra or LaTeX engine. Variables, powers, roots, arbitrary parentheses, other mixed-operation patterns, and sums of more than two fractions are unsupported. Division by zero and unsupported input are rejected. Inputs are limited to 120 characters.</p><p>The lesson page intentionally shows only the two sample questions. This page documents the additional rules already available in the solver.</p></section></main>`;

for (const [title, input, pattern, transformation] of skills) {
  const section = document.createElement('section');
  const heading = document.createElement('h2');
  heading.textContent = title;
  section.append(heading);
  for (const [label, text] of [['Supported input', pattern], ['Transformation', transformation]]) {
    const paragraph = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = `${label}: `;
    paragraph.append(strong, text);
    section.append(paragraph);
  }
  const example = document.createElement('p');
  example.textContent = `Example input: ${input}`;
  section.append(example);
  for (const method of solve(input).methods) {
    const name = document.createElement('h3');
    name.textContent = method.name;
    section.append(name);
    for (const [index, step] of method.steps.entries()) {
      const row = document.createElement('div');
      row.className = 'reference-step';
      const math = document.createElement('div');
      math.className = 'step';
      for (const [className, formula] of [['equals', index ? '=' : '\\phantom{=}'], ['math', step.math]]) {
        const cell = document.createElement('div');
        cell.className = className;
        katex.render(formula, cell, {displayMode:true, throwOnError:true, trust:false});
        math.append(cell);
      }
      const caption = document.createElement('p');
      caption.className = 'reference-caption';
      caption.textContent = step.text;
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'Formula source';
      const code = document.createElement('code');
      code.textContent = step.math;
      details.append(summary, code);
      row.append(math, caption, details);
      section.append(row);
    }
  }
  document.querySelector('#catalog').append(section);
}
