import * as z from 'zod';

export const formSchema = z.object({
  studentId: z.string().min(1, 'Выберите ученика'),
  subjects: z.array(z.string()).min(1, 'Добавьте хотя бы один предмет'),
});

export type FormData = z.infer<
  z.ZodObject<{
    studentId: z.ZodString;
    subjects: z.ZodArray<z.ZodString>;
  }>
>;
