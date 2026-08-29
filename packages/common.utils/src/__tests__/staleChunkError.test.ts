import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  STALE_CHUNK_RELOAD_KEY,
  isStaleChunkError,
  reloadOnceOnStaleChunk,
  resetStaleChunkReloadState,
} from '../staleChunkError';

const createStorage = (initial: Record<string, string> = {}) => {
  const data = { ...initial };
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
    data,
  };
};

afterEach(() => {
  resetStaleChunkReloadState();
});

describe('isStaleChunkError', () => {
  it('распознаёт сообщение Chrome / Vite', () => {
    expect(
      isStaleChunkError(
        new TypeError(
          'Failed to fetch dynamically imported module: https://app.sovlium.ru/assets/pages.classroom-Dzx4RBkA.js',
        ),
      ),
    ).toBe(true);
  });

  it('распознаёт сообщения Firefox и Safari', () => {
    expect(isStaleChunkError(new Error('error loading dynamically imported module'))).toBe(true);
    expect(isStaleChunkError(new Error('Importing a module script failed.'))).toBe(true);
  });

  it('не принимает обычные сетевые ошибки', () => {
    expect(isStaleChunkError(new TypeError('Failed to fetch'))).toBe(false);
    expect(isStaleChunkError(new Error('Network Error'))).toBe(false);
  });
});

describe('reloadOnceOnStaleChunk', () => {
  it('перезагружает страницу один раз при stale-чанке', () => {
    const reload = vi.fn();
    const storage = createStorage();

    expect(
      reloadOnceOnStaleChunk(
        new Error('Failed to fetch dynamically imported module: /assets/a.js'),
        {
          now: 1_000,
          storage,
          reload,
        },
      ),
    ).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(storage.data[STALE_CHUNK_RELOAD_KEY]).toBe('1000');
  });

  it('не трогает страницу, если ошибка не про чанк', () => {
    const reload = vi.fn();

    expect(reloadOnceOnStaleChunk(new Error('boom'), { storage: createStorage(), reload })).toBe(
      false,
    );
    expect(reload).not.toHaveBeenCalled();
  });

  it('не зацикливает reload в пределах cooldown', () => {
    const reload = vi.fn();
    const storage = createStorage({ [STALE_CHUNK_RELOAD_KEY]: '1000' });

    expect(
      reloadOnceOnStaleChunk(new Error('Unable to preload CSS for /assets/a.css'), {
        now: 5_000,
        storage,
        reload,
      }),
    ).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('перезагружает снова после истечения cooldown', () => {
    const reload = vi.fn();
    const storage = createStorage({ [STALE_CHUNK_RELOAD_KEY]: '1000' });

    expect(
      reloadOnceOnStaleChunk(new Error('Failed to fetch dynamically imported module'), {
        now: 20_000,
        storage,
        reload,
      }),
    ).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('без ошибки считает событие Vite preload stale-чанком', () => {
    const reload = vi.fn();

    expect(reloadOnceOnStaleChunk(undefined, { storage: createStorage(), reload })).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
