import { describe, expect, it } from 'vitest';
import {
  distance,
  interpretGeometryText,
  solveGeometry,
  type GeometrySemanticModel,
} from '../geometry';

describe('triangle solvers', () => {
  it('не строит невозможный треугольник', () => {
    const model = interpretGeometryText('В треугольнике ABC AB = 3, BC = 4, AC = 10.')!;
    const result = solveGeometry(model);
    expect(result.status).toBe('unsatisfiable');
  });

  it('fallback равнобедренного треугольника сохраняет равные стороны', () => {
    const model = interpretGeometryText('Дан треугольник ABC, AB = AC.')!;
    const result = solveGeometry(model);
    expect(result.status).not.toBe('unsatisfiable');
    if (result.status === 'unsatisfiable') return;
    const byId = new Map(result.scene.points.map((point) => [point.id, point]));
    expect(distance(byId.get('A')!, byId.get('B')!)).toBeCloseTo(
      distance(byId.get('A')!, byId.get('C')!),
      6,
    );
  });

  it('учитывает заданный угол при вершине равнобедренного треугольника', () => {
    const model = interpretGeometryText(
      'В треугольнике ABC стороны AC и BC равны, угол C равен 168°.',
    )!;
    const result = solveGeometry(model);
    expect(result.status).not.toBe('unsatisfiable');
    if (result.status === 'unsatisfiable') return;
    expect(result.solverId).toBe('isosceles-triangle');
  });

  it('structured debug показывает выбранную стратегию', () => {
    const model: GeometrySemanticModel = interpretGeometryText(
      'В треугольнике ABC угол C равен 90°.',
    )!;
    const result = solveGeometry(model, { debug: true, input: 'test' });
    expect(result.debug?.selectedSolver).toBe('right-triangle');
    expect(result.debug?.expandedModel).toBeDefined();
  });
});
