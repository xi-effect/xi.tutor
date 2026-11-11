# Historical archetype expansion

This patch expands the sovlium mathematics bank using classical mathematical archetypes from works associated with A. P. Kiselev, N. A. Rybkin, N. A. Shaposhnikov and N. K. Valtsov.

The historical books are **not copied into the product**. The pipeline uses task archetypes only: the mathematical construction or skill pattern is identified, after which sovlium generates new parameters, wording, answers and step-by-step solutions.

The runtime task objects explicitly keep `copiedFromExternalBank: false`. Detailed internal provenance for the 210 historical archetypes is stored in `content/historical_provenance.json.gz`.

New tasks are mapped to the existing Russian curriculum taxonomy and to the existing versioned OGE/EGE metadata model. A historical source does not determine the modern grade/exam mapping.

The new content is concentrated on difficulty levels 3–5 and includes arithmetic/ratio archetypes, algebraic transformations and equations, planimetry, stereometry, trigonometry, sequences, probability, calculus and parameter problems.
