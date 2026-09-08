import { describe, expect, it } from 'vitest';
import {
  angle,
  arePerpendicular,
  distance,
  interpretGeometryText,
  isMidpoint,
  solveGeometry,
  type GeometryScene,
} from '../geometry';

function solve(text: string): Map<string, GeometryScene['points'][number]> {
  const result = solveGeometry(interpretGeometryText(text)!);
  if (result.status === 'unsatisfiable') throw new Error(result.reason);
  return new Map(result.scene.points.map((point) => [point.id, point]));
}

describe('triangle construction strategies', () => {
  it('сохраняет заданный непрямой угол треугольника', () => {
    const points = solve('В треугольнике ABC угол A равен 35°.');
    expect(angle(points.get('B')!, points.get('A')!, points.get('C')!)).toBeCloseTo(35, 6);
  });

  it('медиана заканчивается в середине противоположной стороны', () => {
    const points = solve('В треугольнике ABC AM — медиана.');
    expect(isMidpoint(points.get('M')!, points.get('B')!, points.get('C')!)).toBe(true);
  });

  it('высота перпендикулярна противоположной стороне', () => {
    const points = solve('В треугольнике ABC AH — высота.');
    expect(
      arePerpendicular(points.get('A')!, points.get('H')!, points.get('B')!, points.get('C')!),
    ).toBe(true);
  });

  it('подобные треугольники сохраняют соответствие углов', () => {
    const points = solve('Треугольники ABC и DEF подобны.');
    expect(angle(points.get('B')!, points.get('A')!, points.get('C')!)).toBeCloseTo(
      angle(points.get('E')!, points.get('D')!, points.get('F')!),
      6,
    );
    expect(angle(points.get('A')!, points.get('B')!, points.get('C')!)).toBeCloseTo(
      angle(points.get('D')!, points.get('E')!, points.get('F')!),
      6,
    );
  });

  it('биссектриса делит угол на равные части', () => {
    const points = solve('В треугольнике ABC AD — биссектриса угла A.');
    expect(angle(points.get('B')!, points.get('A')!, points.get('D')!)).toBeCloseTo(
      angle(points.get('D')!, points.get('A')!, points.get('C')!),
      6,
    );
  });

  it('строит SAS по двум сторонам и углу между ними', () => {
    const points = solve('В треугольнике ABC AB = 5, AC = 6, угол A равен 40°.');
    expect(distance(points.get('A')!, points.get('B')!)).toBeCloseTo(5, 6);
    expect(distance(points.get('A')!, points.get('C')!)).toBeCloseTo(6, 6);
    expect(angle(points.get('B')!, points.get('A')!, points.get('C')!)).toBeCloseTo(40, 6);
  });

  it('строит ASA по стороне и прилежащим углам', () => {
    const points = solve('В треугольнике ABC угол A равен 40°, угол B равен 60°, AB = 5.');
    expect(distance(points.get('A')!, points.get('B')!)).toBeCloseTo(5, 6);
    expect(angle(points.get('B')!, points.get('A')!, points.get('C')!)).toBeCloseTo(40, 5);
    expect(angle(points.get('A')!, points.get('B')!, points.get('C')!)).toBeCloseTo(60, 5);
  });
});
