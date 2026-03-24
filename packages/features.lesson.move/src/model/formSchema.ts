import * as z from 'zod';

const timeValidation = z.string().refine((time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}, 'Неверный формат времени');

const durationValidation = z.string().refine((dur) => {
  const regex = /^([0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(dur);
}, 'Неверный формат длительности');

export const formSchema = z.object({
  title: z.string().min(1, 'Введите название'),
  studentId: z.string().min(1, 'Выберите кабинет'),
  startTime: timeValidation,
  duration: durationValidation,
  startDate: z.date({ required_error: 'Укажите дату' }),
  moveMode: z.enum(['single', 'single_and_next']).default('single_and_next'),
});

export type FormData = z.infer<typeof formSchema>;
