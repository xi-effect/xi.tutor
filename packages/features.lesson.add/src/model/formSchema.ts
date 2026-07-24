import type { TFunction } from 'i18next';
import * as z from 'zod';
import { durationBetweenMinutes, MAX_LESSON_DURATION_MINUTES } from '../utils';

export const createFormSchema = (t: TFunction) => {
  const timeValidation = z.string().refine((time) => {
    if (time === '') return true;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }, t('validation.invalidTime'));

  return z
    .object({
      title: z.string().min(1, t('validation.titleRequired')),
      description: z.string().max(4000).optional().default(''),
      studentId: z.string().min(1, t('validation.studentRequired')),
      startTime: timeValidation,
      endTime: timeValidation,
      startDate: z.date({ error: t('validation.dateRequired') }),
      repeatMode: z.enum(['none', 'weekly', 'custom']).default('none'),
      repeatDays: z.array(z.number().min(0).max(6)).default([]), // 0 = Пн, 1 = Вт, ... 6 = Вс
    })
    .superRefine((data, ctx) => {
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
      if (data.startTime === '' || data.endTime === '') return;

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

      if (data.repeatMode !== 'none' && data.repeatDays.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.repeatDaysRequired'),
          path: ['repeatDays'],
        });
      }
    });
};

export type FormInput = z.input<ReturnType<typeof createFormSchema>>;
export type FormData = z.output<ReturnType<typeof createFormSchema>>;
