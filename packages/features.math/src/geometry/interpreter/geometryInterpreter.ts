import type { MathInterpreterModule } from '../../core/types';
import type {
  GeometryAngle,
  GeometryConstraint,
  GeometryEntity,
  GeometryScalar,
  GeometrySegment,
  GeometrySemanticModel,
  TriangleEntity,
} from '../semantic/types';
import { normalizeGeometryText, normalizePointName, segmentPoints } from './normalization';

const POINT = '[A-ZА-Я]';
const GAP = `[^A-ZА-Я\\n]{0,8}`;
const SEGMENT = `${POINT}{2}`;
const VALUE = '(?:sqrt\\(\\d+(?:\\.\\d+)?\\.?\\)|\\d+(?:\\.\\d+)?)';

class GeometryModelBuilder {
  readonly entities: GeometryEntity[] = [];
  readonly constraints: GeometryConstraint[] = [];

  point(label: string) {
    const name = normalizePointName(label);
    if (!this.entities.some((entity) => entity.type === 'point' && entity.id === name)) {
      this.entities.push({ type: 'point', id: name, label: name });
    }
  }

  segment(segment: GeometrySegment) {
    const [from, to] = segment.map(normalizePointName) as GeometrySegment;
    this.point(from);
    this.point(to);
    const id = `segment-${[from, to].sort().join('')}`;
    if (!this.entities.some((entity) => entity.type === 'segment' && entity.id === id)) {
      this.entities.push({ type: 'segment', id, from, to });
    }
  }

  triangle(vertices: [string, string, string]): TriangleEntity {
    const normalized = vertices.map(normalizePointName) as [string, string, string];
    const id = `triangle-${normalized.join('')}`;
    let triangle = this.entities.find(
      (entity): entity is TriangleEntity => entity.type === 'triangle' && entity.id === id,
    );
    if (!triangle) {
      triangle = { type: 'triangle', id, vertices: normalized };
      this.entities.push(triangle);
      normalized.forEach((point) => this.point(point));
      this.segment([normalized[0], normalized[1]]);
      this.segment([normalized[1], normalized[2]]);
      this.segment([normalized[2], normalized[0]]);
    }
    return triangle;
  }

  circle(center: string) {
    const normalized = normalizePointName(center);
    this.point(normalized);
    const id = `circle-${normalized}`;
    if (!this.entities.some((entity) => entity.type === 'circle' && entity.id === id)) {
      this.entities.push({ type: 'circle', id, center: normalized });
    }
    return id;
  }

  constraint(constraint: GeometryConstraint) {
    if (
      !this.constraints.some((current) => JSON.stringify(current) === JSON.stringify(constraint))
    ) {
      this.constraints.push(constraint);
    }
  }

  build(): GeometrySemanticModel {
    return { entities: this.entities, constraints: this.constraints };
  }
}

function parseScalar(source: string): GeometryScalar {
  const normalized = source.replace(/sqrt\((\d+(?:\.\d+)?)\.\)/g, 'sqrt($1)').replace(/\.$/, '');
  const value = Number(normalized);
  return Number.isFinite(value)
    ? { type: 'number', value }
    : { type: 'expression', expression: normalized };
}

function triangleAngleAt(triangle: TriangleEntity, vertex: string): GeometryAngle | null {
  const index = triangle.vertices.indexOf(vertex);
  if (index < 0) return null;
  const others = triangle.vertices.filter((point) => point !== vertex);
  return [others[0], vertex, others[1]];
}

function oppositeSide(triangle: TriangleEntity, vertex: string): GeometrySegment | null {
  const others = triangle.vertices.filter((point) => point !== vertex);
  return others.length === 2 ? [others[0], others[1]] : null;
}

const VERTEX_ANGLE = `угол\\s*(${POINT})(?![A-ZА-Я])`;
const DEGREE_SUFFIX = '(?:°|˚|º|градус(?:а|ов)?)?';

