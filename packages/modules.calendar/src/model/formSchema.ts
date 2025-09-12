import * as z from 'zod';

// Валидация времени
const timeValidation = z.string().refine((time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}, 'Неверный формат времени');

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Базовые поля для всех типов событий
const baseFields = z.object({
  title: z.string().min(1, 'Введите название события'),
  type: z.enum(['lesson', 'rest'], {
    required_error: 'Выберите тип события',
  }),
});

const timeFields = z.object({
  startTime: timeValidation,
  endTime: timeValidation,
  isAllDay: z.boolean().default(false),
  startDate: z
    .string()
    .min(1, 'Укажите дату')
    .regex(/^\d{2}\.\d{2}\.\d{4}$/, 'Формат даты: дд.мм.гггг'),
  endDate: z
    .string()
    .regex(/^\d{2}\.\d{2}\.\d{4}$/, 'Формат даты: дд.мм.гггг')
    .optional(),
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
});

const lessonFields = z.object({
  type: z.literal('lesson'),
  studentId: z.string().min(1, 'Выберите студента'),
  subjectName: z.string().min(1, 'Введите название предмета'),
  lessonType: z.enum(['group', 'individual'], {
    required_error: 'Выберите тип занятия',
  }),
  description: z.string().optional(),
});

const restEventSchema = z.object({
  ...baseFields.shape,
  ...timeFields.shape,
  type: z.literal('rest'),
});

const lessonEventSchema = z.object({
  ...baseFields.shape,
  ...lessonFields.shape,
  ...timeFields.shape,
  type: z.literal('lesson'),
});

export const eventFormSchema = z
  .discriminatedUnion('type', [lessonEventSchema, restEventSchema])
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

export type EventFormData = z.infer<typeof eventFormSchema>;
export type LessonFields = z.infer<typeof lessonFields>;
export type TimeFields = z.infer<typeof timeFields>;
