import { describe, expect, it } from 'vitest';
import { computeResizedRegion, getCommentRegionSize, MIN_REGION_SIZE } from '../commentQueries';
import { createCommentThreadRecord } from '../commentRecords';

const baseThread = (over: Partial<Record<'w' | 'h', unknown>>) =>
  ({
    ...createCommentThreadRecord({
      pageId: 'page:1',
      x: 100,
      y: 100,
      shapeId: null,
      offsetX: null,
      offsetY: null,
      authorId: 'u1',
      authorName: 'Анна',
    }),
    ...over,
  }) as Parameters<typeof getCommentRegionSize>[0];

describe('getCommentRegionSize', () => {
  it('точечный тред без w/h — null', () => {
    expect(getCommentRegionSize(baseThread({}))).toBeNull();
  });

  it('валидная область — возвращает размер', () => {
    expect(getCommentRegionSize(baseThread({ w: 168, h: 158 }))).toEqual({ w: 168, h: 158 });
  });

  it('мусор в записи (NaN / Infinity / ≤0 / не число) — null', () => {
    expect(getCommentRegionSize(baseThread({ w: NaN, h: 158 }))).toBeNull();
    expect(getCommentRegionSize(baseThread({ w: 168, h: Infinity }))).toBeNull();
    expect(getCommentRegionSize(baseThread({ w: 0, h: 158 }))).toBeNull();
    expect(getCommentRegionSize(baseThread({ w: -10, h: 158 }))).toBeNull();
    expect(getCommentRegionSize(baseThread({ w: '168', h: 158 }))).toBeNull();
  });
});

describe('computeResizedRegion', () => {
  // pin (правый нижний угол) в (100, 100), размер 60×40 → левый верхний угол в (40, 60).
  const pin = { x: 100, y: 100, w: 60, h: 40 };

  it('br: левый верхний угол зафиксирован, размер по цели угла', () => {
    expect(computeResizedRegion(pin, 'br', { x: 130, y: 120 })).toEqual({
      x: 40,
      y: 60,
      w: 90,
      h: 60,
    });
  });

  it('br: размер клампится по MIN_REGION_SIZE', () => {
    const r = computeResizedRegion(pin, 'br', { x: 45, y: 62 });
    expect(r).toEqual({ x: 40, y: 60, w: MIN_REGION_SIZE, h: MIN_REGION_SIZE });
  });

  it('tl: правый нижний угол (пин) зафиксирован, размер растёт от цели', () => {
    expect(computeResizedRegion(pin, 'tl', { x: 20, y: 30 })).toEqual({
      x: 20,
      y: 30,
      w: 80,
      h: 70,
    });
  });

  it('tl: левый верхний угол не пересекает пин ближе MIN_REGION_SIZE', () => {
    const r = computeResizedRegion(pin, 'tl', { x: 95, y: 96 });
    expect(r).toEqual({
      x: 100 - MIN_REGION_SIZE,
      y: 100 - MIN_REGION_SIZE,
      w: MIN_REGION_SIZE,
      h: MIN_REGION_SIZE,
    });
  });
});
