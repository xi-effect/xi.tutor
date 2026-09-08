import { describe, expect, it } from 'vitest';
import { getVisualizationSuggestions } from '../getVisualizationSuggestions';
import {
  getMathGraphExpressions,
  mapFunctionGraphIntent,
  mapNumberLineIntent,
} from '../mapMathIntent';
import { validateVisualizationIntent } from '../intent/validateIntent';
import { canRenderMathIntent } from '../renderers/mathRegistry';
import { getGeometryScene } from '../renderers/geometryRenderer';
import { VISUALIZE_MIN_CONFIDENCE } from '../constants';
import { angle, distance } from 'features.math';

describe('features.math → board suggestions', () => {
  it('находит график функции y = x² - 4x + 3', () => {
    const suggestions = getVisualizationSuggestions('Постройте график функции y = x² - 4x + 3');
    const graph = suggestions.find((item) => item.intent.type === 'function_graph');
    expect(graph).toBeDefined();
    expect(graph?.label).toBe('Построить график');
    expect(graph?.confidence).toBeGreaterThan(VISUALIZE_MIN_CONFIDENCE);
    if (graph?.intent.type !== 'function_graph') return;
    expect(getMathGraphExpressions(graph.intent)).toEqual(['x^2 - 4x + 3']);
    expect(canRenderMathIntent(graph.intent)).toBe(true);
  });

  it('нормализует LaTeX и хвост предложения для графика', () => {
    const suggestions = getVisualizationSuggestions(
      'Постройте график функции y = x^{2} - 4x + 3 и найдите корни',
    );
    const graph = suggestions.find((item) => item.intent.type === 'function_graph');
    expect(graph).toBeDefined();
    if (graph?.intent.type !== 'function_graph') return;
    expect(getMathGraphExpressions(graph.intent)).toEqual(['x^(2) - 4x + 3']);
    expect(mapFunctionGraphIntent(graph.intent)?.expressions).toEqual(['x^(2) - 4x + 3']);
  });

  it('нормализует невидимое умножение в выражении графика', () => {
    const suggestions = getVisualizationSuggestions(`y = x^2 - 4\u2062x + 3`);
    const graph = suggestions.find((item) => item.intent.type === 'function_graph');
    expect(graph).toBeDefined();
    if (graph?.intent.type !== 'function_graph') return;
    expect(mapFunctionGraphIntent(graph.intent)?.expressions[0]).toBe('x^2 - 4x + 3');
  });

  it('распознаёт f(x) = sin(x)', () => {
    const suggestions = getVisualizationSuggestions('f(x) = sin(x)');
    const graph = suggestions.find((item) => item.intent.type === 'function_graph');
    expect(graph).toBeDefined();
    if (graph?.intent.type !== 'function_graph') return;
    expect(getMathGraphExpressions(graph.intent)).toEqual(['sin(x)']);
  });

  it('собирает координатные точки A(2; 3), B(-1; 4)', () => {
    const suggestions = getVisualizationSuggestions('Отметьте точки A(2; 3), B(-1; 4)');
    const points = suggestions.find((item) => item.intent.type === 'coordinate_points');
    expect(points).toBeDefined();
    if (points?.intent.type !== 'coordinate_points') return;
    expect(points.intent.points).toEqual([
      { name: 'A', x: 2, y: 3 },
      { name: 'B', x: -1, y: 4 },
    ]);
    expect(canRenderMathIntent(points.intent)).toBe(true);
  });

  it('распознаёт неравенство для числовой прямой', () => {
    const suggestions = getVisualizationSuggestions('-2 ≤ x < 5');
    const line = suggestions.find((item) => item.intent.type === 'number_line');
    expect(line).toBeDefined();
    if (line?.intent.type !== 'number_line') return;
    expect(mapNumberLineIntent(line.intent)).toMatchObject({
      start: { value: -2, inclusive: true },
      end: { value: 5, inclusive: false },
    });
    expect(canRenderMathIntent(line.intent)).toBe(true);
  });

  it('распознаёт геометрию с высотой в треугольнике', () => {
    const suggestions = getVisualizationSuggestions(
      'В треугольнике ABC проведена высота BH к стороне AC',
    );
    const geometry = suggestions.find((item) => item.intent.type === 'geometry');
    expect(geometry).toBeDefined();
    expect(geometry?.label).toBe('Построить чертёж');
    if (geometry?.intent.type !== 'geometry') return;
    expect(geometry.intent.model.entities.some((entity) => entity.type === 'triangle')).toBe(true);
    expect(
      geometry.intent.model.constraints.some((constraint) => constraint.type === 'altitude'),
    ).toBe(true);
    expect(canRenderMathIntent(geometry.intent)).toBe(true);
  });

  it('передаёт constraints в board scene вместо template-треугольника', () => {
    const suggestions = getVisualizationSuggestions(
      'В треугольнике ABC угол C равен 90°, AB = 10, BC = √19. Найдите cos A.',
    );
    const geometry = suggestions.find((item) => item.intent.type === 'geometry');
    expect(geometry).toBeDefined();
    if (geometry?.intent.type !== 'geometry') return;
    const scene = getGeometryScene(geometry.intent);
    expect(scene).not.toBeNull();
    const byId = new Map(scene!.points.map((point) => [point.id, point]));
    expect(angle(byId.get('A')!, byId.get('C')!, byId.get('B')!)).toBeCloseTo(90, 6);
    expect(
      distance(byId.get('A')!, byId.get('B')!) / distance(byId.get('B')!, byId.get('C')!),
    ).toBeCloseTo(10 / Math.sqrt(19), 6);
    expect(scene?.markers.some((marker) => marker.type === 'right_angle')).toBe(true);
  });

  it('предлагает чертёж для задачи с инлайн-LaTeX', () => {
    const suggestions = getVisualizationSuggestions(
      'В треугольнике ABC угол C равен 90^\\circ, AB = 10, BC = \\sqrt{19}. Найдите \\cos A.',
    );
    expect(suggestions.some((item) => item.intent.type === 'geometry')).toBe(true);
  });

  it('предлагает чертёж для LaTeX как на доске, включая 19. в корне', () => {
    const suggestions = getVisualizationSuggestions(
      'В треугольнике ABC угол C равен 90^{\\circ}, AB = 10, BC = \\sqrt{19.}. Найдите \\cos A.',
    );
    expect(suggestions.some((item) => item.intent.type === 'geometry')).toBe(true);
  });

  it('не теряет точки второго диаметра в board scene', () => {
    const suggestions = getVisualizationSuggestions(
      'Отрезки AC и BD — диаметры окружности с центром O. Угол ACB равен 41°.',
    );
    const geometry = suggestions.find((item) => item.intent.type === 'geometry');
    if (geometry?.intent.type !== 'geometry') throw new Error('Geometry suggestion is missing');
    const scene = getGeometryScene(geometry.intent);
    expect(scene?.points.map((point) => point.id).sort()).toEqual(['A', 'B', 'C', 'D', 'O']);
    expect(scene?.circles).toHaveLength(1);
    const vertex = scene!.points.find((point) => point.id === 'C')!;
    const angleLabel = scene!.labels.find((label) => label.text === '41°');
    expect(angleLabel?.kind).toBe('angle');
    const labelCenter = {
      x: vertex.x + angleLabel!.offset.x + 18,
      y: vertex.y + angleLabel!.offset.y + 9,
    };
    expect(Math.hypot(labelCenter.x - vertex.x, labelCenter.y - vertex.y)).toBeGreaterThan(40);
  });

  it('не предлагает заведомо невозможный треугольник', () => {
    const suggestions = getVisualizationSuggestions('В треугольнике ABC AB = 3, BC = 4, AC = 10.');
    expect(suggestions.some((item) => item.intent.type === 'geometry')).toBe(false);
  });

  it('не предлагает визуализацию для обычного текста', () => {
    expect(getVisualizationSuggestions('Сегодня мы изучаем новую тему')).toEqual([]);
  });

  it('строит прямоугольный треугольник по катетам без букв', () => {
    const suggestions = getVisualizationSuggestions('Прямоугольный треугольник с катетами 3 и 4');
    const geometry = suggestions.find((item) => item.intent.type === 'geometry');
    expect(geometry).toBeDefined();
    if (geometry?.intent.type !== 'geometry') return;
    const scene = getGeometryScene(geometry.intent);
    expect(scene).not.toBeNull();
    const byId = new Map(scene!.points.map((point) => [point.id, point]));
    const right = scene!.markers.find((marker) => marker.type === 'right_angle');
    expect(right?.type).toBe('right_angle');
    if (right?.type === 'right_angle') {
      const [first, vertex, second] = right.points.map((id) => byId.get(id)!);
      expect(angle(first, vertex, second)).toBeCloseTo(90, 6);
    }
    expect(scene?.labels.some((label) => label.text === '3' || label.text === '4')).toBe(true);
  });

  it('не предлагает дробь для геометрической длины 3/4', () => {
    const suggestions = getVisualizationSuggestions('В треугольнике ABC AB = 3/4.');
    expect(suggestions.some((item) => item.intent.type === 'fraction_model')).toBe(false);
  });

  it('собирает чертёж по живым формулировкам с доски', () => {
    const obtuse = getVisualizationSuggestions(
      'В треугольнике ABC стороны AC и BC равны, угол C равен 168°, угол CBD внешний. Найдите величину угла CBD.',
    );
    const obtuseGeometry = obtuse.find((item) => item.intent.type === 'geometry');
    expect(obtuseGeometry).toBeDefined();
    if (obtuseGeometry?.intent.type !== 'geometry') return;
    const obtuseScene = getGeometryScene(obtuseGeometry.intent);
    const obtuseById = new Map(obtuseScene!.points.map((point) => [point.id, point]));
    expect(angle(obtuseById.get('A')!, obtuseById.get('C')!, obtuseById.get('B')!)).toBeCloseTo(
      168,
      5,
    );
    expect(obtuseScene?.points.some((point) => point.id === 'D')).toBe(true);

    const diameters = getVisualizationSuggestions(
      'Отрезки A C и B D — диаметры окружности с центром O. Угол A C B равен 41°.',
    );
    const diameterGeometry = diameters.find((item) => item.intent.type === 'geometry');
    expect(diameterGeometry).toBeDefined();
    if (diameterGeometry?.intent.type !== 'geometry') return;
    const diameterScene = getGeometryScene(diameterGeometry.intent);
    expect(diameterScene?.points.map((point) => point.id).sort()).toEqual(['A', 'B', 'C', 'D', 'O']);

    const tangent = getVisualizationSuggestions(
      'Найдите величину угла ACO, если его сторона CA касается окружности с центром O, отрезок CO пересекает окружность в точке B, а дуга AB равна 66°.',
    );
    const tangentGeometry = tangent.find((item) => item.intent.type === 'geometry');
    expect(tangentGeometry).toBeDefined();
    if (tangentGeometry?.intent.type !== 'geometry') return;
    const tangentScene = getGeometryScene(tangentGeometry.intent);
    expect(tangentScene?.points.map((point) => point.id).sort()).toEqual(['A', 'B', 'C', 'O']);
    expect(tangentScene?.circles).toHaveLength(1);

    const cyclic = getVisualizationSuggestions(
      'Четырёхугольник ABCD вписан в окружность. Угол ABC равен 120°, угол ABD равен 43°. Найдите угол CAD.',
    );
    const cyclicGeometry = cyclic.find((item) => item.intent.type === 'geometry');
    expect(cyclicGeometry).toBeDefined();
    if (cyclicGeometry?.intent.type !== 'geometry') return;
    const cyclicScene = getGeometryScene(cyclicGeometry.intent);
    expect(cyclicScene?.circles).toHaveLength(1);
    const cyclicById = new Map(cyclicScene!.points.map((point) => [point.id, point]));
    expect(angle(cyclicById.get('A')!, cyclicById.get('B')!, cyclicById.get('C')!)).toBeCloseTo(
      120,
      5,
    );
    expect(angle(cyclicById.get('A')!, cyclicById.get('B')!, cyclicById.get('D')!)).toBeCloseTo(43, 5);

    const cevians = getVisualizationSuggestions(
      'Острый угол B прямоугольного треугольника ABC равен 9°. Найдите величину угла между высотой CH и медианой CM, проведёнными из вершины прямого угла C.',
    );
    const cevianGeometry = cevians.find((item) => item.intent.type === 'geometry');
    expect(cevianGeometry).toBeDefined();
    if (cevianGeometry?.intent.type !== 'geometry') return;
    const cevianScene = getGeometryScene(cevianGeometry.intent);
    const cevianById = new Map(cevianScene!.points.map((point) => [point.id, point]));
    expect(
      angle(cevianById.get('A')!, cevianById.get('C')!, cevianById.get('B')!),
    ).toBeCloseTo(90, 5);
    expect(
      angle(cevianById.get('A')!, cevianById.get('B')!, cevianById.get('C')!),
    ).toBeCloseTo(9, 5);
    expect(cevianById.get('H')).toBeDefined();
    expect(cevianById.get('M')).toBeDefined();
  });
});

describe('validateVisualizationIntent', () => {
  it('нормализует одиночное expression в expressions', () => {
    const result = validateVisualizationIntent({
      type: 'function_graph',
      expression: 'x^2',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.intent.type).toBe('function_graph');
    if (result.intent.type === 'function_graph') {
      expect(result.intent.expressions).toEqual(['x^2']);
    }
  });

  it('отклоняет пустой intent', () => {
    expect(validateVisualizationIntent({ type: 'function_graph' }).ok).toBe(false);
  });
});
