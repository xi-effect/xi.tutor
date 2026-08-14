import type { SigninAnalyticsSource } from './types';
import { createInviteTrackingId } from './inviteTracking';

export const INVITE_PENDING_CODE_KEY = 'invite.pending_code';

/**
 * Достаёт код приглашения из уже существующего контекста:
 * `invite.pending_code` (root-guard) или `redirect` с `/invite/{code}`.
 * Сырой токен наружу в Umami не отдаём — только для локального хеширования.
 */
export function getPendingInviteCode(search?: {
  redirect?: string;
  invite?: string;
}): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const fromSearchInvite = search?.invite?.trim();
  if (fromSearchInvite) return fromSearchInvite;

  try {
    const pending = localStorage.getItem(INVITE_PENDING_CODE_KEY)?.trim();
    if (pending) return pending;
  } catch {
    // ignore
  }

  const redirect = search?.redirect;
  if (!redirect) return undefined;

  try {
    const url = new URL(redirect, window.location.origin);
    const match = url.pathname.match(/\/invite\/([^/]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  } catch {
    const match = redirect.match(/\/invite\/([^/?#]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }

  return undefined;
}

/**
 * Источник формы входа: invite-flow (pending_code / redirect /invite) → invite,
 * обычный /signin → signin.
 */
export function inferSigninSource(search?: {
  redirect?: string;
  invite?: string;
}): SigninAnalyticsSource {
  if (typeof window === 'undefined') return 'unknown';

  if (getPendingInviteCode(search)) return 'invite';

  const path = window.location.pathname;
  if (path.includes('/signin')) return 'signin';

  return 'unknown';
}

const INVITE_PAGE_VIEWED_PREFIX = 'pa_invite_page_viewed:';
const INVITE_LOGIN_CLICKED_PREFIX = 'pa_invite_login_clicked:';

function hasSessionFlag(key: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(sessionStorage.getItem(key));
  } catch {
    return false;
  }
}

function setSessionFlag(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    // ignore
  }
}

/** Дедуп student_invite_page_viewed на вкладку (signin → invite после auth). */
export function shouldTrackInvitePageViewed(inviteCode: string): boolean {
  const key = `${INVITE_PAGE_VIEWED_PREFIX}${inviteCode}`;
  if (hasSessionFlag(key)) return false;
  setSessionFlag(key);
  return true;
}

/** Дедуп student_invite_login_clicked на вкладку. */
export function shouldTrackInviteLoginClicked(inviteCode: string): boolean {
  const key = `${INVITE_LOGIN_CLICKED_PREFIX}${inviteCode}`;
  if (hasSessionFlag(key)) return false;
  setSessionFlag(key);
  return true;
}

/** invite_tracking_id из текущего invite-контекста (без raw token в результате). */
export async function getInviteTrackingIdFromContext(search?: {
  redirect?: string;
  invite?: string;
}): Promise<string | undefined> {
  const code = getPendingInviteCode(search);
  if (!code) return undefined;

  try {
    if (typeof crypto === 'undefined' || typeof crypto.subtle?.digest !== 'function') {
      return undefined;
    }
    return await createInviteTrackingId(code);
  } catch {
    return undefined;
  }
}
