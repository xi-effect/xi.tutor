# QA REPORT — historical archetypes drop-in patch

Release: `math-bank-21000-2026-09-10`

## Result

- previous bank: **9 000** tasks;
- added: **12 000** tasks;
- resulting bank: **21 000** tasks;
- unique IDs: **21 000 / 21 000**;
- unique fingerprints: **21 000 / 21 000**;
- generator families: **360**;
- tasks with structured `figure`: **3466**;
- structural/consistency QA errors: **0**;
- search documents: **21 000**;
- grade-shard total: **21 000**.

## Regression

The previous TypeScript archive was used as the baseline.

- first 9 000 canonical task objects: **unchanged by parsed JSON deep comparison**;
- first 9 000 generated runtime task objects: **unchanged by parsed JSON deep comparison**;
- changed old task IDs: **0**;
- first new ID: `math-ru-09001`;
- last new ID: `math-ru-21000`.

Note: gzip bytes / JSON textual representation are not expected to be byte-identical after rebuilding because JSON number formatting and compression metadata may differ. The parsed objects are equivalent.

## New tasks by grade

| Grade | Added | Total |
| ----: | ----: | ----: |
|     5 |  1200 |  2320 |
|     6 |  1500 |  2730 |
|     7 |  1800 |  3145 |
|     8 |  1900 |  3350 |
|     9 |  2100 |  3650 |
|    10 |  1600 |  2700 |
|    11 |  1900 |  3105 |

## Difficulty distribution

| Difficulty | Added | Total |
| ---------: | ----: | ----: |
|          1 |     0 |  1015 |
|          2 |     0 |  4271 |
|          3 |  3883 |  5423 |
|          4 |  4291 |  5567 |
|          5 |  3826 |  4724 |

## Additional release checks

- `+-`: 0 occurrences in generated statements/solutions;
- coefficient `1x`: 0 occurrences;
- `x+0`: 0 occurrences;
- `--`: 0 occurrences;
- new level-5 trigonometric triangle tasks checked by generator invariants: **112**, errors: **0**;
- all 12 000 new task fingerprints are unique.

`node --experimental-strip-types scripts/build-bank.ts` and `node --experimental-strip-types scripts/qa-bank.ts` were used in the packaging environment. In the frontend repository use the existing `tsx`/`pnpm` commands from the previous TypeScript integration.

Automated QA does not replace pedagogical review of every generated family.
