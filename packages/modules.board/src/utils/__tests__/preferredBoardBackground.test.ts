import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';
import {
  BOARD_PREFERENCES_STORAGE_KEY,
  readPreferredBoardBackground,
  writePreferredBoardBackground,
} from '../preferredBoardBackground';

function stubLocalStorage() {
  const mem = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, value);
    },
    removeItem: (key: string) => {
      mem.delete(key);
    },
    clear: () => mem.clear(),
    key: () => null,
    length: 0,
  });
  return mem;
}

describe('preferredBoardBackground', () => {
  beforeEach(() => {
    stubLocalStorage();
  });

  it('без сохранённой настройки возвращает точки и белый', () => {
    expect(readPreferredBoardBackground()).toEqual({ type: 'dots', color: 'white' });
  });

  it('читает тип и цвет из localStorage и отбрасывает неизвестные значения', () => {
    localStorage.setItem(
      BOARD_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        state: { defaultBackgroundType: 'grid', defaultBackgroundColor: 'cream' },
      }),
    );
    expect(readPreferredBoardBackground()).toEqual({ type: 'grid', color: 'cream' });

    localStorage.setItem(
      BOARD_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        state: { defaultBackgroundType: 'nope', defaultBackgroundColor: 'pink' },
      }),
    );
    expect(readPreferredBoardBackground()).toEqual({ type: 'dots', color: 'white' });
  });

  it('записывает предпочтение в пустую карту и не затирает уже заданный фон', () => {
    localStorage.setItem(
      BOARD_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        state: { defaultBackgroundType: 'lined', defaultBackgroundColor: 'green' },
      }),
    );

    const fresh = new Y.Doc();
    writePreferredBoardBackground(fresh);
    const freshMap = fresh.getMap<string>('boardBackground');
    expect(freshMap.get('type')).toBe('lined');
    expect(freshMap.get('color')).toBe('green');

    const existing = new Y.Doc();
    existing.getMap<string>('boardBackground').set('type', 'none');
    writePreferredBoardBackground(existing);
    const existingMap = existing.getMap<string>('boardBackground');
    expect(existingMap.get('type')).toBe('none');
    expect(existingMap.get('color')).toBeUndefined();
  });
});
