import { describe, expect, it } from 'vitest';
import { normalizeEmail } from '../normalizeEmail';

describe('normalizeEmail', () => {
  it('обрезает пробелы и приводит к нижнему регистру', () => {
    expect(normalizeEmail('  Luneeva1999@Mail.RU  ')).toBe('luneeva1999@mail.ru');
  });

  it('не меняет уже нормализованный адрес', () => {
    expect(normalizeEmail('ivan@example.com')).toBe('ivan@example.com');
  });
});
