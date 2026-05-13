import { z } from 'zod';

export const changeLessonFormSchema = z.object({
  title: z.string().min(1, 'Введите название'),
  description: z.string().optional(),
});

export type ChangeLessonFormData = z.infer<typeof changeLessonFormSchema>;
