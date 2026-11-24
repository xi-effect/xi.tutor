import { describe, expect, it } from 'vitest';
import {
  expectsFractionAnswer,
  readFractionDraft,
  sanitizeFractionPart,
  writeFractionDraft,
} from '../fractionAnswer';

describe('expectsFractionAnswer', () => {
  it('узнаёт обыкновенную дробь в ответе задания', () => {
    expect(expectsFractionAnswer('\\frac{99}{65}')).toBe(true);
    expect(expectsFractionAnswer('$\\frac{3}{5}$')).toBe(true);
    expect(expectsFractionAnswer('99/65')).toBe(true);
  });

  it('оставляет обычное поле для десятичной дроби и целого числа', () => {
    expect(expectsFractionAnswer('0,5')).toBe(false);
    expect(expectsFractionAnswer('0.5')).toBe(false);
    expect(expectsFractionAnswer('\\frac{4}{1}')).toBe(false);
    expect(expectsFractionAnswer('12')).toBe(false);
    expect(expectsFractionAnswer('-5;80')).toBe(false);
  });
});

describe('fraction draft', () => {
  it('собирает числитель и знаменатель в дробь', () => {
    expect(writeFractionDraft('99', '65')).toBe('99/65');
    expect(writeFractionDraft('', '')).toBe('');
    expect(readFractionDraft('99/65')).toEqual({ numerator: '99', denominator: '65' });
    expect(readFractionDraft('')).toEqual({ numerator: '', denominator: '' });
    expect(readFractionDraft('0,5')).toBeNull();
  });

  it('оставляет в части дроби только знак и цифры', () => {
    expect(sanitizeFractionPart(' 99a')).toBe('99');
    expect(sanitizeFractionPart('−65')).toBe('-65');
    expect(sanitizeFractionPart('-')).toBe('-');
  });
});
