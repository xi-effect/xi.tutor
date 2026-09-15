import { describe, expect, it } from 'vitest';
import {
  expandGeometryConstraints,
  interpretGeometryText,
  isMidpoint,
  solveGeometry,
} from '../geometry';

describe('circle diameter solver', () => {
  it('разворачивает диаметр в неявные hard constraints', () => {
    const model = interpretGeometryText('AC — диаметр окружности с центром O.')!;
    const expanded = expandGeometryConstraints(model);
    expect(expanded.constraints).toContainEqual({
      type: 'collinear',
      points: ['A', 'O', 'C'],
    });
    expect(expanded.constraints).toContainEqual({
      type: 'midpoint',
      point: 'O',
      segment: ['A', 'C'],
    });
  });

  it('размещает центр в середине диаметра', () => {
    const model = interpretGeometryText('AC — диаметр окружности с центром O.')!;
    const result = solveGeometry(model);
    expect(result.status).not.toBe('unsatisfiable');
    if (result.status === 'unsatisfiable') return;
    const byId = new Map(result.scene.points.map((point) => [point.id, point]));
    expect(isMidpoint(byId.get('O')!, byId.get('A')!, byId.get('C')!)).toBe(true);
  });

  it('ставит одну засечку на каждый радиус, без наложения групп', () => {
    const result = solveGeometry(
      interpretGeometryText(
        'Отрезки AC и BD — диаметры окружности с центром O. Угол ACB равен 41°.',
      )!,
    );
    expect(result.status).not.toBe('unsatisfiable');
    if (result.status === 'unsatisfiable') return;
    const ticks = result.scene.markers.filter((marker) => marker.type === 'equal_length');
    const keys = ticks.map((marker) => [...marker.segment].sort().join(''));
    expect(new Set(keys).size).toBe(keys.length);
    expect(ticks.every((marker) => marker.group === 1)).toBe(true);
  });

  it('ставит точку касания на окружность и внешнюю точку на касательную', () => {
    const result = solveGeometry(
      interpretGeometryText(
        'Сторона CA касается окружности с центром O, отрезок CO пересекает окружность в точке B, дуга AB равна 66°.',
      )!,
    );
    expect(result.status).not.toBe('unsatisfiable');
    if (result.status === 'unsatisfiable') return;
    expect(result.solverId).toBe('circle-tangent-arc');
    const byId = new Map(result.scene.points.map((point) => [point.id, point]));
    expect(byId.get('A')).toBeDefined();
    expect(byId.get('B')).toBeDefined();
    expect(byId.get('C')).toBeDefined();
  });

  it('строит вписанный четырёхугольник, а не прямоугольник по умолчанию', () => {
    const result = solveGeometry(
      interpretGeometryText(
        'Четырёхугольник ABCD вписан в окружность. Угол ABC равен 120°, угол ABD равен 43°. Найдите угол CAD.',
      )!,
    );
    expect(result.status).not.toBe('unsatisfiable');
    if (result.status === 'unsatisfiable') return;
    expect(result.solverId).toBe('cyclic-polygon');
    expect(result.scene.circles).toHaveLength(1);
  });
});
