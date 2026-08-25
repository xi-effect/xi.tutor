import { describe, expect, it } from 'vitest';
import { maskId, maskToken, maskUrl } from '../maskSensitiveData';

describe('maskToken', () => {
  it('маскирует короткий и длинный токен', () => {
    expect(maskToken(undefined)).toBe('undefined');
    expect(maskToken('abc')).toBe('***');
    expect(maskToken('token-value-123')).toBe('toke...(15)');
  });
});

describe('maskUrl', () => {
  it('оставляет hostname', () => {
    expect(maskUrl('https://hocus.sovlium.ru/path')).toBe('hocus.sovlium.ru');
  });

  it('обрезает невалидный URL', () => {
    expect(maskUrl(undefined)).toBe('undefined');
    expect(maskUrl('not-a-url-but-quite-long-string')).toBe('not-a-url-but-quite-...');
  });
});

describe('maskId', () => {
  it('маскирует короткий и длинный id', () => {
    expect(maskId(undefined)).toBe('undefined');
    expect(maskId('abcd1234')).toBe('abcd***');
    expect(maskId('123456789012345')).toBe('12345678...(15)');
  });
});
