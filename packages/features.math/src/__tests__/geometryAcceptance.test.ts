import { describe, expect, it } from 'vitest';
import {
  angle,
  areCollinear,
  distance,
  expandGeometryConstraints,
  interpretGeometryText,
  solveGeometry,
  type GeometryScene,
} from '../geometry';

function solve(text: string): GeometryScene {
  const model = interpretGeometryText(text);
  expect(model).not.toBeNull();
  const result = solveGeometry(model!);
  expect(result.status).not.toBe('unsatisfiable');
  if (result.status === 'unsatisfiable') throw new Error(result.reason);
  return result.scene;
}

function point(scene: GeometryScene, id: string) {
  const result = scene.points.find((candidate) => candidate.id === id);
  expect(result, `Point ${id}`).toBeDefined();
  return result!;
}

describe('constraint-based geometry acceptance', () => {
  it('строит прямоугольный треугольник по гипотенузе и катету', () => {
    const scene = solve('В треугольнике ABC угол C равен 90°, AB = 10, BC = √19. Найдите cos A.');
    const [a, b, c] = ['A', 'B', 'C'].map((id) => point(scene, id));
    expect(angle(a, c, b)).toBeCloseTo(90, 6);
    expect(distance(a, b) / distance(b, c)).toBeCloseTo(10 / Math.sqrt(19), 6);
    expect(distance(a, c)).toBeCloseTo(9, 6);
    expect(scene.markers.some((marker) => marker.type === 'right_angle')).toBe(true);
    expect(c.y).toBeGreaterThan(a.y);
  });

  it('строит тот же треугольник из LaTeX-формулировки', () => {
    const scene = solve(
      'В треугольнике $ABC$ угол $C$ равен $90^\\circ$, $AB = 10$, $BC = \\sqrt{19}$. Найдите $\\cos A$.',
    );
    const [a, b, c] = ['A', 'B', 'C'].map((id) => point(scene, id));
    expect(angle(a, c, b)).toBeCloseTo(90, 6);
    expect(distance(a, b) / distance(b, c)).toBeCloseTo(10 / Math.sqrt(19), 6);
  });

  it('меняет пропорции при другом известном катете', () => {
    const scene = solve('В треугольнике ABC угол C равен 90°, AB = 10, AC = √51. Найдите sin A.');
    const [a, b, c] = ['A', 'B', 'C'].map((id) => point(scene, id));
    expect(angle(a, c, b)).toBeCloseTo(90, 6);
    expect(distance(a, c)).toBeCloseTo(Math.sqrt(51), 6);
    expect(distance(b, c)).toBeCloseTo(7, 6);
  });

  it('строит два диаметра и использует вписанный угол', () => {
    const text =
      'Отрезки AC и BD — диаметры окружности с центром O. Угол ACB равен 41°. Найдите величину угла AOD.';
    const model = interpretGeometryText(text)!;
    const expanded = expandGeometryConstraints(model);
    expect(
      expanded.constraints.filter((constraint) => constraint.type === 'diameter'),
    ).toHaveLength(2);
    expect(
      expanded.constraints.filter((constraint) => constraint.type === 'point_on_circle'),
    ).toHaveLength(4);

    const scene = solve(text);
    const [a, b, c, d, o] = ['A', 'B', 'C', 'D', 'O'].map((id) => point(scene, id));
    expect(areCollinear(a, o, c)).toBe(true);
    expect(areCollinear(b, o, d)).toBe(true);
    expect(distance(o, a)).toBeCloseTo(distance(o, b), 6);
    expect(distance(o, a)).toBeCloseTo(distance(o, c), 6);
    expect(distance(o, a)).toBeCloseTo(distance(o, d), 6);
    expect(angle(a, c, b)).toBeCloseTo(41, 6);
  });

  it('строит тупой равнобедренный треугольник и внешний угол', () => {
    const scene = solve(
      'В треугольнике ABC стороны AC и BC равны, угол C равен 168°, угол CBD внешний. Найдите величину угла CBD.',
    );
    const [a, b, c, d] = ['A', 'B', 'C', 'D'].map((id) => point(scene, id));
    expect(angle(a, c, b)).toBeCloseTo(168, 5);
    expect(distance(a, c)).toBeCloseTo(distance(b, c), 6);
    expect(areCollinear(a, b, d)).toBe(true);
    expect(scene.markers.some((marker) => marker.type === 'equal_length')).toBe(true);
  });
});
