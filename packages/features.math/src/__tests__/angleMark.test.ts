import { describe, expect, it } from 'vitest';
import { getInteriorAngleArc } from '../geometry/scene/angleMark';

describe('getInteriorAngleArc', () => {
  it('ведёт дугу 41° внутрь угла, а не на внешнюю сторону вершины', () => {
    const vertex = { x: 0, y: 0 };
    const first = { x: -100, y: 0 };
    const second = {
      x: -100 * Math.cos((41 * Math.PI) / 180),
      y: -100 * Math.sin((41 * Math.PI) / 180),
    };
    const arc = getInteriorAngleArc(vertex, first, second);
    expect(arc.theta).toBeCloseTo((41 * Math.PI) / 180, 6);
    expect(arc.points.length).toBeGreaterThan(4);
    for (const point of arc.points) {
      expect(point.x).toBeLessThan(-10);
      expect(point.x).toBeGreaterThan(-arc.radius - 1);
    }
    expect(arc.bisector.x).toBeLessThan(0);
  });

  it('для тупого угла тоже берёт меньшую внутреннюю дугу', () => {
    const vertex = { x: 0, y: 0 };
    const arc = getInteriorAngleArc(vertex, { x: -100, y: 20 }, { x: 100, y: 20 });
    expect(arc.theta).toBeGreaterThan(Math.PI / 2);
    expect(arc.bisector.y).toBeGreaterThan(0);
    expect(arc.points.every((point) => point.y > 0)).toBe(true);
  });
});
