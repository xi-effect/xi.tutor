const MS_DAY = 24 * 60 * 60 * 1000;

const startOfLocalDay = (value: number): number => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const getRemainingSubscriptionDays = (
  planId: 'basic' | 'pro',
  renewsAt: string,
  now = Date.now(),
): number => {
  if (planId !== 'pro') return 0;

  const end = new Date(renewsAt).getTime();
  if (Number.isNaN(end)) return 0;

  return Math.max(0, Math.round((startOfLocalDay(end) - startOfLocalDay(now)) / MS_DAY));
};

export const isPaidPeriodExpired = (
  planId: 'basic' | 'pro',
  renewsAt: string,
  now = Date.now(),
): boolean => {
  if (planId !== 'pro') return false;

  const end = new Date(renewsAt).getTime();
  if (Number.isNaN(end)) return true;

  return startOfLocalDay(end) < startOfLocalDay(now);
};

export const addDaysFromLaterOf = (iso: string, days: number, now = Date.now()): string => {
  const current = new Date(iso).getTime();
  const base = Math.max(now, Number.isNaN(current) ? now : current);
  return new Date(base + days * MS_DAY).toISOString();
};
