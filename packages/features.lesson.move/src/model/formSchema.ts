import * as z from 'zod';
import { durationBetweenMinutes, MAX_LESSON_DURATION_MINUTES } from '../utils/utils';

const timeValidation = z.string().refine((time) => {
  if (time === '') return true;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}, 'Неверный формат времени');

const movingFormBase = z.object({
  startDate: z.date({ error: 'Укажите дату' }),
  startTime: timeValidation,
  endTime: timeValidation,
  moveMode: z.enum(['single', 'single_and_next']).optional(),
  repeatWeekdays: z.array(z.number().min(0).max(6)).default([]),
});

export const createMovingFormSchema = (lessonKind: 'one-off' | 'recurring') =>
  movingFormBase.superRefine((data, ctx) => {
    if (data.startTime === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Укажите время начала',
        path: ['startTime'],
      });
    }
    if (data.endTime === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Укажите время окончания',
        path: ['endTime'],
      });
    }
    if (data.startTime !== '' && data.endTime !== '') {
      const durationMinutes = durationBetweenMinutes(data.startTime, data.endTime);
      if (durationMinutes === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Время окончания должно быть позже начала',
          path: ['endTime'],
        });
      } else if (durationMinutes > MAX_LESSON_DURATION_MINUTES) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Максимальная длительность занятия — 12 часов',
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
        message: 'Выберите хотя бы один день',
        path: ['repeatWeekdays'],
      });
    }
  });

export type FormInput = z.input<typeof movingFormBase>;
export type FormData = z.output<typeof movingFormBase>;
