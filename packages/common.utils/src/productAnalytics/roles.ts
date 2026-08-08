import type { ProductAnalyticsRole } from './types';

export function getProductAnalyticsRole(defaultLayout?: string | null): ProductAnalyticsRole {
  if (defaultLayout === 'tutor') return 'tutor';
  if (defaultLayout === 'student') return 'student';
  if (defaultLayout === 'parent') return 'parent';
  return 'unknown';
}
