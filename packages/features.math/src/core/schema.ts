import { z } from 'zod';
import { geometrySemanticModelSchema } from '../geometry/semantic/schema';

const pointSchema = z.object({ name: z.string().optional(), x: z.number(), y: z.number() });

export const mathVisualizationIntentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('function_graph'),
    expressions: z
      .array(z.object({ label: z.string().optional(), expression: z.string().min(1) }))
      .min(1),
    xRange: z.tuple([z.number(), z.number()]).optional(),
    yRange: z.tuple([z.number(), z.number()]).optional(),
  }),
  z.object({
    type: z.literal('coordinate_points'),
    points: z.array(pointSchema).min(1),
    connect: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('number_line'),
    intervals: z
      .array(
        z.object({
          from: z.number().nullable(),
          to: z.number().nullable(),
          fromInclusive: z.boolean(),
          toInclusive: z.boolean(),
        }),
      )
      .min(1),
  }),
  z.object({ type: z.literal('formula'), source: z.string().min(1), latex: z.string().optional() }),
  z.object({
    type: z.literal('fraction_model'),
    numerator: z.number().int(),
    denominator: z.number().int().positive(),
    model: z.enum(['bar', 'circle']),
  }),
  z.object({ type: z.literal('ratio'), left: z.number(), right: z.number() }),
  z.object({
    type: z.literal('percent_bar'),
    percent: z.number(),
    whole: z.number().optional(),
    part: z.number().optional(),
  }),
  z.object({
    type: z.literal('sequence'),
    values: z.array(z.number()).min(2),
    kind: z.enum(['arithmetic', 'geometric', 'generic']).optional(),
  }),
  z.object({
    type: z.literal('probability_tree'),
    stages: z.number().int().positive(),
    outcomes: z
      .array(z.object({ label: z.string(), probability: z.number().min(0).max(1).optional() }))
      .min(2),
  }),
  z.object({
    type: z.literal('geometry'),
    model: geometrySemanticModelSchema,
  }),
  z.object({
    type: z.literal('diagram'),
    nodes: z.array(z.object({ id: z.string(), label: z.string() })).min(2),
    edges: z.array(z.object({ from: z.string(), to: z.string(), label: z.string().optional() })),
  }),
  z.object({
    type: z.literal('timeline'),
    events: z.array(z.object({ year: z.number().int(), label: z.string() })).min(2),
  }),
]);
