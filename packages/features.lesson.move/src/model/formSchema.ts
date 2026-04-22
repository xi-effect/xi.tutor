import * as z from 'zod';
import { timeToMinutes } from '../utils/utils';

const timeValidation = z.string().refine((time) => {
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
    if (timeToMinutes(data.endTime) <= timeToMinutes(data.startTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Время окончания должно быть позже начала',
        path: ['endTime'],
      });
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
