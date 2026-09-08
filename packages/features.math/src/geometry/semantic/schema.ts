import { z } from 'zod';

const pointId = z.string().min(1);
const segment = z.tuple([pointId, pointId]);
const angle = z.tuple([pointId, pointId, pointId]);
const scalar = z.discriminatedUnion('type', [
  z.object({ type: z.literal('number'), value: z.number().finite().positive() }),
  z.object({ type: z.literal('expression'), expression: z.string().min(1) }),
]);

export const geometryEntitySchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('point'), id: pointId, label: z.string() }),
  z.object({ type: z.literal('segment'), id: pointId, from: pointId, to: pointId }),
  z.object({ type: z.literal('line'), id: pointId, through: segment }),
  z.object({ type: z.literal('ray'), id: pointId, from: pointId, through: pointId }),
  z.object({ type: z.literal('triangle'), id: pointId, vertices: angle }),
  z.object({
    type: z.literal('quadrilateral'),
    id: pointId,
    vertices: z.tuple([pointId, pointId, pointId, pointId]),
    kind: z
      .enum(['generic', 'rectangle', 'square', 'parallelogram', 'rhombus', 'trapezoid'])
      .optional(),
  }),
  z.object({
    type: z.literal('circle'),
    id: pointId,
    center: pointId,
    points: z.array(pointId).optional(),
  }),
]);

export const geometryConstraintSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('length'), segment, value: scalar }),
  z.object({ type: z.literal('angle'), points: angle, value: z.number().finite() }),
  z.object({ type: z.literal('perpendicular'), first: segment, second: segment }),
  z.object({ type: z.literal('parallel'), first: segment, second: segment }),
  z.object({ type: z.literal('equal_length'), segments: z.array(segment).min(2) }),
  z.object({ type: z.literal('equal_angle'), angles: z.array(angle).min(2) }),
  z.object({ type: z.literal('collinear'), points: z.array(pointId).min(3) }),
  z.object({ type: z.literal('midpoint'), point: pointId, segment }),
  z.object({ type: z.literal('radius'), circle: pointId, segment, value: scalar.optional() }),
  z.object({ type: z.literal('diameter'), circle: pointId, segment }),
  z.object({ type: z.literal('point_on_circle'), point: pointId, circle: pointId }),
  z.object({ type: z.literal('point_on_segment'), point: pointId, segment }),
  z.object({ type: z.literal('bisector'), segment, angle }),
  z.object({ type: z.literal('median'), segment, oppositeSide: segment }),
  z.object({ type: z.literal('altitude'), segment, oppositeSide: segment }),
  z.object({ type: z.literal('chord'), circle: pointId, segment }),
  z.object({ type: z.literal('tangent'), circle: pointId, line: segment, at: pointId.optional() }),
  z.object({
    type: z.literal('arc_measure'),
    circle: pointId,
    from: pointId,
    to: pointId,
    value: z.number().finite(),
  }),
  z.object({ type: z.literal('cyclic'), points: z.array(pointId).min(3), circle: pointId }),
  z.object({ type: z.literal('similar_triangles'), triangles: z.tuple([pointId, pointId]) }),
]);

export const geometrySemanticModelSchema = z.object({
  entities: z.array(geometryEntitySchema).min(1),
  constraints: z.array(geometryConstraintSchema),
  decorations: z
    .array(
      z.discriminatedUnion('type', [
        z.object({ type: z.literal('show_measurement'), segment }),
        z.object({ type: z.literal('show_angle'), angle }),
      ]),
    )
    .optional(),
});
