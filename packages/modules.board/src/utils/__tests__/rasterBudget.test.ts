import { describe, expect, it } from 'vitest';
import {
  displayPixelSize,
  edgeBucket,
  rasterPixelsForCssSize,
  zoomStepCeil,
} from '../rasterBudget';
import { pickBlobKeysToEvict } from '../blobBudget';

describe('zoomStepCeil', () => {
  it('округляет зум вверх к степени двойки и держит рабочий диапазон', () => {
    expect(zoomStepCeil(1)).toBe(1);
    expect(zoomStepCeil(0.2)).toBe(0.25);
    expect(zoomStepCeil(1.1)).toBe(2);
    expect(zoomStepCeil(3)).toBe(4);
    expect(zoomStepCeil(8)).toBe(4);
    expect(zoomStepCeil(0.01)).toBe(0.125);
    expect(zoomStepCeil(Number.NaN)).toBe(1);
  });
});

describe('rasterPixelsForCssSize', () => {
  it('на зуме 100% оставляет PDF сверхвыборку 2×dpr, как раньше', () => {
    const pixels = rasterPixelsForCssSize(800, 1130, 1, 2, { supersample: 2 });
    expect(pixels.zoomStep).toBe(1);
    expect(pixels.width).toBe(3200);
    expect(pixels.height).toBe(4520);
  });

  it('на общем виде уменьшает холст вместе с зумом и сохраняет запас на текст', () => {
    const pixels = rasterPixelsForCssSize(800, 1130, 0.25, 2, { supersample: 2 });
    expect(pixels.zoomStep).toBe(0.25);
    expect(pixels.width).toBe(800);
    expect(pixels.height).toBe(1130);
  });

  it('не раздувает холст сильнее бюджета, когда страница крупнее экрана', () => {
    const pixels = rasterPixelsForCssSize(2000, 2800, 4, 2, { supersample: 2 });
    expect(pixels.width * pixels.height).toBeLessThanOrEqual(16_777_216);
    expect(Math.max(pixels.width, pixels.height)).toBeLessThanOrEqual(8192);
  });
});

describe('displayPixelSize', () => {
  it('оставляет оригинал, когда фигура на экране просит почти весь файл', () => {
    expect(displayPixelSize(4000, 3000, 1, 2)).toBeNull();
    expect(displayPixelSize(800, 600, 1, 1)).toBeNull();
  });

  it('уменьшает файл, когда на доске он занимает мало пикселей', () => {
    expect(displayPixelSize(4000, 3000, 0.25, 2)).toEqual({ width: 2000, height: 1500 });
  });
});

describe('edgeBucket', () => {
  it('сводит соседние размеры к одной копии', () => {
    expect(edgeBucket(1000)).toBe(1024);
    expect(edgeBucket(1024)).toBe(1024);
    expect(edgeBucket(1200)).toBe(2048);
  });
});

describe('pickBlobKeysToEvict', () => {
  const budget = 100;
  const now = 10_000;

  it('не трогает закреплённые и свежие URL', () => {
    const keys = pickBlobKeysToEvict(
      [
        { key: 'pinned', url: 'blob:pinned', bytes: 80, touched: 0 },
        { key: 'fresh', url: 'blob:fresh', bytes: 80, touched: now },
        { key: 'old', url: 'blob:old', bytes: 40, touched: 0 },
      ],
      new Set(['blob:pinned']),
      now,
      budget,
      1_000,
    );
    expect(keys).toEqual(['old']);
  });

  it('ничего не вытесняет, пока бюджет не превышен', () => {
    expect(
      pickBlobKeysToEvict(
        [{ key: 'a', url: 'blob:a', bytes: 40, touched: 0 }],
        new Set(),
        now,
        budget,
        0,
      ),
    ).toEqual([]);
  });
});
