import { z } from 'zod';

export const physicsTaskTypeSchema = z.enum(['numeric', 'multi-step']);

export const physicsExamMappingSchema = z.object({
  exam: z.enum(['oge', 'ege']),
  year: z.literal(2026),
  taskNumbers: z.array(z.number().int().positive()).min(1),
  relation: z.literal('foundation'),
  note: z.string(),
});

export const physicsFigureSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('circuit'),
    connection: z.enum(['series', 'parallel']),
    resistors: z.array(
      z.object({
        label: z.string().min(1),
        resistanceOhm: z.number().positive(),
      }),
    ),
  }),
  z.object({
    kind: z.literal('graph'),
    xLabel: z.string().min(1),
    yLabel: z.string().min(1),
    points: z.array(z.tuple([z.number(), z.number()])).min(2),
  }),
]);

export const physicsAnswerSchema = z.object({
  kind: z.literal('numeric'),
  value: z.number().finite(),
  unit: z.string().min(1),
  decimalPlaces: z.literal(3),
  absoluteTolerance: z.number().positive(),
});

export const physicsTaskSchema = z.object({
  id: z.string().regex(/^physics-ru-\d{5}$/),
  subject: z.literal('physics'),
  grade: z.number().int().min(5).max(11),
  difficulty: z.number().int().min(1).max(5),
  topic: z.string().min(1),
  subtopic: z.string().min(1),
  skills: z.array(z.string()).min(1),
  tags: z.array(z.string()),
  aliases: z.array(z.string()),
  taskType: physicsTaskTypeSchema,
  track: z.enum(['introductory', 'school', 'advanced']),
  familyId: z.string().min(1),
  variantGroup: z.string().min(1),
  fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  statement: z.string().min(1),
  instruction: z.string(),
  givens: z.record(z.string(), z.number().finite()),
  answer: physicsAnswerSchema,
  hints: z.array(z.string()).min(1),
  solution: z.array(z.string()).min(1),
  figure: physicsFigureSchema.optional(),
  examMappings: z.array(physicsExamMappingSchema),
  provenance: z.object({
    kind: z.literal('original-synthetic'),
    method: z.literal('physical-model-parameterization'),
    sourceTaskCopied: z.literal(false),
    referenceIds: z.array(z.string()),
  }),
  reviewStatus: z.literal('automated-validated-editorial-pending'),
});

export const physicsTaskArraySchema = z.array(physicsTaskSchema);

export const physicsManifestSchema = z.object({
  version: z.literal(1),
  subject: z.literal('physics'),
  status: z.string().min(1),
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

export type PhysicsTaskType = z.infer<typeof physicsTaskTypeSchema>;
export type PhysicsFigure = z.infer<typeof physicsFigureSchema>;
export type PhysicsAnswer = z.infer<typeof physicsAnswerSchema>;
export type PhysicsTask = z.infer<typeof physicsTaskSchema>;
export type PhysicsManifest = z.infer<typeof physicsManifestSchema>;

export type PhysicsSearchDocument = {
  id: string;
  subject: 'physics';
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

const PHYSICS_ANSWER_INPUT = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

export const checkPhysicsAnswer = (
  task: PhysicsTask,
  input: string,
): 'correct' | 'incorrect' | 'invalid' => {
  const trimmed = input.trim().replace('−', '-').replace(',', '.');
  if (!PHYSICS_ANSWER_INPUT.test(trimmed)) {
    return 'invalid';
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return 'invalid';
  }

  return Math.abs(value - task.answer.value) <= task.answer.absoluteTolerance + 1e-10
    ? 'correct'
    : 'incorrect';
};

export const formatPhysicsAnswer = (answer: PhysicsAnswer) => {
  const value = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: answer.decimalPlaces,
  }).format(answer.value);
  return `${value} ${answer.unit}`;
};
