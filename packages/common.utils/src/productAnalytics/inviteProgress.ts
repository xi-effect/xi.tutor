import { getInviteCodeFromSearch, getPendingInviteCode } from './inferSigninSource';

export const INVITE_PROGRESS_TRACK_KEY = 'invite.progress_track';

export type InviteProgressTrack = 'signup' | 'signin';

export type InviteProgressStep =
  'invite_open' | 'auth' | 'email' | 'welcome_user' | 'welcome_role' | 'welcome_socials' | 'accept';

export type InviteProgress = {
  remaining: number;
  total: number;
  current: number;
  track: InviteProgressTrack;
};

const SIGNUP_STEPS: InviteProgressStep[] = [
  'invite_open',
  'auth',
  'email',
  'welcome_user',
  'welcome_role',
  'welcome_socials',
  'accept',
];

const SIGNIN_STEPS: InviteProgressStep[] = ['invite_open', 'auth', 'accept'];

export function persistInviteProgressTrack(track: InviteProgressTrack): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(INVITE_PROGRESS_TRACK_KEY, track);
  } catch {
    // ignore
  }
}

export function clearInviteProgressTrack(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(INVITE_PROGRESS_TRACK_KEY);
  } catch {
    // ignore
  }
}

export function getInviteProgressTrack(): InviteProgressTrack {
  if (typeof window === 'undefined') return 'signup';
  try {
    const stored = sessionStorage.getItem(INVITE_PROGRESS_TRACK_KEY);
    if (stored === 'signin' || stored === 'signup') return stored;
  } catch {
    // ignore
  }
  return 'signup';
}

export function normalizeInvitePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function resolveInviteProgressStep(
  pathname: string,
  isAuthenticated = false,
): InviteProgressStep | null {
  const path = normalizeInvitePathname(pathname);

  if (path.startsWith('/invite/') || path === '/invite') {
    return isAuthenticated ? 'accept' : 'invite_open';
  }
  if (path === '/signup' || path === '/signin') return 'auth';
  if (path === '/welcome/email') return 'email';
  if (path === '/welcome/user') return 'welcome_user';
  if (path === '/welcome/role') return 'welcome_role';
  if (path === '/welcome/socials') return 'welcome_socials';
  return null;
}

export function resolveInviteProgressTrack(
  pathname: string,
  storedTrack: InviteProgressTrack = 'signup',
): InviteProgressTrack {
  const path = normalizeInvitePathname(pathname);
  if (path === '/signin') return 'signin';
  if (path === '/signup' || path.startsWith('/welcome/')) return 'signup';
  return storedTrack;
}

export function computeInviteProgress(
  step: InviteProgressStep,
  track: InviteProgressTrack,
): InviteProgress | null {
  const steps = track === 'signin' ? SIGNIN_STEPS : SIGNUP_STEPS;
  const index = steps.indexOf(step);
  if (index < 0) return null;

  const total = steps.length;
  const current = index + 1;
  return {
    remaining: total - index,
    total,
    current,
    track,
  };
}

export function getInviteProgress(input: {
  pathname: string;
  search?: { invite?: string; redirect?: string };
  isAuthenticated?: boolean;
}): InviteProgress | null {
  const step = resolveInviteProgressStep(input.pathname, input.isAuthenticated);
  if (!step) return null;

  // Уже авторизован на экране принятия — остался один клик, полоска не нужна.
  if (step === 'accept' && input.isAuthenticated) return null;

  const path = normalizeInvitePathname(input.pathname);
  const fromSearch = Boolean(getInviteCodeFromSearch(input.search));
  const onInvitePage = path.startsWith('/invite');

  if (!onInvitePage && !fromSearch) {
    // На обычных /signin и /signup старый pending_code в storage не должен показывать прогресс.
    if (path === '/signin' || path === '/signup') return null;
    if (!getPendingInviteCode()) return null;
  }

  const track = resolveInviteProgressTrack(input.pathname, getInviteProgressTrack());
  return computeInviteProgress(step, track);
}

export type InviteFunnelMeta = {
  invite_progress_track: 'signup' | 'signin' | 'already_auth';
  invite_progress_step: InviteProgressStep | 'accept_direct';
  invite_progress_current: number;
  invite_progress_total: number;
};

/** Трек из sessionStorage без дефолта на signup — чтобы отличить already_auth. */
export function getStoredInviteProgressTrack(): InviteProgressTrack | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(INVITE_PROGRESS_TRACK_KEY);
    if (stored === 'signin' || stored === 'signup') return stored;
  } catch {
    // ignore
  }
  return null;
}

/**
 * Мета воронки для Umami. В отличие от UI-прогресса, для авторизованного
 * `/invite` не скрывается: либо last step signup/signin, либо `already_auth`.
 */
export function getInviteFunnelMeta(input: {
  pathname: string;
  search?: { invite?: string; redirect?: string };
  isAuthenticated?: boolean;
}): InviteFunnelMeta | null {
  const path = normalizeInvitePathname(input.pathname);
  const fromSearch = Boolean(getInviteCodeFromSearch(input.search));
  const onInvitePage = path.startsWith('/invite');

  if (!onInvitePage && !fromSearch) {
    if (path === '/signin' || path === '/signup') return null;
    if (!getPendingInviteCode()) return null;
  }

  if (onInvitePage && input.isAuthenticated) {
    const storedTrack = getStoredInviteProgressTrack();
    if (!storedTrack) {
      return {
        invite_progress_track: 'already_auth',
        invite_progress_step: 'accept_direct',
        invite_progress_current: 1,
        invite_progress_total: 1,
      };
    }

    const progress = computeInviteProgress('accept', storedTrack);
    if (!progress) return null;

    return {
      invite_progress_track: storedTrack,
      invite_progress_step: 'accept',
      invite_progress_current: progress.current,
      invite_progress_total: progress.total,
    };
  }

  const step = resolveInviteProgressStep(input.pathname, input.isAuthenticated);
  if (!step) return null;

  const track = resolveInviteProgressTrack(input.pathname, getInviteProgressTrack());
  const progress = computeInviteProgress(step, track);
  if (!progress) return null;

  return {
    invite_progress_track: track,
    invite_progress_step: step,
    invite_progress_current: progress.current,
    invite_progress_total: progress.total,
  };
}

/** Свойства воронки для текущего window.location; пустой объект вне invite-flow. */
export function getInviteFunnelEventProps(
  isAuthenticated?: boolean,
): (InviteFunnelMeta & { has_invite: true }) | Record<string, never> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const meta = getInviteFunnelMeta({
    pathname: window.location.pathname,
    search: {
      invite: params.get('invite') ?? undefined,
      redirect: params.get('redirect') ?? undefined,
    },
    isAuthenticated,
  });

  return meta ? { has_invite: true, ...meta } : {};
}
