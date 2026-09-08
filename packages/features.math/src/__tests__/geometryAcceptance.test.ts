import { describe, expect, it } from 'vitest';
import {
  angle,
  areCollinear,
  distance,
  expandGeometryConstraints,
  interpretGeometryText,
  normalizeGeometryScene,
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
    expect(scene.measurementLabels?.some((label) => label.text === '10')).toBe(true);
    expect(scene.measurementLabels?.some((label) => label.text.includes('√19'))).toBe(true);
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

  it('строит тот же тупой треугольник из разнесённых букв', () => {
    const scene = solve(
      'В треугольнике A B C стороны A C и B C равны, угол C равен 1 6 8°, угол C B D внешний.',
    );
    expect(angle(point(scene, 'A'), point(scene, 'C'), point(scene, 'B'))).toBeCloseTo(168, 5);
    expect(scene.points.some((candidate) => candidate.id === 'D')).toBe(true);
  });

  it('строит касательную, секущую и дугу 66°', () => {
    const text =
      'Найдите величину угла ACO, если его сторона CA касается окружности с центром O, отрезок CO пересекает окружность в точке B, а дуга AB окружности, заключенная внутри этого угла, равна 66°.';
    const scene = solve(text);
    const [a, b, c, o] = ['A', 'B', 'C', 'O'].map((id) => point(scene, id));
    expect(distance(o, a)).toBeCloseTo(distance(o, b), 6);
    expect(angle(a, o, b)).toBeCloseTo(66, 5);
    expect(Math.abs(angle(o, a, c) - 90)).toBeLessThan(1);
    expect(areCollinear(c, b, o)).toBe(true);
    expect(c.x).toBeCloseTo(a.x, 6);
  });

  it('не теряет диаметры, если буквы точек разнесены пробелами', () => {
    const scene = solve(
      'Отрезки A C и B D - диаметры окружности с центром O. Угол A C B равен 4 1°.',
    );
    const [a, b, c, d, o] = ['A', 'B', 'C', 'D', 'O'].map((id) => point(scene, id));
    expect(areCollinear(a, o, c)).toBe(true);
    expect(areCollinear(b, o, d)).toBe(true);
    expect(angle(a, c, b)).toBeCloseTo(41, 6);
  });

  it('ставит подпись 41° внутри угла, а не на вершине', () => {
    const raw = solve(
      'Отрезки AC и BD — диаметры окружности с центром O. Угол ACB равен 41°.',
    );
    const scene = normalizeGeometryScene(raw, { targetWidth: 360, targetHeight: 300, padding: 36 });
    const vertex = point(scene, 'C');
    const angleLabel = scene.labels.find((label) => label.text === '41°');
    expect(angleLabel).toBeDefined();
    const center = {
      x: vertex.x + angleLabel!.offset.x + 18,
      y: vertex.y + angleLabel!.offset.y + 9,
    };
    expect(Math.hypot(center.x - vertex.x, center.y - vertex.y)).toBeGreaterThan(40);
    expect(center.x).toBeLessThan(vertex.x);
    const letter = scene.labels.find((label) => label.point === 'C' && label.kind === 'point');
    expect(letter).toBeDefined();
    const letterCenter = {
      x: vertex.x + letter!.offset.x + 6,
      y: vertex.y + letter!.offset.y + 11,
    };
    expect(Math.hypot(center.x - letterCenter.x, center.y - letterCenter.y)).toBeGreaterThan(24);
  });

  it('не сжимает вытянутый треугольник в полоску и разводит подписи A и H', () => {
    const raw = solve(
      'Острый угол B прямоугольного треугольника ABC равен 9°. Найдите величину угла между высотой CH и медианой CM, проведёнными из вершины прямого угла C.',
    );
    const scene = normalizeGeometryScene(raw, {
      targetWidth: 520,
      targetHeight: 420,
      padding: 64,
    });
    const [a, h] = ['A', 'H'].map((id) => point(scene, id));
    expect(Math.min(scene.bounds.width, scene.bounds.height)).toBeGreaterThan(200);
    const labelA = scene.labels.find((label) => label.point === 'A' && label.kind === 'point');
    const labelH = scene.labels.find((label) => label.point === 'H' && label.kind === 'point');
    expect(labelA).toBeDefined();
    expect(labelH).toBeDefined();
    const centerA = {
      x: a.x + labelA!.offset.x + 8,
      y: a.y + labelA!.offset.y + 11,
    };
    const centerH = {
      x: h.x + labelH!.offset.x + 8,
      y: h.y + labelH!.offset.y + 11,
    };
    expect(Math.hypot(centerA.x - centerH.x, centerA.y - centerH.y)).toBeGreaterThan(22);
    expect(scene.bounds.minX).toBeGreaterThanOrEqual(60);
    expect(scene.bounds.minY).toBeGreaterThanOrEqual(60);
  });

  it('строит вписанный четырёхугольник с окружностью и углом 120°', () => {
    const scene = solve(
      'Четырёхугольник ABCD вписан в окружность. Угол ABC равен 120°, угол ABD равен 43°. Найдите угол CAD.',
    );
    expect(scene.circles).toHaveLength(1);
    const [a, b, c, d] = ['A', 'B', 'C', 'D'].map((id) => point(scene, id));
    const center = scene.points.find((candidate) => candidate.id === scene.circles[0].center)!;
    const radius = scene.circles[0].radius;
    for (const vertex of [a, b, c, d]) {
      expect(distance(center, vertex)).toBeCloseTo(radius, 5);
    }
    expect(angle(a, b, c)).toBeCloseTo(120, 5);
    expect(angle(a, b, d)).toBeCloseTo(43, 5);
    expect(center.label).toBe('');
    const nested = scene.angleLabels?.filter((label) => label.points[1] === 'B') ?? [];
    expect(nested.map((label) => label.group).sort()).toEqual([1, 2]);
  });

  it('ставит прямой угол в C и проводит высоту с медианой на гипотенузу', () => {
    const scene = solve(
      'Острый угол B прямоугольного треугольника ABC равен 9°. Найдите величину угла между высотой CH и медианой CM, проведёнными из вершины прямого угла C.',
    );
    const [a, b, c, h, m] = ['A', 'B', 'C', 'H', 'M'].map((id) => point(scene, id));
    expect(angle(a, c, b)).toBeCloseTo(90, 5);
    expect(angle(a, b, c)).toBeCloseTo(9, 5);
    expect(areCollinear(a, h, b)).toBe(true);
    expect(areCollinear(a, m, b)).toBe(true);
    expect(distance(h, b)).toBeGreaterThan(distance(a, b) * 0.2);
    expect(distance(a, m)).toBeCloseTo(distance(m, b), 5);
  });
});
