import { afterEach, describe, expect, it, vi } from 'vitest';
import { inferEmailConfirmationSource } from '../inferEmailConfirmationSource';

describe('inferEmailConfirmationSource', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('для токена возвращает email_link', () => {
    expect(inferEmailConfirmationSource({ hasToken: true })).toBe('email_link');
  });

  it('без window возвращает unknown', () => {
    vi.stubGlobal('window', undefined);
    expect(inferEmailConfirmationSource()).toBe('unknown');
  });

  it('читает signup из previousPath, иначе session_restore', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => (key === 'previousPath' ? '/signup' : null),
    });
    expect(inferEmailConfirmationSource()).toBe('signup');

    vi.stubGlobal('sessionStorage', { getItem: () => null });
    expect(inferEmailConfirmationSource()).toBe('session_restore');
  });
});
