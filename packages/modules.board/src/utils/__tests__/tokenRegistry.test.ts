import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRegisteredTokens, registerToken, unregisterToken } from '../tokenRegistry';

function stubLocalStorage() {
  const mem = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => mem.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mem.set(key, value);
    },
    removeItem: (key: string) => {
      mem.delete(key);
    },
    clear: () => mem.clear(),
    key: () => null,
    length: 0,
  });
}

describe('tokenRegistry', () => {
  beforeEach(() => {
    stubLocalStorage();
  });

  it('кладёт свежий токен первым и не дублирует', () => {
    registerToken('a');
    registerToken('b');
    registerToken('a');
    expect(getRegisteredTokens()).toEqual(['a', 'b']);
  });

  it('держит не больше 5 токенов', () => {
    for (const token of ['1', '2', '3', '4', '5', '6']) registerToken(token);
    expect(getRegisteredTokens()).toEqual(['6', '5', '4', '3', '2']);
  });

  it('удаляет протухший токен', () => {
    registerToken('live');
    registerToken('dead');
    unregisterToken('dead');
    expect(getRegisteredTokens()).toEqual(['live']);
  });
});
