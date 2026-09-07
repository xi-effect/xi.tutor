# Coverage implementation status

Статус интеграции `features.math` в доску `modules.board` на момент подключения интерпретатора.

Corpus: **1000** формулировок (599 regression / 401 coverage). В runtime corpus **не** импортируется — только `MathVisualInterpreter` из `features.math`.

| Intent/topic                        | Interpreter                | Renderer             | Board primitives                        | Status  |
| ----------------------------------- | -------------------------- | -------------------- | --------------------------------------- | ------- |
| Function graph                      | ✅                         | ✅                   | `coordinate-axes`                       | ready   |
| Coordinate points                   | ✅                         | ✅                   | `coordinate-axes`, ellipse, text, arrow | ready   |
| Number line                         | ✅                         | ✅                   | arrow, ellipse, text                    | ready   |
| Formula                             | ✅                         | ✅                   | text                                    | ready   |
| Geometry (triangle/circle/altitude) | partial                    | partial              | `math-figure`, text, arrow              | partial |
| Fraction model                      | ✅                         | ✅                   | `xi-geo` rectangle, text                | ready   |
| Ratio                               | ✅                         | ✅                   | `xi-geo` rectangle, text                | ready   |
| Percent bar                         | ✅                         | ✅                   | `xi-geo` rectangle, text                | ready   |
| Sequence                            | ✅                         | ✅                   | text, arrow                             | ready   |
| Probability tree (coin)             | partial                    | partial              | `xi-geo`, arrow                         | partial |
| Diagram (A → B)                     | ✅                         | ✅                   | `xi-geo`, arrow                         | ready   |
| Timeline                            | ✅                         | ✅                   | arrow, text                             | ready   |
| Motion / rate / distance            | corpus only                | ❌                   | —                                       | planned |
| Work-rate diagrams                  | corpus only                | ❌                   | —                                       | planned |
| Mixture diagrams                    | corpus only                | ❌                   | —                                       | planned |
| Unit circle / trigonometry          | corpus only                | ❌                   | —                                       | planned |
| Derivative / monotonicity           | corpus only                | ❌                   | —                                       | planned |
| Statistics charts                   | corpus only                | ❌                   | —                                       | planned |
| Set diagrams                        | corpus only                | ❌                   | —                                       | planned |
| Vectors                             | corpus only                | ❌                   | existing vector template unused         | planned |
| Stereometry / solids                | corpus only                | ❌                   | `math-figure` cube/pyramid/cone unused  | planned |
| Inequality systems                  | ❌                         | ❌                   | number line only for one variable       | planned |
| Inverse / log / exp graphs          | partial via function_graph | ✅ if `y = …` parsed | `coordinate-axes`                       | partial |

## Следующие 10 модулей для репетиторов РФ

Не реализованы автоматически: для них нужны новые семантики интерпретатора и/или отдельные board-объекты, а не improvised заглушки.

1. **Схемы движения** (путь / скорость / время, встречное движение).
2. **Схемы работы и смеси** (трубы, сплавы, растворы).
3. **Более точный чертёж планиметрии** (высота/медиана/биссектрисса в координатах, равные отрезки).
4. **Векторы на плоскости** (существующий шаблон вектора + подписи).
5. **Тригонометрический круг** и знаки функций.
6. **Касательная / производная / промежутки монотонности**.
7. **Системы неравенств** на координатной плоскости.
8. **Статистика**: столбцы, медианы, диаграммы (без нового chart-движка, если хватит geo+text).
9. **Стереометрия**: проекции куба/пирамиды на базе `math-figure`.
10. **Кусочные и показательные/логарифмические функции** в том же `coordinate-axes`.
