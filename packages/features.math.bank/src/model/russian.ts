import { z } from 'zod';
import { difficultySchema, examRelationSchema, gradeSchema } from './schema';

export const russianExamKindSchema = z.enum(['OGE', 'EGE']);

export const russianExamMappingSchema = z.object({
  exam: russianExamKindSchema,
  year: z.number().int().min(2024),
  taskNumbers: z.array(z.number().int().positive()).min(1),
  relation: examRelationSchema,
});

export const russianTaskTypeSchema = z.enum([
  'fill_blank',
  'short_answer',
  'restore_punctuation',
  'multiple_choice',
  'multi_choice',
  'open_rubric',
]);

export const russianTaskAnswerSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('text'), value: z.string().min(1) }),
  z.object({
    kind: z.literal('text_set'),
    value: z.array(z.string().min(1)).min(1),
    acceptableByPosition: z.array(z.array(z.string().min(1)).min(1)).min(1),
  }),
  z.object({ kind: z.literal('choice'), value: z.number().int().positive() }),
  z.object({
    kind: z.literal('multi_choice'),
    value: z.array(z.number().int().positive()).min(1),
  }),
  z.object({
    kind: z.literal('rubric'),
    keyPoints: z.array(z.string().min(1)).min(1),
    rubric: z.array(z.string().min(1)).min(1),
  }),
]);

export const russianTaskSchema = z.object({
  id: z.string().regex(/^ru-ru-\d{5}$/),
  subject: z.literal('russian'),
  grade: gradeSchema,
  topic: z.string().min(1),
  subtopic: z.string().min(1),
  skills: z.array(z.string().min(1)).min(1),
  difficulty: difficultySchema,
  taskType: russianTaskTypeSchema,
  statement: z.string().min(1),
  text: z.string().min(1).optional(),
  options: z.array(z.string().min(1)).min(2).optional(),
  answer: russianTaskAnswerSchema,
  explanation: z.string().min(1),
  hints: z.array(z.string()),
  examMappings: z.array(russianExamMappingSchema),
  source: z.literal('sovlium_original'),
  generator: z.object({
    familyId: z.string().min(1),
    variantGroupId: z.string().min(1),
    seed: z.number().int().positive(),
  }),
  tags: z.array(z.string().min(1)),
  search: z.object({ aliases: z.array(z.string().min(1)) }),
  fingerprint: z.string().regex(/^[0-9a-f]{20}$/),
});

export type RussianExamKind = z.infer<typeof russianExamKindSchema>;
export type RussianTaskType = z.infer<typeof russianTaskTypeSchema>;
export type RussianTaskAnswer = z.infer<typeof russianTaskAnswerSchema>;
export type RussianExamMapping = z.infer<typeof russianExamMappingSchema>;
export type RussianTask = z.infer<typeof russianTaskSchema>;
