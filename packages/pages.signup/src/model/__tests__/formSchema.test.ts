import { describe, expect, it } from 'vitest';
import { createFormSchema } from '../formSchema';

const t = (key: string) => key;
const schema = createFormSchema(t);

const valid = {
  username: 'ivan_petrov',
  email: 'ivan@example.com',
  password: 'secret1',
  consent: true,
};

describe('createFormSchema (signup)', () => {
  it('принимает валидные данные', () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it('требует username и ограничивает длину/символы', () => {
    expect(schema.safeParse({ ...valid, username: '' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, username: 'ab' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, username: 'Ivan' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, username: 'ivan-petrov' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, username: 'a'.repeat(31) }).success).toBe(false);
  });

  it('валидирует email', () => {
    expect(schema.safeParse({ ...valid, email: 'not-email' }).success).toBe(false);
  });

  it('требует пароль минимум 6 символов', () => {
    expect(schema.safeParse({ ...valid, password: '12345' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, password: '123456' }).success).toBe(true);
  });

  it('требует consent=true', () => {
    expect(schema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });
});
