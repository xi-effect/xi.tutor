import { describe, expect, it } from 'vitest';
import {
  currentUserRetryDelay,
  getHttpStatus,
  isAuthFailureError,
  isTransientAuthCheckError,
  shouldRetryCurrentUserQuery,
} from '../authCheckError';

const httpError = (status: number) => ({ response: { status } });

describe('getHttpStatus', () => {
  it('читает status из axios response', () => {
    expect(getHttpStatus(httpError(401))).toBe(401);
  });

  it('читает плоский status', () => {
    expect(getHttpStatus({ status: 403 })).toBe(403);
  });

  it('читает status из сообщения axios', () => {
    expect(
      getHttpStatus({ code: 'ERR_BAD_REQUEST', message: 'Request failed with status code 401' }),
    ).toBe(401);
  });

  it('возвращает undefined без HTTP-ответа', () => {
    expect(getHttpStatus({ code: 'ERR_NETWORK' })).toBeUndefined();
    expect(getHttpStatus(undefined)).toBeUndefined();
  });
});

describe('isAuthFailureError', () => {
  it('считает 401 и 403 потерей сессии', () => {
    expect(isAuthFailureError(httpError(401))).toBe(true);
    expect(isAuthFailureError(httpError(403))).toBe(true);
    expect(
      isAuthFailureError({
        code: 'ERR_BAD_REQUEST',
        message: 'Request failed with status code 401',
      }),
    ).toBe(true);
  });

  it('не считает сетевые и серверные ошибки потерей сессии', () => {
    expect(isAuthFailureError({ code: 'ERR_NETWORK', message: 'Network Error' })).toBe(false);
    expect(isAuthFailureError(httpError(500))).toBe(false);
    expect(isAuthFailureError(httpError(404))).toBe(false);
  });
});

describe('isTransientAuthCheckError', () => {
  it('true для сетевого сбоя и 5xx', () => {
    expect(isTransientAuthCheckError({ code: 'ERR_NETWORK' })).toBe(true);
    expect(isTransientAuthCheckError(httpError(503))).toBe(true);
  });

  it('false для 401/403', () => {
    expect(isTransientAuthCheckError(httpError(401))).toBe(false);
    expect(isTransientAuthCheckError(httpError(403))).toBe(false);
  });
});

describe('shouldRetryCurrentUserQuery', () => {
  it('не ретраит 401/403', () => {
    expect(shouldRetryCurrentUserQuery(0, httpError(401))).toBe(false);
    expect(shouldRetryCurrentUserQuery(0, httpError(403))).toBe(false);
    expect(
      shouldRetryCurrentUserQuery(0, {
        code: 'ERR_BAD_REQUEST',
        message: 'Request failed with status code 401',
      }),
    ).toBe(false);
  });

  it('не ретраит прочие 4xx', () => {
    expect(shouldRetryCurrentUserQuery(0, httpError(404))).toBe(false);
  });

  it('не ретраит отменённый запрос', () => {
    expect(shouldRetryCurrentUserQuery(0, { code: 'ERR_CANCELED' })).toBe(false);
  });

  it('ретраит сетевые ошибки до лимита', () => {
    expect(shouldRetryCurrentUserQuery(0, { code: 'ERR_NETWORK' })).toBe(true);
    expect(shouldRetryCurrentUserQuery(1, { code: 'ECONNABORTED' })).toBe(true);
    expect(shouldRetryCurrentUserQuery(2, { code: 'ERR_NETWORK' })).toBe(false);
  });

  it('ретраит 5xx до лимита', () => {
    expect(shouldRetryCurrentUserQuery(0, httpError(500))).toBe(true);
    expect(shouldRetryCurrentUserQuery(2, httpError(502))).toBe(false);
  });
});

describe('currentUserRetryDelay', () => {
  it('растёт быстро и ограничен 800 мс', () => {
    expect(currentUserRetryDelay(0)).toBe(400);
    expect(currentUserRetryDelay(1)).toBe(800);
    expect(currentUserRetryDelay(2)).toBe(800);
  });
});
