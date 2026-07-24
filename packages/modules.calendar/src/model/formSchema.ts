import type { TFunction } from 'i18next';
import * as z from 'zod';

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const createEventFormSchema = (t: TFunction) => {
  const timeValidation = z.string().refine((time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }, t('validation.invalidTime'));

  const baseFields = z.object({
    title: z.string().min(1, t('validation.titleRequired')),
    type: z.enum(['lesson', 'rest'], {
      error: t('validation.typeRequired'),
    }),
  });

  const timeFields = z.object({
    startTime: timeValidation,
    endTime: timeValidation,
    isAllDay: z.boolean().default(false),
    startDate: z
      .string()
      .min(1, t('validation.dateRequired'))
      .regex(/^\d{2}\.\d{2}\.\d{4}$/, t('validation.dateFormat')),
    endDate: z
      .string()
      .regex(/^\d{2}\.\d{2}\.\d{4}$/, t('validation.dateFormat'))
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
    studentId: z.string().min(1, t('validation.studentRequired')),
    subjectName: z.string().min(1, t('validation.subjectRequired')),
    lessonType: z.enum(['group', 'individual'], {
      error: t('validation.lessonTypeRequired'),
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

  return z.discriminatedUnion('type', [lessonEventSchema, restEventSchema]).refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const startMinutes = timeToMinutes(data.startTime);
        const endMinutes = timeToMinutes(data.endTime);
        return startMinutes <= endMinutes;
      }
      return true;
    },
    {
      message: t('validation.endAfterStart'),
      path: ['startTime'],
    },
  );
};

export type EventFormInput = z.input<ReturnType<typeof createEventFormSchema>>;
export type EventFormData = z.output<ReturnType<typeof createEventFormSchema>>;
export type LessonFields = {
  type: 'lesson';
  studentId: string;
  subjectName: string;
  lessonType: 'group' | 'individual';
  description?: string;
};
export type TimeFields = {
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  startDate: string;
  endDate?: string;
  shouldRepeat:
    'dont_repeat' | 'every_day' | 'every_work_day' | 'every_week' | 'every_2_weeks' | 'every_month';
};
