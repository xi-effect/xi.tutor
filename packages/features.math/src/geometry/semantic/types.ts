export type GeometryScalar =
  { type: 'number'; value: number } | { type: 'expression'; expression: string };

export type PointEntity = { type: 'point'; id: string; label: string };
export type SegmentEntity = { type: 'segment'; id: string; from: string; to: string };
export type LineEntity = { type: 'line'; id: string; through: [string, string] };
export type RayEntity = { type: 'ray'; id: string; from: string; through: string };
export type TriangleEntity = {
  type: 'triangle';
  id: string;
  vertices: [string, string, string];
};
export type QuadrilateralEntity = {
  type: 'quadrilateral';
  id: string;
  vertices: [string, string, string, string];
  kind?: 'generic' | 'rectangle' | 'square' | 'parallelogram' | 'rhombus' | 'trapezoid';
};
export type CircleEntity = {
  type: 'circle';
  id: string;
  center: string;
  points?: string[];
};

export type GeometryEntity =
  | PointEntity
  | SegmentEntity
  | LineEntity
  | RayEntity
  | TriangleEntity
  | QuadrilateralEntity
  | CircleEntity;

export type GeometryAngle = [string, string, string];
export type GeometrySegment = [string, string];

export type GeometryConstraint =
  | { type: 'length'; segment: GeometrySegment; value: GeometryScalar }
  | { type: 'angle'; points: GeometryAngle; value: number }
  | { type: 'perpendicular'; first: GeometrySegment; second: GeometrySegment }
  | { type: 'parallel'; first: GeometrySegment; second: GeometrySegment }
  | { type: 'equal_length'; segments: GeometrySegment[] }
  | { type: 'equal_angle'; angles: GeometryAngle[] }
  | { type: 'collinear'; points: string[] }
  | { type: 'midpoint'; point: string; segment: GeometrySegment }
  | { type: 'radius'; circle: string; segment: GeometrySegment; value?: GeometryScalar }
  | { type: 'diameter'; circle: string; segment: GeometrySegment }
  | { type: 'point_on_circle'; point: string; circle: string }
  | { type: 'point_on_segment'; point: string; segment: GeometrySegment }
  | { type: 'bisector'; segment: GeometrySegment; angle: GeometryAngle }
  | { type: 'median'; segment: GeometrySegment; oppositeSide: GeometrySegment }
  | { type: 'altitude'; segment: GeometrySegment; oppositeSide: GeometrySegment }
  | { type: 'chord'; circle: string; segment: GeometrySegment }
  | { type: 'tangent'; circle: string; line: GeometrySegment; at?: string }
  | { type: 'similar_triangles'; triangles: [string, string] };

export type GeometryDecoration =
  | { type: 'show_measurement'; segment: GeometrySegment }
  | { type: 'show_angle'; angle: GeometryAngle };

export type GeometrySemanticModel = {
  entities: GeometryEntity[];
  constraints: GeometryConstraint[];
  decorations?: GeometryDecoration[];
};

export type GeometryConstraintPriority = 'hard' | 'metric' | 'visual';

export function geometryConstraintPriority(
  constraint: GeometryConstraint,
): GeometryConstraintPriority {
  switch (constraint.type) {
    case 'length':
    case 'angle':
    case 'equal_length':
    case 'equal_angle':
      return 'metric';
    default:
      return 'hard';
  }
}
