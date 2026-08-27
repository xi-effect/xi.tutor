import { describe, expect, it } from 'vitest';
import { shouldNotifySessionRestoreNetwork } from '../useSessionRestoreNetworkToast';

describe('shouldNotifySessionRestoreNetwork', () => {
  it('молчит, пока сессия ещё не проверялась', () => {
    expect(
      shouldNotifySessionRestoreNetwork({
        isSessionUnresolved: true,
        failureCount: 0,
        error: null,
      }),
    ).toBe(false);
  });

  it('молчит при 401 — это не потеря сети', () => {
    expect(
      shouldNotifySessionRestoreNetwork({
        isSessionUnresolved: true,
        failureCount: 1,
        error: { response: { status: 401 } },
      }),
    ).toBe(false);
  });

  it('молчит, когда сессия уже определена', () => {
    expect(
      shouldNotifySessionRestoreNetwork({
        isSessionUnresolved: false,
        failureCount: 2,
        error: { code: 'ERR_NETWORK' },
      }),
    ).toBe(false);
  });

  it('предлагает toast при сетевом сбое во время проверки сессии', () => {
    expect(
      shouldNotifySessionRestoreNetwork({
        isSessionUnresolved: true,
        failureCount: 1,
        error: { code: 'ERR_NETWORK' },
      }),
    ).toBe(true);
  });
});
