import * as z from 'zod';

const finiteNumber = z.number().finite();

const rangeSchema = z.tuple([finiteNumber, finiteNumber]);

export const functionGraphIntentSchema = z.object({
  type: z.literal('function_graph'),
  expression: z.string().min(1).optional(),
  expressions: z.array(z.string().min(1)).min(1),
  xRange: rangeSchema.optional(),
  yRange: rangeSchema.optional(),
});

export const coordinatePointSchema = z.object({
  name: z.string().min(1).optional(),
  x: finiteNumber,
  y: finiteNumber,
});

export const coordinatePointsIntentSchema = z.object({
  type: z.literal('coordinate_points'),
  points: z.array(coordinatePointSchema).min(1),
  connect: z.boolean().optional(),
  xRange: rangeSchema.optional(),
  yRange: rangeSchema.optional(),
});

const pointDefinitionSchema = z.object({
  type: z.literal('point'),
  name: z.string().min(1),
  x: finiteNumber.optional(),
  y: finiteNumber.optional(),
});

const segmentDefinitionSchema = z.object({
  type: z.literal('segment'),
  name: z.string().min(1).optional(),
  from: z.string().min(1),
  to: z.string().min(1),
  length: finiteNumber.optional(),
});

const angleDefinitionSchema = z.object({
  type: z.literal('angle'),
  name: z.string().min(1).optional(),
  points: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
  value: finiteNumber.optional(),
});

const circleDefinitionSchema = z.object({
  type: z.literal('circle'),
  name: z.string().min(1).optional(),
  center: z.string().min(1),
  radius: finiteNumber.optional(),
});

const polygonDefinitionSchema = z.object({
  type: z.literal('polygon'),
  name: z.string().min(1).optional(),
  vertices: z.array(z.string().min(1)).min(3),
});

const triangleDefinitionSchema = z.object({
  type: z.literal('triangle'),
  vertices: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
  kind: z.enum(['scalene', 'isosceles', 'equilateral', 'right']).optional(),
});

export const geometryObjectSchema = z.discriminatedUnion('type', [
  pointDefinitionSchema,
  segmentDefinitionSchema,
  angleDefinitionSchema,
  circleDefinitionSchema,
  polygonDefinitionSchema,
  triangleDefinitionSchema,
]);

export const geometryRelationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('equal_length'),
    segments: z.array(z.string().min(1)).min(2),
  }),
  z.object({
    type: z.literal('parallel'),
    first: z.string().min(1),
    second: z.string().min(1),
  }),
  z.object({
    type: z.literal('perpendicular'),
    first: z.string().min(1),
    second: z.string().min(1),
  }),
  z.object({
    type: z.literal('right_angle'),
    angle: z.string().min(1),
  }),
  z.object({
    type: z.literal('angle_value'),
    angle: z.string().min(1),
    value: finiteNumber,
  }),
  z.object({
    type: z.literal('midpoint'),
    segment: z.string().min(1),
    point: z.string().min(1),
  }),
  z.object({
    type: z.literal('altitude'),
    from: z.string().min(1),
    to: z.string().min(1),
    point: z.string().min(1).optional(),
  }),
  z.object({
    type: z.literal('median'),
    from: z.string().min(1),
    to: z.string().min(1),
    point: z.string().min(1).optional(),
  }),
  z.object({
    type: z.literal('bisector'),
    from: z.string().min(1),
    to: z.string().min(1),
    point: z.string().min(1).optional(),
  }),
  z.object({
    type: z.literal('radius'),
    circle: z.string().min(1),
    point: z.string().min(1).optional(),
    length: finiteNumber.optional(),
  }),
  z.object({
    type: z.literal('diameter'),
    circle: z.string().min(1),
    from: z.string().min(1).optional(),
    to: z.string().min(1).optional(),
    length: finiteNumber.optional(),
  }),
]);

export const geometryIntentSchema = z.object({
  type: z.literal('geometry'),
  objects: z.array(geometryObjectSchema).min(1),
  relations: z.array(geometryRelationSchema).optional(),
  angles: z
    .array(
      z.object({
        name: z.string().min(1),
        value: finiteNumber,
      }),
    )
    .optional(),
});

export const numberLineBoundSchema = z.object({
  value: finiteNumber,
  inclusive: z.boolean(),
});

export const numberLineIntentSchema = z.object({
  type: z.literal('number_line'),
  start: numberLineBoundSchema.optional(),
  end: numberLineBoundSchema.optional(),
  unboundedLeft: z.boolean().optional(),
  unboundedRight: z.boolean().optional(),
});

export const formulaIntentSchema = z.object({
  type: z.literal('formula'),
  text: z.string().min(1),
  latex: z.string().min(1).optional(),
});

export const diagramNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const diagramIntentSchema = z.object({
  type: z.literal('diagram'),
  nodes: z.array(diagramNodeSchema).min(2),
  edges: z.array(
    z.object({
      from: z.string().min(1),
      to: z.string().min(1),
    }),
  ),
});

export const timelineIntentSchema = z.object({
  type: z.literal('timeline'),
  events: z
    .array(
      z.object({
        year: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .min(2),
});

export const inequalitySystemIntentSchema = z.object({
  type: z.literal('inequality_system'),
  inequalities: z
    .array(
      z.object({
        expression: z.string().min(1),
        operator: z.enum(['>', '<', '>=', '<=']),
      }),
    )
    .min(2),
});

export const visualizationIntentSchema = z.discriminatedUnion('type', [
  functionGraphIntentSchema,
  coordinatePointsIntentSchema,
  geometryIntentSchema,
  numberLineIntentSchema,
  formulaIntentSchema,
  diagramIntentSchema,
  timelineIntentSchema,
  inequalitySystemIntentSchema,
]);

export type FunctionGraphIntent = z.infer<typeof functionGraphIntentSchema>;
export type CoordinatePointsIntent = z.infer<typeof coordinatePointsIntentSchema>;
export type GeometryIntent = z.infer<typeof geometryIntentSchema>;
export type NumberLineIntent = z.infer<typeof numberLineIntentSchema>;
export type FormulaIntent = z.infer<typeof formulaIntentSchema>;
export type DiagramIntent = z.infer<typeof diagramIntentSchema>;
export type TimelineIntent = z.infer<typeof timelineIntentSchema>;
export type InequalitySystemIntent = z.infer<typeof inequalitySystemIntentSchema>;
export type VisualizationIntent = z.infer<typeof visualizationIntentSchema>;

export type VisualizationIntentType = VisualizationIntent['type'];

export function getFunctionGraphExpressions(intent: FunctionGraphIntent): string[] {
  if (intent.expressions && intent.expressions.length > 0) {
    return intent.expressions;
  }
  return intent.expression ? [intent.expression] : [];
}
