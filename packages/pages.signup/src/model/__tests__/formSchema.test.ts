import { describe, expect, it } from 'vitest';
import { createFormSchema } from '../formSchema';

const t = (key: string) => key;
const schema = createFormSchema(t);

const valid = {
  display_name: 'Иван Петров',
  email: 'ivan@example.com',
  password: 'secret1',
  consent: true,
};

describe('createFormSchema (signup)', () => {
  it('принимает валидные данные', () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it('требует display_name от 2 до 30 символов и обрезает пробелы', () => {
    expect(schema.safeParse({ ...valid, display_name: '' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, display_name: '  ' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, display_name: 'И' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, display_name: 'a'.repeat(31) }).success).toBe(false);
    const parsed = schema.parse({ ...valid, display_name: '  Иван  ' });
    expect(parsed.display_name).toBe('Иван');
  });

  it('валидирует email', () => {
    expect(schema.safeParse({ ...valid, email: 'not-email' }).success).toBe(false);
  });

  it('обрезает пробелы в email и сохраняет регистр', () => {
    const parsed = schema.parse({ ...valid, email: '  Ivan@Example.COM ' });
    expect(parsed.email).toBe('Ivan@Example.COM');
  });

  it('требует пароль минимум 6 символов', () => {
    expect(schema.safeParse({ ...valid, password: '12345' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, password: '123456' }).success).toBe(true);
  });

  it('требует consent=true', () => {
    expect(schema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });
});
