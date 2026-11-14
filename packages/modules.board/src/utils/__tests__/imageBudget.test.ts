import { describe, expect, it, vi } from 'vitest';
import { createImageBudget, estimateImageDisplayPixels } from '../imageBudget';

describe('createImageBudget', () => {
  it('без ограничения (десктоп) пускает всё сразу', () => {
    const budget = createImageBudget(Number.POSITIVE_INFINITY);
    expect(budget.enabled).toBe(false);
    expect(budget.request('a', 1e9)).toBe('granted');
    expect(budget.request('b', 1e9)).toBe('granted');
  });

  it('пускает картинки, пока влезают в бюджет, остальным отказывает', () => {
    const budget = createImageBudget(100);
    expect(budget.request('a', 60)).toBe('granted');
    expect(budget.request('b', 30)).toBe('granted');
    expect(budget.request('c', 20)).toBe('denied');
    expect(budget.status('c')).toBe('denied');
    expect(budget.status('unknown')).toBe('none');
  });

  it('отдаёт освободившееся место ждущим по порядку и сообщает подписчикам', () => {
    const budget = createImageBudget(100);
    const listener = vi.fn();
    budget.subscribe(listener);
    budget.request('a', 80);
    budget.request('b', 50);
    budget.request('c', 15);
    expect(budget.status('b')).toBe('denied');
    expect(budget.status('c')).toBe('granted');

    listener.mockClear();
    budget.release('a');
    expect(budget.status('b')).toBe('granted');
    expect(listener).toHaveBeenCalled();
  });

  it('выделенная фигура проходит вне бюджета', () => {
    const budget = createImageBudget(100);
    budget.request('a', 100);
    expect(budget.request('b', 500, true)).toBe('granted');
    expect(budget.request('c', 10)).toBe('denied');
  });

  it('рост стоимости уже показанной картинки её не отнимает, но учитывается', () => {
    const budget = createImageBudget(100);
    budget.request('a', 40);
    expect(budget.request('a', 90)).toBe('granted');
    expect(budget.request('b', 20)).toBe('denied');
    budget.request('a', 10);
    expect(budget.request('b', 20)).toBe('granted');
  });

  it('release чужого или неизвестного id безопасен', () => {
    const budget = createImageBudget(100);
    expect(() => budget.release('nope')).not.toThrow();
    budget.request('a', 100);
    budget.request('b', 10);
    budget.release('b');
    expect(budget.status('b')).toBe('none');
    expect(budget.status('a')).toBe('granted');
  });
});

describe('requestQuality', () => {
  it('показывает картинку целиком, пока хватает места, иначе оставляет уменьшенную копию', () => {
    const budget = createImageBudget(100);
    expect(budget.requestQuality('a', 60, 10)).toBe('full');
    expect(budget.requestQuality('b', 50, 10)).toBe('low');
    expect(budget.quality('a')).toBe('full');
    expect(budget.quality('b')).toBe('low');
    expect(budget.status('b')).toBe('granted');
  });

  it('после освобождения места возвращает уменьшенной картинке полную резкость', () => {
    const budget = createImageBudget(100);
    const listener = vi.fn();
    budget.subscribe(listener);
    budget.requestQuality('a', 60, 10);
    budget.requestQuality('b', 50, 10);
    listener.mockClear();
    budget.release('a');
    expect(budget.quality('b')).toBe('full');
    expect(listener).toHaveBeenCalled();
  });

  it('неизвестный размер не зажимает', () => {
    const budget = createImageBudget(100);
    budget.requestQuality('a', 100, 10);
    expect(budget.requestQuality('b', 0, 10)).toBe('full');
  });
});

describe('estimateImageDisplayPixels', () => {
  it('на общем плане считает уменьшенный растр, а не весь файл', () => {
    const cost = estimateImageDisplayPixels({
      assetWidth: 4000,
      assetHeight: 3000,
      steppedScreenScale: 0.125,
      dpr: 2,
      resizable: true,
    });
    expect(cost).toBeLessThan(4000 * 3000 * 0.1);
  });

  it('при крупном зуме берёт оригинал', () => {
    expect(
      estimateImageDisplayPixels({
        assetWidth: 2000,
        assetHeight: 1000,
        steppedScreenScale: 2,
        dpr: 2,
        resizable: true,
      }),
    ).toBe(2000 * 1000);
  });

  it('GIF и SVG, а также огромные файлы считает целиком', () => {
    expect(
      estimateImageDisplayPixels({
        assetWidth: 1000,
        assetHeight: 1000,
        steppedScreenScale: 0.125,
        dpr: 2,
        resizable: false,
      }),
    ).toBe(1_000_000);
    expect(
      estimateImageDisplayPixels({
        assetWidth: 6610,
        assetHeight: 13043,
        steppedScreenScale: 0.125,
        dpr: 2,
        resizable: true,
      }),
    ).toBe(6610 * 13043);
  });
});
