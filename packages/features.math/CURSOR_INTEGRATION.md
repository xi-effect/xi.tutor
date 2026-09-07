# Cursor integration task for sovlium

Integrate `@xipkg/math-visual-interpreter` into the existing sovlium board.

## Hard requirements

1. Inspect existing board implementation before writing new shapes.
2. Reuse the existing function graph object in `MathVisualizationBoardAdapter.addFunctionGraph`.
3. Reuse existing text, line, arrow, shape, grouping and math-rendering APIs wherever possible.
4. Do not make interpreters import board stores or shape classes.
5. Keep pipeline: selected content -> MathVisualInterpreter -> suggestion UI -> validated intent -> board adapter -> native objects.
6. No backend and no network requests.
7. Never render the visualization as a screenshot/image when native objects can represent it.

## UX

When one or more text/math elements are selected, add contextual action `Визуализировать`.

Call:

```ts
const suggestions = interpreter.interpret({
  text: selectedText,
  latex: selectedLatex,
});
```

If there is exactly one suggestion with confidence >= 0.9, the menu may show its direct action (`Построить график`, etc.). Otherwise show a submenu with the top suggestions.

On selection:

```ts
await renderIntentOnBoard(boardAdapter, suggestion.intent);
```

Place the result to the right of the current selection or at a free point near the viewport. Group compound visualizations if the board supports groups.

## First integration order

1. `function_graph` -> existing graph shape.
2. `coordinate_points` -> coordinate plane + native points/labels.
3. `formula` -> existing math/LaTeX-capable content.
4. `number_line` -> native lines/points/labels.
5. `geometry` -> native shapes and relation markers.
6. fractions/percent/ratio/sequence/probability visualizations.

## Geometry layout

The interpreter intentionally returns semantic geometry rather than absolute coordinates. Implement layout in the adapter/geometry renderer. Start with conventional readable layouts, not exact-to-scale reconstruction unless constraints require it.

Examples:

- generic triangle: A left-bottom, B top, C right-bottom;
- isosceles/equal-side relation: adjust layout to visually respect relation;
- altitude: calculate foot on target segment and add right-angle marker;
- median: calculate midpoint and add equal-segment ticks;
- circle: center + radius/through-point constraints.

Unknown/contradictory constraints must fail gracefully and not create corrupt board objects.

## Testing

Keep package tests and add integration tests for each adapter method. Add a golden corpus as new real tutor phrases appear. Every bug report should become a regression fixture.
