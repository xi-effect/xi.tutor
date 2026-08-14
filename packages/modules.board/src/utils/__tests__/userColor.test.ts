import { describe, expect, it } from 'vitest';
import { generateUserColor } from '../userColor';

describe('generateUserColor', () => {
  it('возвращает стабильный hsl для одного id', () => {
    expect(generateUserColor('42')).toBe(generateUserColor('42'));
    expect(generateUserColor('42')).toMatch(/^hsl\(\d+, 70%, 60%\)$/);
  });

  it('даёт разные оттенки разным id', () => {
    expect(generateUserColor('alice')).not.toBe(generateUserColor('bob'));
  });
});
