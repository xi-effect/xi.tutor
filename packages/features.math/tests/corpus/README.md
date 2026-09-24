# RU Math Visualization Golden Corpus

The v0.3 corpus contains 1000 original Russian-language school-math formulations.

Two statuses are used:

- `regression`: the current deterministic interpreter should already resolve this visualization family;
- `coverage`: desired behavior for future interpreter/renderer modules.

Every case contains Russia-specific metadata: `locale`, `educationSystem`, primary `grade`, `grades[]`, course, topic/subtopic, exam applicability and curriculum alignment level.

The corpus is intentionally **topic-aligned**, not a verbatim copy of FIPI, federal-program or textbook tasks. This avoids copyright/provenance problems and avoids claiming an exact official code where no manual code-level review has been done.

Run:

```bash
pnpm corpus:report
pnpm test
```
