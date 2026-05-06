import * as z from 'zod';
import { timeToMinutes } from '../utils';

// Валидация времени HH:MM (пустая строка допустима до отправки формы)
const timeValidation = z.string().refine((time) => {
  if (time === '') return true;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}, 'Неверный формат времени');

export const formSchema = z
  .object({
    title: z.string().min(1, 'Введите название'),
    description: z.string().max(4000).optional().default(''),
    studentId: z.string().min(1, 'Выберите ученика или группу'),
    startTime: timeValidation,
    endTime: timeValidation,
    startDate: z.date({ error: 'Укажите дату' }),
    repeatMode: z.enum(['none', 'weekly', 'custom']).default('none'),
    repeatDays: z.array(z.number().min(0).max(6)).default([]), // 0 = Пн, 1 = Вт, ... 6 = Вс
  })
  .superRefine((data, ctx) => {
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
    if (data.startTime === '' || data.endTime === '') return;

    if (timeToMinutes(data.endTime) <= timeToMinutes(data.startTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Время окончания должно быть позже начала',
        path: ['endTime'],
      });
    }

    if (data.repeatMode !== 'none' && data.repeatDays.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Выберите хотя бы один день недели',
        path: ['repeatDays'],
      });
    }
  });

export type FormInput = z.input<typeof formSchema>;
export type FormData = z.output<typeof formSchema>;
