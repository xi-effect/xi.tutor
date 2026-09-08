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
  readonly mentionedAngles: GeometryAngle[] = [];

  point(label: string, options?: { visible?: boolean }) {
    const name = normalizePointName(label);
    if (!this.entities.some((entity) => entity.type === 'point' && entity.id === name)) {
      this.entities.push({
        type: 'point',
        id: name,
        label: options?.visible === false ? '' : name,
      });
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

  circle(center: string, options?: { implicit?: boolean }) {
    const normalized = normalizePointName(center);
    this.point(normalized, { visible: !options?.implicit });
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

  mentionAngle(points: GeometryAngle) {
    const normalized = points.map(normalizePointName) as GeometryAngle;
    normalized.forEach((point) => this.point(point));
    this.segment([normalized[0], normalized[1]]);
    this.segment([normalized[1], normalized[2]]);
    if (
      !this.mentionedAngles.some(
        (current) => JSON.stringify(current) === JSON.stringify(normalized),
      )
    ) {
      this.mentionedAngles.push(normalized);
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

function circleCenter(
  builder: GeometryModelBuilder,
  circleId: string,
): string | undefined {
  const circle = builder.entities.find(
    (entity): entity is Extract<GeometryEntity, { type: 'circle' }> =>
      entity.type === 'circle' && entity.id === circleId,
  );
  return circle?.center;
}

function inferTangentContact(
  line: GeometrySegment,
  circleId: string,
  builder: GeometryModelBuilder,
): string {
  const [first, second] = line;
  const center = circleCenter(builder, circleId);
  if (first === center) return second;
  if (second === center) return first;

  const arcHit = [first, second].find((point) =>
    builder.constraints.some(
      (constraint) =>
        constraint.type === 'arc_measure' &&
        (constraint.from === point || constraint.to === point),
    ),
  );
  if (arcHit) return arcHit;

  const angles = [
    ...builder.mentionedAngles,
    ...builder.constraints
      .filter(
        (constraint): constraint is Extract<GeometryConstraint, { type: 'angle' }> =>
          constraint.type === 'angle',
      )
      .map((constraint) => constraint.points),
  ];
  for (const [left, vertex, right] of angles) {
    if (!center || (left !== center && right !== center)) continue;
    if (!line.includes(vertex)) continue;
    const contact = line.find((point) => point !== vertex);
    if (contact) return contact;
  }
  return first;
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
    new RegExp(
      `${VERTEX_ANGLE}[^0-9\\n]{0,80}?(?:равен|=)\\s*(\\d+(?:\\.\\d+)?)\\s*${DEGREE_SUFFIX}`,
      'gi',
    ),
  )) {
    addAngleAtVertex(builder, triangle, normalizePointName(match[1]), Number(match[2]));
  }

  for (const match of text.matchAll(
    new RegExp(`${VERTEX_ANGLE}\\s*(?:равен\\s*90|прямой)(?![а-яё])`, 'gi'),
  )) {
    addAngleAtVertex(builder, triangle, normalizePointName(match[1]), 90);
  }
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
        `(?:[Тт]реугольник(?:[еа]|ом|у)?|△)${GAP}(${POINT})${GAP}(${POINT})${GAP}(${POINT})`,
        'g',
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

  if (isCircumcirclePhrase(text)) {
    const polygon = builder.entities.find(
      (entity): entity is Extract<GeometryEntity, { type: 'quadrilateral' | 'triangle' }> =>
        entity.type === 'quadrilateral' || entity.type === 'triangle',
    );
    const vertices = polygon?.vertices ?? [];
    if (vertices.length >= 3) {
      circleId ??= builder.circle(unusedPointName(builder, ['O']), { implicit: true });
      vertices.forEach((point) => {
        builder.constraint({ type: 'point_on_circle', point, circle: circleId! });
      });
      builder.constraint({ type: 'cyclic', points: [...vertices], circle: circleId });
    }
  }

  for (const match of text.matchAll(
    new RegExp(
      `(?:∠|[Уу]гол(?:[аеуы]|ом)?\\s*)(${POINT})(${POINT})(${POINT})\\s*(?:=|равен)\\s*(\\d+(?:\\.\\d+)?)\\s*°?`,
      'g',
    ),
  )) {
    const points = [match[1], match[2], match[3]].map(normalizePointName) as GeometryAngle;
    builder.mentionAngle(points);
    builder.constraint({ type: 'angle', points, value: Number(match[4]) });
  }

  for (const match of text.matchAll(
    new RegExp(`(?:∠|[Уу]гол(?:[аеуы]|ом)?\\s*)(${POINT})(${POINT})(${POINT})`, 'g'),
  )) {
    builder.mentionAngle(
      [match[1], match[2], match[3]].map(normalizePointName) as GeometryAngle,
    );
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
    new RegExp(
      `(?:сторон[аыи]\\s+)?(${SEGMENT})\\s*-?\\s*(?:является\\s+)?каса(?:ется|тельн[а-я]*)`,
      'gi',
    ),
  )) {
    const line = segmentPoints(match[1]);
    builder.segment(line);
    circleId ??= builder.circle('O');
    builder.constraint({
      type: 'tangent',
      circle: circleId,
      line,
      at: inferTangentContact(line, circleId, builder),
    });
  }
  for (const match of text.matchAll(
    new RegExp(
      `(?:отрезок\\s+)?(${SEGMENT})\\s+пересекает\\s+окружност[ьи]\\s+в\\s+точке\\s+(${POINT})`,
      'gi',
    ),
  )) {
    const segment = segmentPoints(match[1]);
    const point = normalizePointName(match[2]);
    builder.segment(segment);
    builder.point(point);
    circleId ??= builder.circle('O');
    builder.constraint({ type: 'point_on_circle', point, circle: circleId });
    builder.constraint({ type: 'point_on_segment', point, segment });
    const circle = builder.entities.find(
      (entity): entity is Extract<GeometryEntity, { type: 'circle' }> =>
        entity.type === 'circle' && entity.id === circleId,
    );
    if (circle && segment.includes(circle.center)) {
      const outer = segment.find((candidate) => candidate !== circle.center)!;
      builder.segment([outer, point]);
      builder.segment([point, circle.center]);
      builder.constraint({ type: 'collinear', points: [outer, point, circle.center] });
    }
  }
  for (const match of text.matchAll(
    new RegExp(
      `дуг[аиеу]\\s*(${SEGMENT})(?:\\s+окружности)?[^.]*?(?:=|равн[а-я]*)\\s*(\\d+(?:\\.\\d+)?)\\s*${DEGREE_SUFFIX}`,
      'gi',
    ),
  )) {
    const [from, to] = segmentPoints(match[1]);
    builder.point(from);
    builder.point(to);
    circleId ??= builder.circle('O');
    builder.constraint({
      type: 'arc_measure',
      circle: circleId,
      from,
      to,
      value: Number(match[2]),
    });
  }

  for (const constraint of builder.constraints) {
    if (constraint.type !== 'tangent' || !circleId) continue;
    constraint.at = inferTangentContact(constraint.line, circleId, builder);
  }

  if (!primaryTriangle) {
    const pointIds = builder.entities
      .filter((entity) => entity.type === 'point')
      .map((entity) => entity.id);
    if (pointIds.length === 3) {
      primaryTriangle = builder.triangle([pointIds[0], pointIds[1], pointIds[2]]);
    } else if (/треугольник/i.test(text)) {
      primaryTriangle = builder.triangle(['A', 'B', 'C']);
    }
  }

  inferCevianFromVertex(text, builder, primaryTriangle);
  addVertexAngles(text, builder, primaryTriangle);
  inferRectangularTriangle(text, builder, primaryTriangle);
  inferIsoscelesTriangle(text, builder, primaryTriangle);
  inferRightTriangleLegs(text, builder, primaryTriangle);

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

function isCircumcirclePhrase(text: string): boolean {
  if (/окружност[ьи]\s+вписан/i.test(text)) return false;
  if (/описан[аоы]+\s+около\s+окружност/i.test(text)) return false;
  return (
    /вписан[аоы]?\s+в\s+окружност/i.test(text) ||
    /окружност[ьи]\s+описан[аоы]+\s+около/i.test(text) ||
    /вписанн[аоыйе]+\s+четыр/i.test(text)
  );
}

function unusedPointName(builder: GeometryModelBuilder, preferred: readonly string[]): string {
  const used = new Set(
    builder.entities.filter((entity) => entity.type === 'point').map((entity) => entity.id),
  );
  for (const name of preferred) {
    if (!used.has(name)) return name;
  }
  for (let code = 72; code <= 90; code += 1) {
    const name = String.fromCharCode(code);
    if (!used.has(name)) return name;
  }
  return `${preferred[0] ?? 'P'}1`;
}

function occupiedAcuteVertices(
  text: string,
  builder: GeometryModelBuilder,
): Set<string> {
  const occupied = new Set<string>();
  for (const constraint of builder.constraints) {
    if (constraint.type === 'angle' && Math.abs(constraint.value - 90) > 1e-6) {
      occupied.add(constraint.points[1]);
    }
  }
  for (const match of text.matchAll(new RegExp(`остр[а-яё]*\\s+${VERTEX_ANGLE}`, 'gi'))) {
    occupied.add(normalizePointName(match[1]));
  }
  return occupied;
}

function inferRightAngleVertex(
  text: string,
  triangle: TriangleEntity,
  occupied: Set<string>,
): string {
  const named =
    text.match(new RegExp(`прям(?:ой|ого|ым)\\s+угл[а-яё]*\\s*(${POINT})`, 'i')) ??
    text.match(new RegExp(`вершин[аеыу]\\s+прям(?:ого|ой)\\s+угл[а-яё]*\\s*(${POINT})`, 'i')) ??
    text.match(new RegExp(`угол\\s*(${POINT})\\s*прям(?:ой|ым|ого)(?![а-яё])`, 'i')) ??
    text.match(new RegExp(`прям(?:ой|ым)\\s+углом\\s*(?:в\\s+)?(${POINT})`, 'i'));
  const namedVertex = named ? normalizePointName(named[1]) : null;
  if (
    namedVertex &&
    triangle.vertices.includes(namedVertex) &&
    !occupied.has(namedVertex)
  ) {
    return namedVertex;
  }

  const hypotenuse = text.match(new RegExp(`гипотенуз[а-я]*\\s+(${SEGMENT})`, 'i'));
  if (hypotenuse) {
    const [first, second] = segmentPoints(hypotenuse[1]);
    const remaining = triangle.vertices.find(
      (point) => point !== first && point !== second && !occupied.has(point),
    );
    if (remaining) return remaining;
  }
  const preferred = triangle.vertices[2];
  if (!occupied.has(preferred)) return preferred;
  return triangle.vertices.find((point) => !occupied.has(point)) ?? preferred;
}

function inferRectangularTriangle(
  text: string,
  builder: GeometryModelBuilder,
  triangle: TriangleEntity | undefined,
) {
  if (!triangle || !/прямоугольн|прям(?:ой|ого|ым)\s+угл/i.test(text)) return;
  if (
    builder.constraints.some(
      (constraint) => constraint.type === 'angle' && Math.abs(constraint.value - 90) < 1e-6,
    )
  ) {
    return;
  }
  addAngleAtVertex(
    builder,
    triangle,
    inferRightAngleVertex(text, triangle, occupiedAcuteVertices(text, builder)),
    90,
  );
}

function inferIsoscelesTriangle(
  text: string,
  builder: GeometryModelBuilder,
  triangle: TriangleEntity | undefined,
) {
  if (!triangle || !/равнобедренн/i.test(text)) return;
  const hasEqualSides = builder.constraints.some(
    (constraint) =>
      constraint.type === 'equal_length' &&
      constraint.segments.filter((segment) =>
        segment.every((point) => triangle.vertices.includes(point)),
      ).length >= 2,
  );
  if (hasEqualSides) return;
  const baseMatch = text.match(new RegExp(`основани[ея]\\s+(${SEGMENT})`, 'i'));
  let apex = triangle.vertices[0];
  if (baseMatch) {
    const base = segmentPoints(baseMatch[1]);
    apex = triangle.vertices.find((point) => !base.includes(point)) ?? apex;
  }
  const [first, second] = triangle.vertices.filter((point) => point !== apex);
  builder.constraint({
    type: 'equal_length',
    segments: [
      [apex, first],
      [apex, second],
    ],
  });
}

function inferRightTriangleLegs(
  text: string,
  builder: GeometryModelBuilder,
  triangle: TriangleEntity | undefined,
) {
  if (!triangle) return;
  const namedLegs = [
    ...text.matchAll(
      new RegExp(
        `катет[аы]?\\s+(${SEGMENT})\\s+и\\s+(${SEGMENT})(?:\\s*(?:=|равн[а-я]*)\\s*(${VALUE})\\s+и\\s+(${VALUE}))?`,
        'gi',
      ),
    ),
  ];
  for (const match of namedLegs) {
    const first = segmentPoints(match[1]);
    const second = segmentPoints(match[2]);
    builder.segment(first);
    builder.segment(second);
    if (match[3] && match[4]) {
      builder.constraint({ type: 'length', segment: first, value: parseScalar(match[3]) });
      builder.constraint({ type: 'length', segment: second, value: parseScalar(match[4]) });
    }
  }

  const unnamedLegs = text.match(
    new RegExp(`катет[аами]*\\s+(?:равны\\s+)?(${VALUE})\\s+и\\s+(${VALUE})`, 'i'),
  );
  if (unnamedLegs && namedLegs.length === 0) {
    const right = builder.constraints.find(
      (constraint) => constraint.type === 'angle' && Math.abs(constraint.value - 90) < 1e-6,
    );
    const vertex =
      right?.type === 'angle' ? right.points[1] : inferRightAngleVertex(text, triangle);
    const legs = triangle.vertices.filter((point) => point !== vertex);
    builder.constraint({
      type: 'length',
      segment: [vertex, legs[0]],
      value: parseScalar(unnamedLegs[1]),
    });
    builder.constraint({
      type: 'length',
      segment: [vertex, legs[1]],
      value: parseScalar(unnamedLegs[2]),
    });
  }

  const hypotenuse = text.match(
    new RegExp(`гипотенуз[а-я]*\\s+(?:(${SEGMENT})\\s*(?:=|равн[а-я]*)\\s*)?(${VALUE})`, 'i'),
  );
  if (hypotenuse?.[2]) {
    const segment = hypotenuse[1]
      ? segmentPoints(hypotenuse[1])
      : (triangle.vertices.filter((point) => {
          const right = builder.constraints.find(
            (constraint) => constraint.type === 'angle' && Math.abs(constraint.value - 90) < 1e-6,
          );
          return right?.type === 'angle' ? point !== right.points[1] : true;
        }) as GeometrySegment);
    if (segment.length === 2) {
      builder.constraint({ type: 'length', segment, value: parseScalar(hypotenuse[2]) });
    }
  }
}

function inferCevianFromVertex(
  text: string,
  builder: GeometryModelBuilder,
  triangle: TriangleEntity | undefined,
) {
  if (!triangle) return;
  const kinds = [
    ['высот', 'altitude', ['H', 'K', 'P']],
    ['медиан', 'median', ['M', 'N', 'P']],
    ['биссектрис', 'bisector', ['D', 'L', 'E']],
  ] as const;
  for (const [word, kind, preferred] of kinds) {
    const patterns = [
      new RegExp(`${word}[а-я]*\\s+из\\s+(?:вершины\\s+)?(${POINT})(?![A-ZА-Я])`, 'gi'),
      new RegExp(`из\\s+(?:вершины\\s+)?(${POINT})\\s+проведен[аоы]\\s+${word}`, 'gi'),
    ];
    for (const pattern of patterns) {
      for (const match of text.matchAll(pattern)) {
        const vertex = normalizePointName(match[1]);
        if (!triangle.vertices.includes(vertex)) continue;
        const already = builder.constraints.some(
          (constraint) => constraint.type === kind && constraint.segment[0] === vertex,
        );
        if (already) continue;
        const foot = unusedPointName(builder, preferred);
        addNamedCevian(builder, triangle, [vertex, foot], kind);
      }
    }
  }
}

function scoreGeometryModel(model: GeometrySemanticModel): number {
  const figures = model.entities.filter(
    (entity) =>
      entity.type === 'triangle' || entity.type === 'circle' || entity.type === 'quadrilateral',
  ).length;
  const metrics = model.constraints.filter((constraint) =>
    [
      'length',
      'angle',
      'equal_length',
      'diameter',
      'radius',
      'altitude',
      'median',
      'bisector',
      'perpendicular',
      'parallel',
      'tangent',
      'arc_measure',
      'chord',
      'cyclic',
    ].includes(constraint.type),
  ).length;
  if (figures === 0 && metrics === 0) return 0;
  return Math.min(0.98, (figures ? 0.72 : 0.68) + metrics * 0.04);
}

export const geometryInterpreter: MathInterpreterModule = {
  id: 'geometry',
  canInterpret(input) {
    const model = interpretGeometryText(input.text);
    return model ? scoreGeometryModel(model) : 0;
  },
  interpret(input) {
    const model = interpretGeometryText(input.text);
    if (!model) return [];
    return [
      {
        id: 'geometry',
        label: 'Построить чертёж',
        confidence: Math.max(0.7, scoreGeometryModel(model)),
        intent: { type: 'geometry', model },
      },
    ];
  },
};
