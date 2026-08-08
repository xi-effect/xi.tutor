import type { ProductAnalyticsSource } from './types';

export function inferProductAnalyticsSourceFromPathname(pathname: string): ProductAnalyticsSource {
  if (pathname === '/' || pathname.startsWith('/main')) return 'main';
  if (pathname.startsWith('/schedule') || pathname.startsWith('/calendar')) return 'schedule';
  if (pathname.startsWith('/classrooms')) return 'classroom';
  if (pathname.startsWith('/materials')) return 'materials';
  if (pathname.startsWith('/call')) return 'call';
  if (pathname.startsWith('/invite')) return 'invite';
  if (pathname.startsWith('/board')) return 'materials';
  return 'unknown';
}