function addAngleAtVertex(
  builder: GeometryModelBuilder,
  triangle: TriangleEntity | undefined,
  vertex: string,
  value: number,
) {
  const points = triangle && triangleAngleAt(triangle, vertex);
  if (points && Number.isFinite(value)) {
    builder.constraint({ type: 'angle', points, value });
  }
}

function addVertexAngles(
  text: string,
  builder: GeometryModelBuilder,
  triangle: TriangleEntity | undefined,
) {
  if (!triangle) return;

  for (const match of text.matchAll(
    new RegExp(`${VERTEX_ANGLE}\\s*(?:равен\\s*)?(\\d+(?:\\.\\d+)?)\\s*${DEGREE_SUFFIX}`, 'gi'),
  )) {
    addAngleAtVertex(builder, triangle, normalizePointName(match[1]), Number(match[2]));
  }

  for (const match of text.matchAll(
    new RegExp(`${VERTEX_ANGLE}\\s*(?:равен\\s*90|прямой)`, 'gi'),
  )) {
    addAngleAtVertex(builder, triangle, normalizePointName(match[1]), 90);
  }

  if (
    builder.constraints.some(
      (constraint) => constraint.type === 'angle' && Math.abs(constraint.value - 90) < 1e-6,
    )
  ) {
    return;
  }

  if (!/(?:^|[^0-9])90(?:°|˚|º)?(?:$|[^0-9.])|прямо(?:й|го)|прямоугольн/.test(text)) {
    return;
  }

  const vertex = text.match(new RegExp(VERTEX_ANGLE, 'i'));
  if (vertex) addAngleAtVertex(builder, triangle, normalizePointName(vertex[1]), 90);
}

function addNamedCevian(
  builder: GeometryModelBuilder,
  triangle: TriangleEntity | undefined,
  segment: GeometrySegment,
  kind: 'altitude' | 'median' | 'bisector',
) {
  builder.segment(segment);
  if (!triangle) return;
  const side = oppositeSide(triangle, segment[0]);
  const angle = triangleAngleAt(triangle, segment[0]);
  if (kind === 'altitude' && side) {
    builder.constraint({ type: 'altitude', segment, oppositeSide: side });
  } else if (kind === 'median' && side) {
    builder.constraint({ type: 'median', segment, oppositeSide: side });
  } else if (kind === 'bisector' && angle) {
    builder.constraint({ type: 'bisector', segment, angle });
  }
}

