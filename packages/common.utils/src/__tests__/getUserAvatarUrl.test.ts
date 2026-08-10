import { describe, expect, it } from 'vitest';
import { getUserAvatarUrl } from '../getUserAvatarUrl';

describe('getUserAvatarUrl', () => {
  it('собирает URL аватара', () => {
    expect(getUserAvatarUrl(42)).toBe('https://api.sovlium.ru/files/users/42/avatar.webp');
  });

  it('возвращает undefined без userId', () => {
    expect(getUserAvatarUrl(undefined)).toBeUndefined();
    expect(getUserAvatarUrl(null)).toBeUndefined();
    expect(getUserAvatarUrl(0)).toBeUndefined();
  });
});
