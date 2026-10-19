import { describe, expect, it } from 'vitest';
import {
  clientToPage,
  containsPoint,
  fitBoxToAspect,
  padBox,
  unionBox,
  visibleMark,
} from '../minimapGeometry';

describe('minimapGeometry', () => {
  it('вписывает содержимое в пропорции канвы и не обрезает его', () => {
    const fitted = fitBoxToAspect({ minX: 0, minY: 0, maxX: 100, maxY: 100 }, 2);
    expect(fitted.maxX - fitted.minX).toBeCloseTo(200);
    expect(fitted.maxY - fitted.minY).toBeCloseTo(100);
    expect(fitted.minX).toBeCloseTo(-50);
    expect(fitted.minY).toBeCloseTo(0);
  });

  it('переводит центр канвы в центр страницы', () => {
    const page = { minX: 10, minY: 20, maxX: 110, maxY: 220 };
    const point = clientToPage(50, 40, { left: 0, top: 0, width: 100, height: 80 }, page);
    expect(point).toEqual({ x: 60, y: 120 });
  });

  it('объединяет область фигур и видимую область камеры', () => {
    const merged = unionBox(
      { minX: 0, minY: 0, maxX: 40, maxY: 20 },
      { minX: 100, minY: -10, maxX: 140, maxY: 30 },
    );
    expect(merged).toEqual({ minX: 0, minY: -10, maxX: 140, maxY: 30 });
  });

  it('отличает точку внутри рамки камеры от точки снаружи', () => {
    const viewport = padBox({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 0);
    expect(containsPoint(viewport, 5, 5)).toBe(true);
    expect(containsPoint(viewport, 12, 5)).toBe(false);
  });

  it('не даёт горизонтальной линии схлопнуться в нулевую высоту', () => {
    expect(visibleMark({ x: 10, y: 20, w: 80, h: 0.2 }, 4)).toEqual({
      x: 10,
      y: 18.1,
      w: 80,
      h: 4,
    });
  });
});