export function interpretGeometryText(input: string): GeometrySemanticModel | null {
  const text = normalizeGeometryText(input);
  const builder = new GeometryModelBuilder();

  const triangleMatches = [
    ...text.matchAll(
      new RegExp(
        `(?:треугольник(?:е|а|ом|у)?|△)${GAP}(${POINT})${GAP}(${POINT})${GAP}(${POINT})`,
        'gi',
      ),
    ),
  ];
  const triangles = triangleMatches.map((match) =>
    builder.triangle([match[1], match[2], match[3]]),
  );
  let primaryTriangle = triangles[0];
  for (const match of text.matchAll(new RegExp(`прям(?:ая|ой|ую)\\s+(${SEGMENT})`, 'gi'))) {
    const through = segmentPoints(match[1]);
    through.forEach((point) => builder.point(point));
    builder.entities.push({ type: 'line', id: `line-${through.join('')}`, through });
  }
  for (const match of text.matchAll(new RegExp(`луч\\s+(${SEGMENT})`, 'gi'))) {
    const [from, through] = segmentPoints(match[1]);
    builder.point(from);
    builder.point(through);
    builder.entities.push({ type: 'ray', id: `ray-${from}${through}`, from, through });
  }
  for (const match of text.matchAll(
    new RegExp(
      `треугольники${GAP}(${POINT})${GAP}(${POINT})${GAP}(${POINT})\\s+и${GAP}(${POINT})${GAP}(${POINT})${GAP}(${POINT})\\s+подобн[а-я]*`,
      'gi',
    ),
  )) {
    const first = builder.triangle([match[1], match[2], match[3]]);
    const second = builder.triangle([match[4], match[5], match[6]]);
    builder.constraint({ type: 'similar_triangles', triangles: [first.id, second.id] });
  }

  for (const match of text.matchAll(
    new RegExp(
      `(?:четыр[её]хугольник(?:е|а|ом|у)?|квадрат|прямоугольник|ромб|параллелограмм|трапеци[яи])${GAP}(${POINT})${GAP}(${POINT})${GAP}(${POINT})${GAP}(${POINT})`,
      'gi',
    ),
  )) {
    const vertices = [match[1], match[2], match[3], match[4]].map(normalizePointName) as [
      string,
      string,
      string,
      string,
    ];
    const word = match[0].toLowerCase();
    const kind = word.includes('квадрат')
      ? 'square'
      : word.includes('прямоугольник')
        ? 'rectangle'
        : word.includes('ромб')
          ? 'rhombus'
          : word.includes('параллелограмм')
            ? 'parallelogram'
            : word.includes('трапец')
              ? 'trapezoid'
              : 'generic';
    builder.entities.push({
      type: 'quadrilateral',
      id: `quadrilateral-${vertices.join('')}`,
      vertices,
      kind,
    });
    vertices.forEach((point, index) => builder.segment([point, vertices[(index + 1) % 4]]));
    const [a, b, c, d] = vertices;
    if (kind === 'rectangle' || kind === 'square') {
      builder.constraint({ type: 'perpendicular', first: [a, b], second: [b, c] });
      builder.constraint({ type: 'perpendicular', first: [b, c], second: [c, d] });
    }
    if (
      kind === 'rectangle' ||
      kind === 'square' ||
      kind === 'parallelogram' ||
      kind === 'rhombus'
    ) {
      builder.constraint({ type: 'parallel', first: [a, b], second: [c, d] });
      builder.constraint({ type: 'parallel', first: [b, c], second: [d, a] });
    }
    if (kind === 'trapezoid') {
      builder.constraint({ type: 'parallel', first: [a, b], second: [c, d] });
    }
    if (kind === 'square' || kind === 'rhombus') {
      builder.constraint({
        type: 'equal_length',
        segments: [
          [a, b],
          [b, c],
          [c, d],
          [d, a],
        ],
      });
    }
    if (kind === 'rectangle' || kind === 'parallelogram') {
      builder.constraint({
        type: 'equal_length',
        segments: [
          [a, b],
          [c, d],
        ],
      });
      builder.constraint({
        type: 'equal_length',
        segments: [
          [b, c],
          [d, a],
        ],
      });
    }
  }

  let circleId: string | null = null;
  const centerPatterns = [
    new RegExp(`окружност[ьи][^.]*?центр(?:ом)?\\s+(${POINT})`, 'i'),
    new RegExp(`окружност[ьи]\\s+с\\s+центром\\s+(${POINT})`, 'i'),
    new RegExp(`(${POINT})\\s*-?\\s*центр\\s+окружности`, 'i'),
  ];
  for (const pattern of centerPatterns) {
    const match = text.match(pattern);
    if (match) {
      circleId = builder.circle(match[1]);
      break;
    }
  }

  for (const match of text.matchAll(
    new RegExp(
      `(?:∠|угол\\s*)(${POINT})(${POINT})(${POINT})\\s*(?:=|равен)\\s*(\\d+(?:\\.\\d+)?)\\s*°?`,
      'gi',
    ),
  )) {
    const points = [match[1], match[2], match[3]].map(normalizePointName) as GeometryAngle;
    points.forEach((point) => builder.point(point));
    builder.segment([points[0], points[1]]);
    builder.segment([points[1], points[2]]);
    builder.constraint({ type: 'angle', points, value: Number(match[4]) });
  }

  for (const match of text.matchAll(
    new RegExp(
      `(?:∠|угол\\s*)(${POINT})(${POINT})(${POINT})\\s*=\\s*(?:∠|угол\\s*)(${POINT})(${POINT})(${POINT})`,
      'gi',
    ),
  )) {
    const first = [match[1], match[2], match[3]].map(normalizePointName) as GeometryAngle;
    const second = [match[4], match[5], match[6]].map(normalizePointName) as GeometryAngle;
    [...first, ...second].forEach((point) => builder.point(point));
    builder.segment([first[0], first[1]]);
    builder.segment([first[1], first[2]]);
    builder.segment([second[0], second[1]]);
    builder.segment([second[1], second[2]]);
    builder.constraint({ type: 'equal_angle', angles: [first, second] });
  }

  for (const match of text.matchAll(new RegExp(`(${SEGMENT})\\s*=\\s*(${VALUE})`, 'gi'))) {
    const segment = segmentPoints(match[1]);
    builder.segment(segment);
    builder.constraint({ type: 'length', segment, value: parseScalar(match[2]) });
  }

  for (const match of text.matchAll(new RegExp(`(${SEGMENT})\\s*=\\s*(${SEGMENT})`, 'gi'))) {
    const first = segmentPoints(match[1]);
    const second = segmentPoints(match[2]);
    builder.segment(first);
    builder.segment(second);
    builder.constraint({ type: 'equal_length', segments: [first, second] });
  }

  for (const match of text.matchAll(
    new RegExp(`(?:сторон[аыи]\\s+)?(${SEGMENT})\\s+и\\s+(${SEGMENT})\\s+равн[а-я]*`, 'gi'),
  )) {
    const first = segmentPoints(match[1]);
    const second = segmentPoints(match[2]);
    builder.segment(first);
    builder.segment(second);
    builder.constraint({ type: 'equal_length', segments: [first, second] });
  }

  for (const match of text.matchAll(
    new RegExp(`(${SEGMENT})\\s*(?:[⊥⟂]|перпендикуляр(?:ен|на|ны)?)\\s*(${SEGMENT})`, 'gi'),
  )) {
    const first = segmentPoints(match[1]);
    const second = segmentPoints(match[2]);
    builder.segment(first);
    builder.segment(second);
    builder.constraint({ type: 'perpendicular', first, second });
  }

  for (const match of text.matchAll(
    new RegExp(`(${SEGMENT})\\s*(?:∥|\\|\\||параллел(?:ен|ьна|ьны)?)\\s*(${SEGMENT})`, 'gi'),
  )) {
    const first = segmentPoints(match[1]);
    const second = segmentPoints(match[2]);
    builder.segment(first);
    builder.segment(second);
    builder.constraint({ type: 'parallel', first, second });
  }

  for (const match of text.matchAll(
    new RegExp(`(${POINT})\\s*-?\\s*середин[аы]\\s+(?:отрезка\\s+)?(${SEGMENT})`, 'gi'),
  )) {
    const point = normalizePointName(match[1]);
    const segment = segmentPoints(match[2]);
    builder.point(point);
    builder.segment(segment);
    builder.constraint({ type: 'midpoint', point, segment });
  }

  const cevianKinds = [
    ['высот', 'altitude'],
    ['медиан', 'median'],
    ['биссектрис', 'bisector'],
  ] as const;
  for (const [word, kind] of cevianKinds) {
    const patterns = [
      new RegExp(`(${SEGMENT})\\s*-?\\s*(?:является\\s+)?${word}[а-я]*`, 'gi'),
      new RegExp(`(?:проведена\\s+)?${word}[а-я]*\\s+(${SEGMENT})`, 'gi'),
    ];
    for (const pattern of patterns) {
      for (const match of text.matchAll(pattern)) {
        addNamedCevian(builder, primaryTriangle, segmentPoints(match[1]), kind);
      }
    }
  }

  if (primaryTriangle && /равносторонн/.test(text)) {
    const [a, b, c] = primaryTriangle.vertices;
    builder.constraint({
      type: 'equal_length',
      segments: [
        [a, b],
        [b, c],
        [c, a],
      ],
    });
  }

  const diameterPrefix = text.match(
    new RegExp(`(?:отрезки\\s+)?(${SEGMENT}(?:\\s+и\\s+${SEGMENT})+)\\s*-?\\s*диаметр[а-я]*`, 'i'),
  );
  const diameterSegments = diameterPrefix?.[1].match(new RegExp(SEGMENT, 'gi')) ?? [];
  for (const name of diameterSegments) {
    const segment = segmentPoints(name);
    builder.segment(segment);
    circleId ??= builder.circle('O');
    builder.constraint({ type: 'diameter', circle: circleId, segment });
  }
  for (const match of text.matchAll(
    new RegExp(`(${SEGMENT})\\s*-?\\s*(?:является\\s+)?диаметр(?:ом)?`, 'gi'),
  )) {
    const segment = segmentPoints(match[1]);
    builder.segment(segment);
    circleId ??= builder.circle('O');
    builder.constraint({ type: 'diameter', circle: circleId, segment });
  }

  for (const match of text.matchAll(
    new RegExp(`(${SEGMENT})\\s*-?\\s*(?:является\\s+)?радиус(?:ом)?`, 'gi'),
  )) {
    const segment = segmentPoints(match[1]);
    builder.segment(segment);
    circleId ??= builder.circle(segment[0]);
    builder.constraint({ type: 'radius', circle: circleId, segment });
  }
  for (const match of text.matchAll(
    new RegExp(`(${SEGMENT})\\s*-?\\s*(?:является\\s+)?хорд(?:ой|а)`, 'gi'),
  )) {
    const segment = segmentPoints(match[1]);
    builder.segment(segment);
    circleId ??= builder.circle('O');
    builder.constraint({ type: 'chord', circle: circleId, segment });
  }
  for (const match of text.matchAll(
    new RegExp(`(${SEGMENT})\\s*-?\\s*(?:является\\s+)?касательн[а-я]*`, 'gi'),
  )) {
    const line = segmentPoints(match[1]);
    builder.segment(line);
    circleId ??= builder.circle('O');
    builder.constraint({ type: 'tangent', circle: circleId, line, at: line[0] });
  }

  if (!primaryTriangle) {
    const pointIds = builder.entities
      .filter((entity) => entity.type === 'point')
      .map((entity) => entity.id);
    if (pointIds.length === 3) {
      primaryTriangle = builder.triangle([pointIds[0], pointIds[1], pointIds[2]]);
    }
  }
  addVertexAngles(text, builder, primaryTriangle);

  if (primaryTriangle) {
    const exteriorPatterns = [
      new RegExp(`угол\\s*(${POINT})(${POINT})(${POINT})\\s*внешн`, 'gi'),
      new RegExp(`внешн[а-яё]*\\s+угол\\s*(${POINT})(${POINT})(${POINT})`, 'gi'),
    ];
    for (const pattern of exteriorPatterns) {
      for (const match of text.matchAll(pattern)) {
        const first = normalizePointName(match[1]);
        const vertex = normalizePointName(match[2]);
        const exterior = normalizePointName(match[3]);
        const third = primaryTriangle.vertices.find((point) => point !== first && point !== vertex);
        if (!third) continue;
        builder.point(exterior);
        builder.segment([vertex, first]);
        builder.segment([vertex, exterior]);
        builder.constraint({ type: 'collinear', points: [third, vertex, exterior] });
      }
    }
  }

  if (builder.entities.length === 0) return null;
  return builder.build();
}

export const geometryInterpreter: MathInterpreterModule = {
  id: 'geometry',
  canInterpret(input) {
    const text = normalizeGeometryText(input.text).toLowerCase();
    const hits = [
      'треугольник',
      'окружност',
      'угол',
      'высот',
      'медиан',
      'биссектрис',
      'перпендикуляр',
      'параллел',
      'радиус',
      'диаметр',
      'хорд',
      'касательн',
    ].filter((token) => text.includes(token)).length;
    const symbolHit = /[△∠⊥⟂∥]/.test(text) ? 1 : 0;
    return hits + symbolHit ? Math.min(0.98, 0.65 + (hits + symbolHit) * 0.08) : 0;
  },
  interpret(input) {
    const model = interpretGeometryText(input.text);
    if (!model) return [];
    return [
      {
        id: 'geometry',
        label: 'Построить чертёж',
        confidence: Math.max(0.7, this.canInterpret(input)),
        intent: { type: 'geometry', model },
      },
    ];
  },
};
