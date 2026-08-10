import { describe, expect, it } from 'vitest';
import { createFormSchema } from '../formSchema';

const t = (key: string) => key;
const schema = createFormSchema(t);

const valid = {
  email: 'ivan@example.com',
  password: 'secret1',
};

describe('createFormSchema (signin)', () => {
  it('принимает валидные данные', () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it('валидирует email', () => {
    expect(schema.safeParse({ ...valid, email: 'bad' }).success).toBe(false);
  });

  it('ограничивает длину пароля 6..64', () => {
    expect(schema.safeParse({ ...valid, password: '12345' }).success).toBe(false);
    expect(schema.safeParse({ ...valid, password: 'a'.repeat(65) }).success).toBe(false);
    expect(schema.safeParse({ ...valid, password: 'a'.repeat(64) }).success).toBe(true);
  });
});
