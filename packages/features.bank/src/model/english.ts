import { z } from 'zod';

export const englishTaskTypeSchema = z.enum([
  'gap',
  'transformation',
  'error-correction',
  'choice',
  'reading',
  'writing',
]);

export const englishExamMappingSchema = z.object({
  exam: z.enum(['oge', 'ege']),
  year: z.literal(2026),
  taskNumbers: z.array(z.number().int().positive()).min(1),
  relation: z.enum(['direct', 'foundation', 'adjacent']),
  section: z.literal('written'),
  note: z.string().min(1),
});

const englishTextAnswerSchema = z.object({
  kind: z.literal('text'),
  accepted: z.array(z.string().min(1)).min(1),
  caseSensitive: z.boolean(),
  ignoreFinalPunctuation: z.boolean(),
});

const englishChoiceAnswerSchema = z.object({
  kind: z.literal('choice'),
  correctOptionId: z.string().min(1),
});

export const englishAnswerSchema = z.discriminatedUnion('kind', [
  englishTextAnswerSchema,
  englishChoiceAnswerSchema,
]);

export const englishOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

export const englishRubricSchema = z.object({
  kind: z.literal('educational'),
  criteria: z
    .array(
      z.object({
        name: z.string().min(1),
        maxPoints: z.number().int().positive(),
        guidance: z.string().min(1),
      }),
    )
    .min(1),
  wordRange: z.tuple([z.number(), z.number()]),
  checklist: z.array(z.string().min(1)).min(1),
});

export const englishTaskSchema = z
  .object({
    id: z.string().regex(/^en-ru-\d{5}$/),
    subject: z.literal('english'),
    grade: z.number().int().min(5).max(11),
    difficulty: z.number().int().min(1).max(5),
    topic: z.string().min(1),
    subtopic: z.string().min(1),
    skills: z.array(z.string()).min(1),
    tags: z.array(z.string()),
    aliases: z.array(z.string()),
    taskType: englishTaskTypeSchema,
    track: z.array(z.enum(['school', 'enrichment', 'exam'])).min(1),
    familyId: z.string().min(1),
    variantGroup: z.string().min(1),
    scenarioId: z.string().min(1),
    fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
    instruction: z.string().min(1),
    statement: z.string().min(1),
    passage: z.string().optional(),
    passageId: z.string().optional(),
    options: z.array(englishOptionSchema).optional(),
    answer: englishAnswerSchema.optional(),
    rubric: englishRubricSchema.optional(),
    hints: z.array(z.string()).min(1),
    solution: z.array(z.string()).min(2),
    evidence: z.string().optional(),
    examMappings: z.array(englishExamMappingSchema),
    reviewStatus: z.literal('generated-needs-editorial-review'),
    provenance: z.object({
      kind: z.literal('original-synthetic'),
      method: z.literal('controlled-template'),
      sourceIds: z.array(z.string()),
    }),
  })
  .strict()
  .superRefine((task, context) => {
    const issue = (message: string) => {
      context.addIssue({ code: 'custom', message });
    };

    if (task.taskType === 'writing') {
      if (!task.rubric || task.answer) {
        issue('Writing task requires a rubric and no closed answer');
      }
    } else if (!task.answer || task.rubric) {
      issue('Closed task requires an answer and no rubric');
    }

    if (task.answer?.kind === 'choice') {
      const answer = task.answer;
      const matches = task.options?.filter((option) => option.id === answer.correctOptionId);
      if (!matches || matches.length !== 1) {
        issue('Choice answer does not match a single option');
      }
    }

    if (task.taskType === 'reading' && (!task.passage || !task.passageId || !task.evidence)) {
      issue('Reading task requires a passage and evidence');
    }
  });

export const englishTaskArraySchema = z.array(englishTaskSchema);

export const englishManifestSchema = z.object({
  version: z.literal(1),
  status: z.literal('editorial-draft'),
  taskCount: z.number().int().positive(),
  search: z.string().min(1),
  locator: z.string().min(1),
  shards: z.array(
    z.object({
      file: z.string().min(1),
      grade: z.number().int(),
      count: z.number().int().nonnegative(),
      sha256: z.string(),
    }),
  ),
});

export type EnglishTaskType = z.infer<typeof englishTaskTypeSchema>;
export type EnglishTask = z.infer<typeof englishTaskSchema>;
export type EnglishAnswer = z.infer<typeof englishAnswerSchema>;
export type EnglishRubric = z.infer<typeof englishRubricSchema>;
export type EnglishManifest = z.infer<typeof englishManifestSchema>;

export type EnglishSearchDocument = {
  id: string;
  subject: 'english';
  grade: number;
  difficulty: number;
  topic: string;
  subtopic: string;
  skills: string[];
  tags: string[];
  aliases: string[];
  taskType: string;
  examTerms: string[];
  statementPreview: string;
  variantGroup: string;
  shard: string;
};

const normalizeEnglishAnswer = (
  value: string,
  caseSensitive: boolean,
  ignoreFinalPunctuation: boolean,
) => {
  let normalized = value.normalize('NFKC').replace(/[’‘]/g, "'").trim().replace(/\s+/g, ' ');
  if (!caseSensitive) {
    normalized = normalized.toLowerCase();
  }
  if (ignoreFinalPunctuation) {
    normalized = normalized.replace(/[.!?]+$/g, '');
  }
  return normalized;
};

export const checkEnglishAnswer = (
  task: EnglishTask,
  input: string,
): 'correct' | 'incorrect' | 'manual' => {
  if (task.rubric || task.taskType === 'writing') {
    return 'manual';
  }

  const key = task.answer;
  if (!key) {
    throw new Error('Task has no answer');
  }

  if (key.kind === 'choice') {
    return input === key.correctOptionId ? 'correct' : 'incorrect';
  }

  const value = normalizeEnglishAnswer(input, key.caseSensitive, key.ignoreFinalPunctuation);
  return key.accepted.some(
    (accepted) =>
      normalizeEnglishAnswer(accepted, key.caseSensitive, key.ignoreFinalPunctuation) === value,
  )
    ? 'correct'
    : 'incorrect';
};

export const formatEnglishAnswer = (task: EnglishTask) => {
  if (task.answer?.kind === 'text') {
    return task.answer.accepted.join(' / ');
  }

  if (task.answer?.kind === 'choice') {
    const answer = task.answer;
    return (
      task.options?.find((option) => option.id === answer.correctOptionId)?.text ??
      answer.correctOptionId
    );
  }

  return '';
};
