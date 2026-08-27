import { describe, expect, it } from 'vitest';
import { resolveAuthState } from '../resolveAuthState';

const networkError = { code: 'ERR_NETWORK', message: 'Network Error' };
const unauthorizedError = { response: { status: 401 } };
const user = { id: 1 };

describe('resolveAuthState', () => {
  it('после явного logout остаётся неавторизованным', () => {
    expect(
      resolveAuthState({
        isAuthenticated: false,
        isSuccess: false,
        user: undefined,
        isError: true,
        isFetching: false,
        error: networkError,
      }),
    ).toBe(false);
  });

  it('успешный home подтверждает сессию', () => {
    expect(
      resolveAuthState({
        isAuthenticated: null,
        isSuccess: true,
        user,
        isError: false,
        isFetching: false,
        error: null,
      }),
    ).toBe(true);
  });

  it('401 на первичной загрузке — не авторизован', () => {
    expect(
      resolveAuthState({
        isAuthenticated: null,
        isSuccess: false,
        user: undefined,
        isError: true,
        isFetching: false,
        error: unauthorizedError,
      }),
    ).toBe(false);
  });

  it('сетевой сбой на первичной загрузке не разлогинивает — ждём сеть', () => {
    expect(
      resolveAuthState({
        isAuthenticated: null,
        isSuccess: false,
        user: undefined,
        isError: true,
        isFetching: false,
        error: networkError,
      }),
    ).toBeNull();
  });

  it('сетевой сбой при уже подтверждённой сессии её сохраняет', () => {
    expect(
      resolveAuthState({
        isAuthenticated: true,
        isSuccess: false,
        user: undefined,
        isError: true,
        isFetching: false,
        error: networkError,
      }),
    ).toBe(true);
  });

  it('во время refetch после login не откатывает stale 401', () => {
    expect(
      resolveAuthState({
        isAuthenticated: true,
        isSuccess: false,
        user: undefined,
        isError: true,
        isFetching: true,
        error: unauthorizedError,
      }),
    ).toBe(true);
  });
});
