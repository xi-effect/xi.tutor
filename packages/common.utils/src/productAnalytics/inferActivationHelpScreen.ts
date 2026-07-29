import type { ActivationHelpScreen } from './types';

export function inferActivationHelpScreen(pathname?: string): ActivationHelpScreen | null {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : undefined);

  if (!path) return null;

  if (path.includes('/signup')) return 'signup';
  if (path.includes('/welcome/email') || path.includes('/confirm-email')) {
    return 'email_confirmation';
  }
  if (path.includes('/welcome')) return 'onboarding';
  if (path.includes('/invite')) return 'student_invite';

  return null;
}
