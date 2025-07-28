import * as z from 'zod';

// Базовая схема для всех типов событий
const baseEventSchema = z.object({
  title: z.string().min(1, 'Введите название события'),
  type: z.enum(['lesson', 'rest'], {
    required_error: 'Выберите тип события',
  }),
  startTime: z.string().min(1, 'Введите время начала'),
  endTime: z.string().min(1, 'Введите время окончания'),
  isAllDay: z.boolean().default(false),
});

// Схема для занятий с дополнительными полями
const lessonEventSchema = baseEventSchema.extend({
  type: z.literal('lesson'),
  studentId: z.string().min(1, 'Выберите студента'),
  subjectName: z.string().min(1, 'Введите название предмета'),
  lessonType: z.enum(['group', 'individual'], {
    required_error: 'Выберите тип занятия',
  }),
  description: z.string().optional(),
});

// Схема для отдыха (только базовые поля)
const restEventSchema = baseEventSchema.extend({
  type: z.literal('rest'),
});

// Объединенная схема с условной валидацией
export const eventFormSchema = z.discriminatedUnion('type', [lessonEventSchema, restEventSchema]);

export type EventFormData = z.infer<typeof eventFormSchema>;
export type LessonEventData = z.infer<typeof lessonEventSchema>;
export type RestEventData = z.infer<typeof restEventSchema>;
