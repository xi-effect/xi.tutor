import { describe, expect, it } from 'vitest';
import {
  angle,
  areParallel,
  arePerpendicular,
  interpretGeometryText,
  isMidpoint,
  isPointOnCircle,
  solveGeometry,
  type GeometryScene,
} from '../geometry';

function solve(text: string): GeometryScene {
  const result = solveGeometry(interpretGeometryText(text)!);
  if (result.status === 'unsatisfiable') throw new Error(result.reason);
  return result.scene;
}

function points(scene: GeometryScene) {
  return new Map(scene.points.map((point) => [point.id, point]));
}

describe('generic geometry constraint propagation', () => {
  it('строит непересекающиеся обозначениями перпендикулярные отрезки', () => {
    const scenePoints = points(solve('AB ⟂ CD.'));
    expect(
      arePerpendicular(
        scenePoints.get('A')!,
        scenePoints.get('B')!,
        scenePoints.get('C')!,
        scenePoints.get('D')!,
      ),
    ).toBe(true);
  });

  it('строит параллельные отрезки', () => {
    const scenePoints = points(solve('AB ∥ CD.'));
    expect(
      areParallel(
        scenePoints.get('A')!,
        scenePoints.get('B')!,
        scenePoints.get('C')!,
        scenePoints.get('D')!,
      ),
    ).toBe(true);
  });

  it('ставит точку в середину отрезка', () => {
    const scenePoints = points(solve('M — середина AB.'));
    expect(isMidpoint(scenePoints.get('M')!, scenePoints.get('A')!, scenePoints.get('B')!)).toBe(
      true,
    );
  });

  it('строит касательную перпендикулярно радиусу в точке касания', () => {
    const scene = solve('AB — касательная к окружности с центром O.');
    const scenePoints = points(scene);
    expect(
      arePerpendicular(
        scenePoints.get('O')!,
        scenePoints.get('A')!,
        scenePoints.get('A')!,
        scenePoints.get('B')!,
      ),
    ).toBe(true);
    expect(
      isPointOnCircle(scenePoints.get('A')!, scenePoints.get('O')!, scene.circles[0].radius),
    ).toBe(true);
  });

  it('сохраняет равенство углов', () => {
    const scenePoints = points(solve('Угол ABC = угол DEF.'));
    expect(angle(scenePoints.get('A')!, scenePoints.get('B')!, scenePoints.get('C')!)).toBeCloseTo(
      angle(scenePoints.get('D')!, scenePoints.get('E')!, scenePoints.get('F')!),
      6,
    );
  });
});
