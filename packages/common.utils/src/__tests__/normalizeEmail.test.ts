import { describe, expect, it } from 'vitest';
import { normalizeEmail } from '../normalizeEmail';

describe('normalizeEmail', () => {
  it('обрезает пробелы и сохраняет регистр', () => {
    expect(normalizeEmail('  Luneeva1999@Mail.RU  ')).toBe('Luneeva1999@Mail.RU');
  });

  it('не меняет уже нормализованный адрес', () => {
    expect(normalizeEmail('ivan@example.com')).toBe('ivan@example.com');
  });
});
