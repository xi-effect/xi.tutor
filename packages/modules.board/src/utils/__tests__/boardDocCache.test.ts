import { describe, expect, it } from 'vitest';
import {
  DESKTOP_MAX_BOARDS,
  DESKTOP_MAX_BYTES,
  MOBILE_MAX_BOARDS,
  MOBILE_MAX_BYTES,
  getBoardDocCacheLimits,
  isCoarsePointerDevice,
  makeBoardDocCacheKey,
  pickBoardDocsToEvict,
} from '../boardDocCache';

describe('boardDocCache', () => {
  it('собирает ключ из userId и boardId', () => {
    expect(makeBoardDocCacheKey('u1', 'b1')).toBe('u1::b1');
  });

  it('считает десктопом устройство без coarse pointer', () => {
    expect(isCoarsePointerDevice({ matches: false }, 0)).toBe(false);
    expect(getBoardDocCacheLimits(false)).toEqual({
      maxBoards: DESKTOP_MAX_BOARDS,
      maxBytes: DESKTOP_MAX_BYTES,
    });
  });

  it('считает мобильным coarse pointer с тачем', () => {
    expect(isCoarsePointerDevice({ matches: true }, 2)).toBe(true);
    expect(getBoardDocCacheLimits(true)).toEqual({
      maxBoards: MOBILE_MAX_BOARDS,
      maxBytes: MOBILE_MAX_BYTES,
    });
  });

  it('не вытесняет, если лимиты не превышены', () => {
    const evict = pickBoardDocsToEvict(
      [
        { key: 'a', lastAccessedAt: 1, byteLength: 10 },
        { key: 'b', lastAccessedAt: 2, byteLength: 10 },
      ],
      { key: 'c', byteLength: 10 },
      { maxBoards: 5, maxBytes: 100 },
    );

    expect(evict).toEqual([]);
  });

  it('вытесняет самые старые доски по LRU, но не текущую', () => {
    const evict = pickBoardDocsToEvict(
      [
        { key: 'old', lastAccessedAt: 1, byteLength: 10 },
        { key: 'mid', lastAccessedAt: 2, byteLength: 10 },
        { key: 'fresh', lastAccessedAt: 3, byteLength: 10 },
      ],
      { key: 'fresh', byteLength: 10 },
      { maxBoards: 2, maxBytes: 1000 },
    );

    expect(evict).toEqual(['old']);
  });

  it('вытесняет по объёму, пока сумма не влезет', () => {
    const evict = pickBoardDocsToEvict(
      [
        { key: 'a', lastAccessedAt: 1, byteLength: 40 },
        { key: 'b', lastAccessedAt: 2, byteLength: 40 },
      ],
      { key: 'c', byteLength: 50 },
      { maxBoards: 10, maxBytes: 80 },
    );

    expect(evict).toEqual(['a', 'b']);
  });

  it('не вытесняет, если входящая доска больше лимита — запись должна быть пропущена снаружи', () => {
    const evict = pickBoardDocsToEvict(
      [{ key: 'a', lastAccessedAt: 1, byteLength: 10 }],
      { key: 'huge', byteLength: 200 },
      { maxBoards: 5, maxBytes: 100 },
    );

    expect(evict).toEqual([]);
  });
});
