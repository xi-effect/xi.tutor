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
const baseEventSchema = z.object({
  title: z.string().min(1, 'Введите название события'),
  type: z.enum(['lesson', 'rest'], {
    required_error: 'Выберите тип события',
  }),
  startTime: timeValidation,
  endTime: timeValidation,
  isAllDay: z.boolean().default(false),
});

const lessonEventSchema = baseEventSchema.extend({
  type: z.literal('lesson'),
  studentId: z.string().min(1, 'Выберите студента'),
  subjectName: z.string().min(1, 'Введите название предмета'),
  lessonType: z.enum(['group', 'individual'], {
    required_error: 'Выберите тип занятия',
  }),
  description: z.string().optional(),
});

const restEventSchema = baseEventSchema.extend({
  type: z.literal('rest'),
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
export type LessonEventData = z.infer<typeof lessonEventSchema>;
export type RestEventData = z.infer<typeof restEventSchema>;
