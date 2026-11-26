import { describe, expect, it } from 'vitest';
import {
  isValidTrapezoid,
  isValidTriangle,
  moveTrapezoidVertex,
  moveTriangleVertex,
  normalizeVertices,
  projectOntoLine,
} from '../polygonGeometry';

describe('triangle geometry', () => {
  it('принимает разносторонний, прямоугольный и тупоугольный треугольники', () => {
    expect(
      isValidTriangle([
        { x: 0, y: 0 },
        { x: 6, y: 1 },
        { x: 2, y: 5 },
      ]),
    ).toBe(true);
    expect(
      isValidTriangle([
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 3 },
      ]),
    ).toBe(true);
    expect(
      isValidTriangle([
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: -1, y: 1 },
      ]),
    ).toBe(true);
  });

  it('отклоняет совпадающие и коллинеарные вершины', () => {
    expect(
      isValidTriangle([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 3, y: 1 },
      ]),
    ).toBe(false);
    expect(
      isValidTriangle([
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 5, y: 0 },
      ]),
    ).toBe(false);
  });

  it('позволяет двигать вершину, пока фигура не вырождена', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 1, y: 3 },
    ];
    expect(moveTriangleVertex(points, 2, { x: 6, y: 2 })).toEqual([
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 6, y: 2 },
    ]);
    expect(moveTriangleVertex(points, 2, { x: 2, y: 0 })).toBeNull();
  });
});

describe('trapezoid geometry', () => {
  const trapezoid = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 8, y: 4 },
    { x: 2, y: 4 },
  ];

  it('принимает неравнобедренную трапецию и отклоняет самопересечение', () => {
    expect(isValidTrapezoid(trapezoid)).toBe(true);
    expect(
      isValidTrapezoid([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 2, y: 4 },
        { x: 12, y: 4 },
      ]),
    ).toBe(false);
  });

  it('удерживает четвёртую вершину на прямой, параллельной основанию', () => {
    const projected = projectOntoLine({ x: 8, y: 4 }, { x: 10, y: 0 }, { x: 3, y: 9 });
    expect(projected).toEqual({ x: 3, y: 4 });
  });

  it('сохраняет параллельность оснований при перемещении вершины', () => {
    const moved = moveTrapezoidVertex(trapezoid, 0, { x: 0, y: 2 });
    expect(moved).not.toBeNull();
    if (!moved) return;
    const [a, b, c, d] = moved;
    const base = { x: b.x - a.x, y: b.y - a.y };
    const top = { x: d.x - c.x, y: d.y - c.y };
    expect(base.x * top.y - base.y * top.x).toBeCloseTo(0);
  });
});

describe('повтор кадра перетаскивания', () => {
  const triangle = [
    { x: 0, y: 0 },
    { x: 80, y: 0 },
    { x: 20, y: 60 },
  ];

  it('дважды применённая точка даёт те же вершины, а не убегающую фигуру', () => {
    const first = moveTriangleVertex(triangle, 2, { x: 30, y: 90 });
    const second = moveTriangleVertex(triangle, 2, { x: 30, y: 90 });
    expect(first).toEqual(second);
    expect(first?.[2]).toEqual({ x: 30, y: 90 });
  });
});

describe('normalizeVertices', () => {
  it('переносит повёрнутую фигуру вместе со сдвигом локального начала', () => {
    const placed = normalizeVertices({ x: 10, y: 20 }, Math.PI / 2, [{ x: 3, y: 0 }]);
    expect(placed.x).toBeCloseTo(10);
    expect(placed.y).toBeCloseTo(23);
    expect(placed.vertices).toEqual([{ x: 0, y: 0 }]);
  });
});
