import type { EmailConfirmationSource } from './types';

export function inferEmailConfirmationSource(options?: {
  hasToken?: boolean;
}): EmailConfirmationSource {
  if (options?.hasToken) return 'email_link';

  if (typeof window === 'undefined') return 'unknown';

  try {
    const previousPath = sessionStorage.getItem('previousPath');
    if (previousPath?.includes('signup')) return 'signup';
  } catch {
    // ignore
  }

  return 'session_restore';
}
