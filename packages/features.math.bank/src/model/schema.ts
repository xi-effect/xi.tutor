import { z } from 'zod';

export { MATH_BANK_BASE_URL, MATH_DIFFICULTIES, MATH_GRADES } from './constants';

export const examKindSchema = z.enum(['OGE', 'EGE_BASE', 'EGE_PROFILE']);
export const examRelationSchema = z.enum(['direct', 'foundation', 'adjacent']);
export const gradeSchema = z.union([
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
  z.literal(10),
  z.literal(11),
]);
export const difficultySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const taskTypeSchema = z.enum([
  'calculation',
  'short_answer',
  'word_problem',
  'equation',
  'inequality',
  'expression',
  'function',
  'geometry',
  'probability',
  'applied',
  'parameter',
]);

export const mathTaskExamMappingSchema = z.object({
  exam: examKindSchema,
  year: z.number().int().min(2020),
  taskNumbers: z.array(z.number().int().positive()).min(1),
  relation: examRelationSchema,
  note: z.string().optional(),
});

/**
 * Figure payload is intentionally semantic and independent from tldraw JSON.
 * The UI adapter converts this object to tldraw shapes.
 */
export const mathTaskFigureSchema = z
  .object({
    kind: z.string().min(1),
  })
  .catchall(z.unknown());

export const mathTaskSchema = z.object({
  id: z.string().min(1),
  contentVersion: z.string().min(1),
  subject: z.literal('mathematics'),
  subjectLabel: z.string().min(1),
  grade: gradeSchema,
  curriculum: z.object({
    country: z.literal('RU'),
    framework: z.literal('Федеральная рабочая программа'),
    level: z.enum(['base', 'advanced']),
    referenceYear: z.number().int().min(2020),
  }),
  topicId: z.string().min(1),
  topic: z.string().min(1),
  subtopic: z.string().min(1),
  skills: z.array(z.string().min(1)).min(1),
  difficulty: difficultySchema,
  taskType: taskTypeSchema,
  statement: z.object({ text: z.string().min(1) }),
  answer: z.object({
    type: z.enum(['number', 'fraction', 'expression']),
    value: z.string(),
    display: z.string(),
  }),
  solution: z.object({
    short: z.string().min(1),
    steps: z.array(z.string().min(1)).min(1),
  }),
  hints: z.array(z.string()),
  tags: z.array(z.string()),
  examMappings: z.array(mathTaskExamMappingSchema),
  figure: mathTaskFigureSchema.nullable(),
  generator: z.object({
    id: z.string().min(1),
    variantGroupId: z.string().min(1),
    parameters: z.record(z.string(), z.unknown()),
    seed: z.number().int(),
  }),
  source: z.object({
    kind: z.literal('synthetic'),
    origin: z.string().min(1),
    copiedFromExternalBank: z.literal(false),
    note: z.string().min(1),
  }),
  search: z.object({
    aliases: z.array(z.string()),
    terms: z.array(z.string()),
    normalizedText: z.string(),
  }),
  fingerprint: z.string().min(8),
});

export const mathTaskArraySchema = z.array(mathTaskSchema);

export type ExamKind = z.infer<typeof examKindSchema>;
export type ExamRelation = z.infer<typeof examRelationSchema>;
export type MathGrade = z.infer<typeof gradeSchema>;
export type MathDifficulty = z.infer<typeof difficultySchema>;
export type MathTaskType = z.infer<typeof taskTypeSchema>;
export type MathTaskExamMapping = z.infer<typeof mathTaskExamMappingSchema>;
export type MathTaskFigure = z.infer<typeof mathTaskFigureSchema>;
export type MathTask = z.infer<typeof mathTaskSchema>;

export type MathBankCatalogItem = {
  grade: number;
  topicId: string;
  topic: string;
  subtopic: string;
  skills: string[];
  count: number;
};

export type MathBankExamIndexItem = {
  exam: ExamKind;
  year: number;
  taskNumber: number;
  count: number;
};
