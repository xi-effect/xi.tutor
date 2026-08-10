import { describe, expect, it } from 'vitest';
import { createWelcomeUserFormSchema } from '../welcomeUserFormSchema';

const t = (key: string) => key;
const schema = createWelcomeUserFormSchema(t);

describe('createWelcomeUserFormSchema', () => {
  it('принимает валидное имя', () => {
    expect(schema.safeParse({ displayName: 'Иван' }).success).toBe(true);
  });

  it('требует непустое имя и max 30', () => {
    expect(schema.safeParse({ displayName: '' }).success).toBe(false);
    expect(schema.safeParse({ displayName: 'a'.repeat(31) }).success).toBe(false);
    expect(schema.safeParse({ displayName: 'a'.repeat(30) }).success).toBe(true);
  });
});
