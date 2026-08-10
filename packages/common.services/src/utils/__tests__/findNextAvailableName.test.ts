import { describe, expect, it } from 'vitest';
import { findNextAvailableName } from '../findNextAvailableName';

describe('findNextAvailableName', () => {
  it('начинает с 1, если подходящих имён нет', () => {
    expect(findNextAvailableName([], 'note')).toBe('Новая заметка 1');
    expect(findNextAvailableName([{ name: 'Черновик' }], 'board')).toBe('Новая доска 1');
  });

  it('берёт следующий номер после максимального', () => {
    expect(
      findNextAvailableName(
        [{ name: 'Новая заметка 1' }, { name: 'Новая заметка 3' }, { name: 'Новая заметка 2' }],
        'note',
      ),
    ).toBe('Новая заметка 4');
  });

  it('игнорирует имена другого kind и без номера', () => {
    expect(
      findNextAvailableName(
        [{ name: 'Новая доска 5' }, { name: 'Новая заметка' }, { name: 'Новая заметка 2' }],
        'note',
      ),
    ).toBe('Новая заметка 3');
  });
});
