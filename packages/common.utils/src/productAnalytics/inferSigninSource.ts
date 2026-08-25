import type { SigninAnalyticsSource } from './types';
import { createInviteTrackingId } from './inviteTracking';

export const INVITE_PENDING_CODE_KEY = 'invite.pending_code';

/** Сохраняет код приглашения до успешного accept. Не логирует и не отдаёт в Umami. */
export function persistPendingInviteCode(code?: string | null): void {
  const normalized = code?.trim();
  if (!normalized || typeof window === 'undefined') return;

  try {
    localStorage.setItem(INVITE_PENDING_CODE_KEY, normalized);
  } catch {
    // ignore
  }
}

/** Очищает временный invite-context после успешного принятия. */
export function clearPendingInviteCode(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(INVITE_PENDING_CODE_KEY);
  } catch {
    // ignore
  }

  try {
    sessionStorage.removeItem('invite.progress_track');
  } catch {
    // ignore
  }
}

/** Search-параметры signup/signin, чтобы не потерять приглашение при refresh. */
export function getInviteAuthSearch(inviteId: string): { redirect: string; invite: string } {
  const code = inviteId.trim();
  return {
    redirect: `/invite/${code}`,
    invite: code,
  };
}

function readStoredPendingInviteCode(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return localStorage.getItem(INVITE_PENDING_CODE_KEY)?.trim() || undefined;
  } catch {
    return undefined;
  }
}

function readInviteCodeFromRedirect(redirect?: string): string | undefined {
  if (!redirect) return undefined;

  try {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://app.sovlium.ru';
    const url = new URL(redirect, origin);
    const match = url.pathname.match(/\/invite\/([^/]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  } catch {
    const match = redirect.match(/\/invite\/([^/?#]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }

  return undefined;
}

/**
 * Код приглашения только из текущего URL (`invite` или `redirect` на `/invite/{code}`).
 * Не читает localStorage — чтобы обычный /signin не подхватывал старый invite-flow.
 */
export function getInviteCodeFromSearch(search?: {
  redirect?: string;
  invite?: string;
}): string | undefined {
  const fromSearchInvite = search?.invite?.trim();
  if (fromSearchInvite) return fromSearchInvite;
  return readInviteCodeFromRedirect(search?.redirect);
}

/**
 * Достаёт код приглашения из уже существующего контекста:
 * query, `invite.pending_code` или `redirect` с `/invite/{code}`.
 * Сырой токен наружу в Umami не отдаём — только для локального хеширования.
 */
export function getPendingInviteCode(search?: {
  redirect?: string;
  invite?: string;
}): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const fromSearch = getInviteCodeFromSearch(search);
  if (fromSearch) return fromSearch;

  return readStoredPendingInviteCode();
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
const INVITE_SIGNUP_CLICKED_PREFIX = 'pa_invite_signup_clicked:';

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

/** Дедуп student_invite_signup_clicked на вкладку. */
export function shouldTrackInviteSignupClicked(inviteCode: string): boolean {
  const key = `${INVITE_SIGNUP_CLICKED_PREFIX}${inviteCode}`;
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
