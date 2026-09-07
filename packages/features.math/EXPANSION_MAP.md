# Coverage expansion map

The current code is a deterministic foundation. Expand with separate modules rather than one giant parser.

## 5–6

- natural-number number line
- decimal/fraction comparison
- mixed fractions
- percentage of a number / number by percentage
- ratio/proportion
- scale
- rectangular area/perimeter
- volume/cuboid
- simple angle diagrams

## 7–9 algebra

- linear/quadratic functions
- inverse proportionality
- systems of functions
- linear/quadratic/rational inequalities
- systems of inequalities
- roots and powers
- arithmetic/geometric progressions
- algebraic transformations
- systems of equations

## 7–9 geometry

- triangles and classifications
- congruence/similarity marks
- medians/bisectors/altitudes
- parallel lines + transversal angles
- quadrilaterals
- circle/chord/tangent/secant
- inscribed/central angles
- coordinate geometry
- vectors

## 10–11 / EGE

- trig functions/unit circle
- logarithmic/exponential functions
- derivatives/tangent/monotonicity
- extrema and sign charts
- piecewise functions
- probability trees/combinatorics
- word-problem schemas: motion, work, mixtures, percentages
- stereometry projected diagrams
- vectors in 3D

For natural-language word problems, prefer an LLM fallback that emits the same strict intent schemas rather than trying to encode every Russian phrasing as regex.

## Corpus-driven expansion

`tests/corpus/mathVisualizationCorpus.ts` is now the source of truth for interpreter expansion. The next implementation milestones should be driven by the `coverage` cases rather than ad-hoc regex additions.

Recommended order based on usefulness for tutoring:

1. motion / rate / distance diagrams;
2. work-rate and mixture diagrams;
3. richer plane geometry semantics and layout;
4. vector diagrams;
5. unit circle and trigonometry;
6. derivative / monotonicity visualization;
7. statistics charts and set diagrams;
8. stereometry projections.
