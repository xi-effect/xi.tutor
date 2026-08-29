import { describe, expect, it } from 'vitest';
import { shouldNotifySessionRestoreNetwork } from '../useSessionRestoreNetworkToast';

describe('shouldNotifySessionRestoreNetwork', () => {
  it('молчит, пока сессия ещё не проверялась', () => {
    expect(
      shouldNotifySessionRestoreNetwork({
        isSessionUnresolved: true,
        failureCount: 0,
        error: null,
        isOnline: false,
      }),
    ).toBe(false);
  });

  it('молчит при 401 — это не потеря сети', () => {
    expect(
      shouldNotifySessionRestoreNetwork({
        isSessionUnresolved: true,
        failureCount: 1,
        error: { response: { status: 401 } },
        isOnline: false,
      }),
    ).toBe(false);
  });

  it('молчит, когда сессия уже определена', () => {
    expect(
      shouldNotifySessionRestoreNetwork({
        isSessionUnresolved: false,
        failureCount: 2,
        error: { code: 'ERR_NETWORK' },
        isOnline: false,
      }),
    ).toBe(false);
  });

  it('молчит, если браузер считает сеть живой (не airplane mode)', () => {
    expect(
      shouldNotifySessionRestoreNetwork({
        isSessionUnresolved: true,
        failureCount: 1,
        error: { code: 'ERR_NETWORK' },
        isOnline: true,
      }),
    ).toBe(false);
  });

  it('предлагает toast только при реальном offline', () => {
    expect(
      shouldNotifySessionRestoreNetwork({
        isSessionUnresolved: true,
        failureCount: 1,
        error: { code: 'ERR_NETWORK' },
        isOnline: false,
      }),
    ).toBe(true);
  });
});
