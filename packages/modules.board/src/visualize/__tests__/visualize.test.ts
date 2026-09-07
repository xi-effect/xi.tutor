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
  });

  it('не предлагает заведомо невозможный треугольник', () => {
    const suggestions = getVisualizationSuggestions('В треугольнике ABC AB = 3, BC = 4, AC = 10.');
    expect(suggestions.some((item) => item.intent.type === 'geometry')).toBe(false);
  });

  it('не предлагает визуализацию для обычного текста', () => {
    expect(getVisualizationSuggestions('Сегодня мы изучаем новую тему')).toEqual([]);
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
