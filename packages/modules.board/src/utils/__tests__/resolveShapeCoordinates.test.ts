import { describe, expect, it } from 'vitest';
import {
  findOpenPlacement,
  fitDisplaySize,
  isPointInsideViewport,
  placementAtPoint,
} from '../resolveShapeCoordinates';

const viewport = { x: 100, y: 200, w: 800, h: 600 };

describe('findOpenPlacement', () => {
  it('ставит фигуру в центр пустой видимой области', () => {
    expect(findOpenPlacement(viewport, 200, 100, [])).toEqual({ x: 400, y: 450 });
  });

  it('ищет следующее место внутри экрана, если центр занят', () => {
    const placed = findOpenPlacement(viewport, 200, 100, [{ x: 400, y: 450, w: 200, h: 100 }]);
    const centerX = placed.x + 100;
    const centerY = placed.y + 50;

    expect(centerX).toBeGreaterThanOrEqual(viewport.x);
    expect(centerX).toBeLessThanOrEqual(viewport.x + viewport.w);
    expect(centerY).toBeGreaterThanOrEqual(viewport.y);
    expect(centerY).toBeLessThanOrEqual(viewport.y + viewport.h);
    expect(placed).not.toEqual({ x: 400, y: 450 });
  });

  it('не уводит фигуру вправо за экран, даже если видимая область заполнена', () => {
    const obstacles = Array.from({ length: 30 }, (_, index) => ({
      x: viewport.x + (index % 6) * 140,
      y: viewport.y + Math.floor(index / 6) * 120,
      w: 150,
      h: 130,
    }));

    const placed = findOpenPlacement(viewport, 180, 120, obstacles);
    const centerX = placed.x + 90;
    const centerY = placed.y + 60;

    expect(isPointInsideViewport({ x: centerX, y: centerY }, viewport)).toBe(true);
    expect(placed.x).toBeLessThan(viewport.x + viewport.w);
  });
});

describe('fitDisplaySize', () => {
  it('уменьшает изображение, которое больше видимой области', () => {
    expect(fitDisplaySize(4000, 2000, 1000, 800)).toEqual({ w: 800, h: 400 });
  });

  it('не увеличивает маленькое изображение', () => {
    expect(fitDisplaySize(120, 80, 1000, 800)).toEqual({ w: 120, h: 80 });
  });
});

describe('placementAtPoint', () => {
  it('центрирует фигуру в указанной точке', () => {
    expect(placementAtPoint({ x: 50, y: 40 }, 20, 10)).toEqual({ x: 40, y: 35 });
  });
});
