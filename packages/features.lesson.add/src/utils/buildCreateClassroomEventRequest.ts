import type { CreateClassroomEventRequestDto } from 'common.api';
import { buildRepetitionModeInput, getActivePeriodDays, toLocalISOString } from 'modules.calendar';
import type { FormData } from '../model';
import { durationBetweenMinutes } from './index';

/** Объединить дату и строку времени "HH:MM" в ISO-строку с timezone пользователя */
const buildStartsAt = (startDate: Date, startTime: string): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const d = new Date(startDate);
  d.setHours(hours, minutes, 0, 0);
  return toLocalISOString(d);
};

const buildDurationSeconds = (startTime: string, endTime: string): number =>
  durationBetweenMinutes(startTime, endTime) * 60;

/**
 * Биткарта недели: 0=Пн, 1=Вт, ..., 6=Вс → бит 0 = Пн.
 * Если список дней пустой, кладём в маску день из startsAt.
 */
const buildWeeklyBitmask = (days: number[], fallbackDate: Date): number => {
  if (days.length > 0) {
    return days.reduce((mask, day) => mask | (1 << day), 0);
  }
  const jsDay = fallbackDate.getDay();
  const day = jsDay === 0 ? 6 : jsDay - 1;
  return 1 << day;
};

export const buildCreateClassroomEventRequest = (
  data: FormData,
): CreateClassroomEventRequestDto => {
  const startsAt = buildStartsAt(data.startDate, data.startTime);
  const durationSeconds = buildDurationSeconds(data.startTime, data.endTime);

  if (data.repeatMode === 'none') {
    return {
      kind: 'single',
      event: {
        name: data.title.trim(),
        description: data.description || null,
      },
      sole_instance: {
        starts_at: startsAt,
        duration_seconds: durationSeconds,
      },
    };
  }

  const weeklyBitmask = buildWeeklyBitmask(data.repeatDays, data.startDate);
  const activePeriodDays =
    data.repeatEnds === 'never' ? null : getActivePeriodDays(data.startDate, data.repeatUntil);

  return {
    kind: 'repeating',
    event: {
      name: data.title.trim(),
      description: data.description || null,
    },
    repetition_mode: buildRepetitionModeInput({
      startsAt,
      durationSeconds,
      weeklyBitmask,
      activePeriodDays,
    }),
  };
};
