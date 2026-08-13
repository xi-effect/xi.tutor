import { afterEach, describe, expect, it, vi } from 'vitest';
import { inferSignupEntryPoint } from '../inferSignupEntryPoint';

describe('inferSignupEntryPoint', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('без window возвращает unknown', () => {
    vi.stubGlobal('window', undefined);
    expect(inferSignupEntryPoint()).toBe('unknown');
  });

  it('читает invite/login из search', () => {
    vi.stubGlobal('window', {
      location: { origin: 'https://app.sovlium.ru' },
    });
    vi.stubGlobal('document', { referrer: '' });
    vi.stubGlobal('sessionStorage', { getItem: () => null });
    vi.stubGlobal('localStorage', { getItem: () => null });

    expect(inferSignupEntryPoint({ invite: 'abc' })).toBe('invite');
    expect(inferSignupEntryPoint({ from: 'invite' })).toBe('invite');
    expect(inferSignupEntryPoint({ redirect: '/invite/xyz' })).toBe('invite');
    expect(inferSignupEntryPoint({ from: 'login' })).toBe('login');
    expect(inferSignupEntryPoint({ redirect: '/signin' })).toBe('login');
  });

  it('читает invite.pending_code из localStorage', () => {
    vi.stubGlobal('window', {
      location: { origin: 'https://app.sovlium.ru' },
    });
    vi.stubGlobal('document', { referrer: '' });
    vi.stubGlobal('sessionStorage', { getItem: () => null });
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (key === 'invite.pending_code' ? 'code-1' : null),
    });

    expect(inferSignupEntryPoint()).toBe('invite');
  });

  it('читает previousPath из sessionStorage', () => {
    vi.stubGlobal('window', {
      location: { origin: 'https://app.sovlium.ru' },
    });
    vi.stubGlobal('document', { referrer: '' });
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => (key === 'previousPath' ? '/signin' : null),
    });

    expect(inferSignupEntryPoint()).toBe('login');
  });

  it('определяет landing / direct по referrer', () => {
    vi.stubGlobal('window', {
      location: { origin: 'https://app.sovlium.ru' },
    });
    vi.stubGlobal('sessionStorage', { getItem: () => null });

    vi.stubGlobal('document', { referrer: '' });
    expect(inferSignupEntryPoint()).toBe('direct');

    vi.stubGlobal('document', { referrer: 'https://landing.example/' });
    expect(inferSignupEntryPoint()).toBe('landing');

    vi.stubGlobal('document', { referrer: 'https://app.sovlium.ru/invite/1' });
    expect(inferSignupEntryPoint()).toBe('invite');
  });
});
