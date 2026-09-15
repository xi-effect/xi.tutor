# RU School Math alignment — v0.3

v0.3 turns the golden corpus into a Russia-first dataset for sovlium.

## Source baseline

The alignment model is based on the current Russian federal school structure and the official FIPI materials used for state exams. The corpus does **not** copy tasks from FIPI or textbooks; all phrases are synthetic/original and describe school-math mechanics.

Primary references checked for this release:

- FIPI: approved 2026 OGE demo/specification/codifier materials — https://fipi.ru/oge/demoversii-specifikacii-kodifikatory
- FIPI: approved 2026 EGE demo/specification/codifier materials — https://fipi.ru/ege/demoversii-specifikacii-kodifikatory
- FIPI 2026 OGE preparation navigator for mathematics — https://doc.fipi.ru/navigator-podgotovki/navigator-oge/
- FIPI 2026 EGE preparation navigator for mathematics — https://doc.fipi.ru/navigator-podgotovki/navigator-ege/2026/

## Important semantics

`curriculum.alignment = "topic-level"` means that the case belongs to a topic present in the Russian school/exam curriculum. It does **not** claim that the exact wording has a one-to-one official curriculum code.

`grade` is the primary/earliest recommended grade for the case.

`grades[]` lists the grades in which the same visualization mechanic can reasonably recur. This prevents false precision for spiral topics and exam preparation.

`exams[]` is optional and contains only exam families for which the mechanic is relevant:

- `oge`
- `ege_basic`
- `ege_profile`

## Course model

- grades 5–6: `mathematics`
- grades 7–9: `algebra`, `geometry`, `probability_statistics`
- grades 10–11: `algebra_analysis`, `geometry`

## v0.3 additions

The corpus now has exactly **1000** cases.

v0.3 adds Russia-relevant gaps that were weak or absent in v0.2:

- divisibility, prime factorization, GCD/LCM;
- quantities and unit conversion;
- map scale;
- price–quantity–cost;
- distance–speed–time;
- direct and inverse proportion;
- tables, bar charts and pie charts;
- descriptive statistics and frequency tables;
- elementary combinatorics/probability trees;
- geometric transformations;
- triangle similarity;
- Pythagorean theorem;
- coordinate geometry;
- financial percentage models;
- explicit grade 10–11 / EGE-profile derivative, stereometry and financial-math cases.

## Product usage

Use metadata for bank filters, analytics and interpreter coverage, but do not present `topic-level` metadata to users as an official Ministry/FIPI classification code. If sovlium later needs exact curriculum-code filtering, add a separate reviewed `officialRefs[]` field and populate it manually from the relevant codifier/program version.
