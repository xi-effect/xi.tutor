import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns';
import type { RepetitionModeInputDto } from 'common.api';

/** 0=Пн … 6=Вс — все дни выбраны → `kind: daily` */
export const FULL_WEEK_BITMASK = 0x7f;

/**
 * Календарные дни активности серии, включая даты начала и окончания.
 * `null`, если окончания нет или дата окончания раньше начала.
 */
export function getActivePeriodDays(
  startsAt: Date | string,
  repeatUntil: Date | string | null | undefined,
): number | null {
  if (repeatUntil == null) return null;

  const start = startOfDay(toDate(startsAt));
  const until = startOfDay(toDate(repeatUntil));
  const days = differenceInCalendarDays(until, start) + 1;

  return days > 0 ? days : null;
}

/** Обратное к {@link getActivePeriodDays}: дата окончания относительно `starts_at`. */
export function getRepeatUntil(
  startsAt: Date | string,
  activePeriodDays: number | null | undefined,
): Date | null {
  if (activePeriodDays == null || activePeriodDays <= 0) return null;

  return addDays(startOfDay(toDate(startsAt)), activePeriodDays - 1);
}

type BuildRepetitionModeInputParams = {
  startsAt: string;
  durationSeconds: number;
  weeklyBitmask: number;
  activePeriodDays: number | null;
};

/** Единый payload `daily` / `weekly` для create и last-repetition-mode. */
export function buildRepetitionModeInput({
  startsAt,
  durationSeconds,
  weeklyBitmask,
  activePeriodDays,
}: BuildRepetitionModeInputParams): RepetitionModeInputDto {
  if (weeklyBitmask === FULL_WEEK_BITMASK) {
    return {
      kind: 'daily',
      starts_at: startsAt,
      duration_seconds: durationSeconds,
      active_period_days: activePeriodDays,
    };
  }

  return {
    kind: 'weekly',
    starts_at: startsAt,
    duration_seconds: durationSeconds,
    weekly_bitmask: weeklyBitmask,
    active_period_days: activePeriodDays,
  };
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}
