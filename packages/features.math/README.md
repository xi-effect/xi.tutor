# @xipkg/math-visual-interpreter

> v0.3 — Russia-first school mathematics corpus and visualization interpreter core for sovlium.

The bundled golden corpus contains **1000 original ru-RU formulations** aligned at topic level with the Russian federal school-math structure and FIPI 2026 OGE/EGE exam domains. See `RU_ALIGNMENT.md` for the exact semantics and limitations of this alignment.

Frontend-only semantic interpreter for converting school-math text into typed visualization intents for sovlium board.

## Usage

```ts
import { MathVisualInterpreter, renderIntentOnBoard } from '@xipkg/math-visual-interpreter';

const interpreter = new MathVisualInterpreter();
const suggestions = interpreter.interpret({
  text: 'Постройте график функции y = x^2 - 4*x + 3',
});

if (suggestions[0]) {
  await renderIntentOnBoard(boardAdapter, suggestions[0].intent);
}
```

## Current deterministic coverage

- function graphs (single/multiple basic expressions)
- coordinate points
- one-variable inequalities / number line
- fractions
- ratios
- percentages
- numeric sequences / arithmetic and geometric progression detection
- basic probability tree for coin tosses
- basic plane geometry entities and relations
- formula formatting intent
- explicit arrow diagrams
- timeline-shaped structured text

## Integration rule

Do not let parsers write to the board directly. Keep the chain:

`content -> interpreter -> validated intent -> board adapter -> native board objects`.

Implement `MathVisualizationBoardAdapter` using the existing sovlium graph/shape APIs. The existing function graph object should be reused in `addFunctionGraph`.

## Important

This package is a strong deterministic v0, not a mathematically complete natural-language engine for all 5–11 / OGE / EGE tasks. Full coverage should be expanded module-by-module and tested against a golden corpus. A local/cloud LLM can later be added only as a fallback interpreter that returns the same intent types.

## Golden corpus (v0.2)

The package now ships with a corpus of **840 Russian school-mathematics formulations** in `tests/corpus/`.

- 599 cases are active regression tests for currently supported visualization families.
- 241 cases define the next coverage targets: motion/work/mixture diagrams, unit-circle/trigonometry, derivatives, statistics, sets, vectors and stereometry.

Run:

```bash
pnpm test
pnpm corpus:report
```

The corpus is deliberately split into supported and target behavior. New modules should move cases from `coverage` to `regression` as they become reliable.
