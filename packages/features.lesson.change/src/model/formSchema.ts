import type { TFunction } from 'i18next';
import { z } from 'zod';

export const createChangeLessonFormSchema = (t: TFunction) =>
  z.object({
    title: z.string().min(1, t('validation.titleRequired')),
    description: z.string().optional(),
  });

export type ChangeLessonFormData = z.infer<ReturnType<typeof createChangeLessonFormSchema>>;
