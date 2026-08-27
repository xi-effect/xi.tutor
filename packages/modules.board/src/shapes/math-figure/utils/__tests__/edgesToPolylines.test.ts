import { describe, expect, it } from 'vitest';
import { edgesToPolylines, polylinePath, uniqueEdgePoints } from '../edgesToPolylines';

describe('edgesToPolylines', () => {
  it('склеивает квадрат в одну замкнутую ломаную', () => {
    const polylines = edgesToPolylines([
      { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } },
      { from: { x: 10, y: 10 }, to: { x: 10, y: 0 } },
      { from: { x: 10, y: 10 }, to: { x: 0, y: 10 } },
      { from: { x: 0, y: 10 }, to: { x: 0, y: 0 } },
    ]);

    expect(polylines).toHaveLength(1);
    expect(polylines[0]).toHaveLength(5);
    expect(polylinePath(polylines[0]).endsWith(' Z')).toBe(true);
  });

  it('оставляет тройник отдельным отрезком', () => {
    const polylines = edgesToPolylines([
      { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } },
      { from: { x: 10, y: 0 }, to: { x: 20, y: 0 } },
      { from: { x: 10, y: 0 }, to: { x: 10, y: 10 } },
    ]);

    expect(polylines).toHaveLength(2);
    expect(
      uniqueEdgePoints([
        { from: { x: 0, y: 0 }, to: { x: 10, y: 0 } },
        { from: { x: 10, y: 0 }, to: { x: 20, y: 0 } },
        { from: { x: 10, y: 0 }, to: { x: 10, y: 10 } },
      ]),
    ).toHaveLength(4);
  });
});
