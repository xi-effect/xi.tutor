import { describe, expect, it } from 'vitest';
import { isHttpUrl } from '../links';

describe('isHttpUrl', () => {
  it('принимает http(s)', () => {
    expect(isHttpUrl('https://t.me/sovlium_bot')).toBe(true);
    expect(isHttpUrl('http://localhost:5173/path')).toBe(true);
  });

  it('отклоняет javascript: и пустое', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('')).toBe(false);
    expect(isHttpUrl('not a url')).toBe(false);
  });
});
