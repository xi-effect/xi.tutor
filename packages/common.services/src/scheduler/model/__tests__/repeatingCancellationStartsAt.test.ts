import { describe, expect, it } from 'vitest';
import { buildRepeatingCancellationStartsAt } from '../repeatingCancellationStartsAt';

describe('buildRepeatingCancellationStartsAt', () => {
  it('сдвигает UTC-вхождение к началу суток', () => {
    expect(buildRepeatingCancellationStartsAt('2026-07-04T10:00:00Z')).toBe('2026-07-04T00:00:00Z');
  });

  it('сохраняет offset из исходной строки', () => {
    expect(buildRepeatingCancellationStartsAt('2026-06-03T10:00:00+03:00')).toBe(
      '2026-06-03T00:00:00+03:00',
    );
  });

  it('игнорирует дробные секунды', () => {
    expect(buildRepeatingCancellationStartsAt('2026-07-04T10:00:00.182Z')).toBe(
      '2026-07-04T00:00:00Z',
    );
  });

  it('возвращает null для пустой или невалидной строки', () => {
    expect(buildRepeatingCancellationStartsAt('')).toBeNull();
    expect(buildRepeatingCancellationStartsAt('not-a-date')).toBeNull();
  });
});
