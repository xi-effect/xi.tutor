import * as z from 'zod';

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Валидация времени
const timeValidation = z.string().refine((time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}, 'Неверный формат времени');

export const formSchema = z
  .object({
    title: z.string(),
    description: z.string().optional(),
    studentId: z.string().min(1, 'Выберите студента'),
    startTime: timeValidation,
    endTime: timeValidation,
    startDate: z.date({ required_error: 'Укажите дату' }),
    shouldRepeat: z
      .enum([
        'dont_repeat',
        'every_day',
        'every_work_day',
        'every_week',
        'every_2_weeks',
        'every_month',
      ])
      .default('dont_repeat'),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const startMinutes = timeToMinutes(data.startTime);
        const endMinutes = timeToMinutes(data.endTime);
        return startMinutes <= endMinutes;
      }
      return true;
    },
    {
      message: 'Время начала не может быть позже времени окончания',
      path: ['startTime'],
    },
  );

export type FormData = z.infer<typeof formSchema>;
