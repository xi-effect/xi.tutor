import { describe, expect, it } from 'vitest';
import { matchesSearchQuery, switchKeyboardLayout } from '../keyboardLayout';

describe('switchKeyboardLayout', () => {
  it('переводит английскую раскладку в русскую', () => {
    expect(switchKeyboardLayout('vfntvfnbrf')).toBe('математика');
  });

  it('переводит русскую раскладку в английскую', () => {
    expect(switchKeyboardLayout('математика')).toBe('vfntvfnbrf');
  });
});

describe('matchesSearchQuery', () => {
  it('находит текст при вводе в другой раскладке', () => {
    expect(matchesSearchQuery('Математика', 'vfntvfnbrf')).toBe(true);
    expect(matchesSearchQuery('Иван', 'bdfy')).toBe(true);
  });

  it('находит текст при совпадении раскладки', () => {
    expect(matchesSearchQuery('Математика', 'мате')).toBe(true);
  });

  it('не находит посторонние строки', () => {
    expect(matchesSearchQuery('Русский язык', 'vfntvfnbrf')).toBe(false);
  });
});
