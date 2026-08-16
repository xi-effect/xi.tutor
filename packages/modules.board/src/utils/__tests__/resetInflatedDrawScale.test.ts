import { describe, expect, it } from 'vitest';
import { isInflatedDrawScale } from '../resetInflatedDrawScale';

describe('isInflatedDrawScale', () => {
  it('ловит завышенный scale у карандаша и маркера', () => {
    expect(isInflatedDrawScale('draw', 4.2)).toBe(true);
    expect(isInflatedDrawScale('highlight', 2)).toBe(true);
  });

  it('не трогает обычные штрихи и другие фигуры', () => {
    expect(isInflatedDrawScale('draw', 1)).toBe(false);
    expect(isInflatedDrawScale('draw', 1.2)).toBe(false);
    expect(isInflatedDrawScale('image', 8)).toBe(false);
    expect(isInflatedDrawScale('draw', undefined)).toBe(false);
  });
});
