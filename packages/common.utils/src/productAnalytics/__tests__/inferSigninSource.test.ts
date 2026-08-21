import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearPendingInviteCode,
  getInviteAuthSearch,
  getPendingInviteCode,
  inferSigninSource,
  persistPendingInviteCode,
} from '../inferSigninSource';

describe('getPendingInviteCode', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('без window возвращает undefined', () => {
    vi.stubGlobal('window', undefined);
    expect(getPendingInviteCode({ redirect: '/invite/abc' })).toBeUndefined();
  });

  it('берёт код из invite.pending_code', () => {
    vi.stubGlobal('window', { location: { origin: 'https://app.sovlium.ru' } });
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (key === 'invite.pending_code' ? ' pending-1 ' : null),
    });

    expect(getPendingInviteCode()).toBe('pending-1');
  });

  it('берёт код из redirect /invite/{code}', () => {
    vi.stubGlobal('window', { location: { origin: 'https://app.sovlium.ru' } });
    vi.stubGlobal('localStorage', { getItem: () => null });

    expect(getPendingInviteCode({ redirect: 'https://app.sovlium.ru/invite/code-42?x=1' })).toBe(
      'code-42',
    );
    expect(getPendingInviteCode({ redirect: '/invite/rel-code' })).toBe('rel-code');
  });

  it('persist/clear пишет и удаляет invite.pending_code', () => {
    const store: Record<string, string> = {};
    vi.stubGlobal('window', { location: { origin: 'https://app.sovlium.ru' } });
    vi.stubGlobal('localStorage', {
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      getItem: (key: string) => store[key] ?? null,
      removeItem: (key: string) => {
        delete store[key];
      },
    });

    persistPendingInviteCode('  code-1  ');
    expect(store['invite.pending_code']).toBe('code-1');
    clearPendingInviteCode();
    expect(store['invite.pending_code']).toBeUndefined();
  });
});

describe('getInviteAuthSearch', () => {
  it('собирает redirect и invite без домена', () => {
    expect(getInviteAuthSearch(' abc ')).toEqual({
      redirect: '/invite/abc',
      invite: 'abc',
    });
  });
});

describe('inferSigninSource', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('invite при pending_code или redirect /invite', () => {
    vi.stubGlobal('window', {
      location: { origin: 'https://app.sovlium.ru', pathname: '/signin' },
    });
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (key === 'invite.pending_code' ? 'abc' : null),
    });

    expect(inferSigninSource()).toBe('invite');
  });

  it('signin на обычной форме входа', () => {
    vi.stubGlobal('window', {
      location: { origin: 'https://app.sovlium.ru', pathname: '/signin' },
    });
    vi.stubGlobal('localStorage', { getItem: () => null });

    expect(inferSigninSource()).toBe('signin');
    expect(inferSigninSource({ redirect: '/calendar' })).toBe('signin');
  });
});
