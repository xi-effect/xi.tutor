import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  computeInviteProgress,
  getInviteProgress,
  persistInviteProgressTrack,
  resolveInviteProgressStep,
  resolveInviteProgressTrack,
} from '../inviteProgress';

describe('resolveInviteProgressStep', () => {
  it('мапит экраны registration-first пути', () => {
    expect(resolveInviteProgressStep('/invite/abc')).toBe('invite_open');
    expect(resolveInviteProgressStep('/invite/abc/', true)).toBe('accept');
    expect(resolveInviteProgressStep('/signup/')).toBe('auth');
    expect(resolveInviteProgressStep('/signin')).toBe('auth');
    expect(resolveInviteProgressStep('/welcome/email')).toBe('email');
    expect(resolveInviteProgressStep('/welcome/user')).toBe('welcome_user');
    expect(resolveInviteProgressStep('/welcome/role')).toBe('welcome_role');
    expect(resolveInviteProgressStep('/welcome/socials')).toBe('welcome_socials');
    expect(resolveInviteProgressStep('/classrooms')).toBeNull();
  });
});

describe('computeInviteProgress', () => {
  it('считает remaining для signup-пути из 7 шагов', () => {
    expect(computeInviteProgress('invite_open', 'signup')).toMatchObject({
      remaining: 7,
      total: 7,
      current: 1,
    });
    expect(computeInviteProgress('email', 'signup')).toMatchObject({
      remaining: 5,
      total: 7,
      current: 3,
    });
    expect(computeInviteProgress('welcome_user', 'signup')).toMatchObject({
      remaining: 4,
      total: 7,
      current: 4,
    });
    expect(computeInviteProgress('welcome_socials', 'signup')).toMatchObject({
      remaining: 2,
      total: 7,
      current: 6,
    });
    expect(computeInviteProgress('accept', 'signup')).toMatchObject({
      remaining: 1,
      total: 7,
      current: 7,
    });
  });

  it('считает remaining для signin-пути из 3 шагов', () => {
    expect(computeInviteProgress('invite_open', 'signin')).toMatchObject({
      remaining: 3,
      total: 3,
    });
    expect(computeInviteProgress('auth', 'signin')).toMatchObject({
      remaining: 2,
      total: 3,
    });
    expect(computeInviteProgress('accept', 'signin')).toMatchObject({ remaining: 1, total: 3 });
    expect(computeInviteProgress('email', 'signin')).toBeNull();
  });
});

describe('getInviteProgress', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('без invite-context на signup не показывается', () => {
    vi.stubGlobal('window', { location: { origin: 'https://app.sovlium.ru' } });
    vi.stubGlobal('localStorage', { getItem: () => null });
    vi.stubGlobal('sessionStorage', { getItem: () => null });

    expect(getInviteProgress({ pathname: '/signup' })).toBeNull();
  });

  it('на /welcome/email в invite-flow осталось 5 из 7', () => {
    vi.stubGlobal('window', { location: { origin: 'https://app.sovlium.ru' } });
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (key === 'invite.pending_code' ? 'abc' : null),
    });
    vi.stubGlobal('sessionStorage', { getItem: () => null });

    expect(getInviteProgress({ pathname: '/welcome/email' })).toMatchObject({
      remaining: 5,
      total: 7,
    });
  });

  it('не считает обычный /signin invite-flow из-за старого pending_code', () => {
    vi.stubGlobal('window', { location: { origin: 'https://app.sovlium.ru' } });
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (key === 'invite.pending_code' ? 'abc' : null),
    });
    vi.stubGlobal('sessionStorage', { getItem: () => 'signin', setItem: () => undefined });

    expect(getInviteProgress({ pathname: '/signin', search: { redirect: '/' } })).toBeNull();
  });

  it('на /signin в invite-flow осталось 2 из 3', () => {
    vi.stubGlobal('window', { location: { origin: 'https://app.sovlium.ru' } });
    vi.stubGlobal('localStorage', { getItem: () => null });
    vi.stubGlobal('sessionStorage', { getItem: () => 'signin', setItem: () => undefined });

    expect(
      getInviteProgress({
        pathname: '/signin',
        search: { invite: 'abc', redirect: '/invite/abc' },
      }),
    ).toMatchObject({
      remaining: 2,
      total: 3,
      track: 'signin',
    });
  });
});

describe('resolveInviteProgressTrack', () => {
  it('signin/signup страницы фиксируют трек', () => {
    expect(resolveInviteProgressTrack('/signin')).toBe('signin');
    expect(resolveInviteProgressTrack('/signup')).toBe('signup');
    expect(resolveInviteProgressTrack('/invite/x', 'signin')).toBe('signin');
  });

  it('persistInviteProgressTrack пишет sessionStorage', () => {
    const store: Record<string, string> = {};
    vi.stubGlobal('window', {});
    vi.stubGlobal('sessionStorage', {
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      getItem: (key: string) => store[key] ?? null,
    });

    persistInviteProgressTrack('signin');
    expect(store['invite.progress_track']).toBe('signin');
  });
});
