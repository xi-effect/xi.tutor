import type { SignupEntryPoint } from './types';

/**
 * Определяет точку входа на регистрацию по referrer / query / sessionStorage.
 */
export function inferSignupEntryPoint(search?: {
  invite?: string;
  redirect?: string;
  from?: string;
}): SignupEntryPoint {
  if (typeof window === 'undefined') return 'unknown';

  if (search?.invite || search?.from === 'invite') return 'invite';
  if (search?.from === 'login' || search?.redirect?.includes('signin')) return 'login';

  try {
    const previousPath = sessionStorage.getItem('previousPath');
    if (previousPath?.includes('signin') || previousPath?.includes('login')) return 'login';
    if (previousPath?.includes('invite')) return 'invite';
  } catch {
    // ignore
  }

  const referrer = document.referrer;
  if (!referrer) return 'direct';

  try {
    const refUrl = new URL(referrer);
    if (refUrl.origin === window.location.origin) {
      if (refUrl.pathname.includes('signin')) return 'login';
      if (refUrl.pathname.includes('invite')) return 'invite';
      return 'direct';
    }

    // Внешний сайт / лендинг
    return 'landing';
  } catch {
    return 'unknown';
  }
}
