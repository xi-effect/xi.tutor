import * as z from 'zod';

// Валидация времени HH:MM
const timeValidation = z.string().refine((time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}, 'Неверный формат времени');

// Длительность в формате H:MM или HH:MM (часы 0–23, минуты 0–59)
const durationValidation = z.string().refine((dur) => {
  const regex = /^([0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(dur);
}, 'Неверный формат длительности');

export const formSchema = z.object({
  title: z.string().min(1, 'Введите название'),
  studentId: z.string().min(1, 'Выберите ученика или группу'),
  startTime: timeValidation,
  duration: durationValidation,
  startDate: z.date({ error: 'Укажите дату' }),
  repeatMode: z.enum(['none', 'weekly', 'custom']).default('none'),
  repeatDays: z.array(z.number().min(0).max(6)).default([]), // 0 = Пн, 1 = Вт, ... 6 = Вс
});

export type FormInput = z.input<typeof formSchema>;
export type FormData = z.output<typeof formSchema>;
