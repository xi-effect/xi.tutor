import type { TFunction } from 'i18next';
import * as z from 'zod';
import { durationBetweenMinutes, MAX_LESSON_DURATION_MINUTES } from '../utils/utils';

export const createMovingFormSchema = (lessonKind: 'one-off' | 'recurring', t: TFunction) => {
  const timeValidation = z.string().refine((time) => {
    if (time === '') return true;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }, t('validation.invalidTime'));

  const movingFormBase = z.object({
    startDate: z.date({ error: t('validation.dateRequired') }),
    startTime: timeValidation,
    endTime: timeValidation,
    moveMode: z.enum(['single', 'single_and_next']).optional(),
    repeatWeekdays: z.array(z.number().min(0).max(6)).default([]),
  });

  return movingFormBase.superRefine((data, ctx) => {
    if (data.startTime === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('validation.startTimeRequired'),
        path: ['startTime'],
      });
    }
    if (data.endTime === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('validation.endTimeRequired'),
        path: ['endTime'],
      });
    }
    if (data.startTime !== '' && data.endTime !== '') {
      const durationMinutes = durationBetweenMinutes(data.startTime, data.endTime);
      if (durationMinutes === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.endAfterStart'),
          path: ['endTime'],
        });
      } else if (durationMinutes > MAX_LESSON_DURATION_MINUTES) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.maxDuration'),
          path: ['endTime'],
        });
      }
    }
    if (
      lessonKind === 'recurring' &&
      data.moveMode === 'single_and_next' &&
      !data.repeatWeekdays?.length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('validation.repeatDaysRequired'),
        path: ['repeatWeekdays'],
      });
    }
  });
};

type MovingFormSchema = ReturnType<typeof createMovingFormSchema>;
export type FormInput = z.input<MovingFormSchema>;
export type FormData = z.output<MovingFormSchema>;
