type Point = { x: number; y: number };

export type WavyCommand = {
  type: 'move' | 'line' | 'cubic';
  x: number;
  y: number;
  isClose: boolean;
  cp1?: Point;
  cp2?: Point;
};

const MIN_WAVY_LENGTH_RATIO = 0.75;
const MAX_SAMPLES = 1600;

function distance(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function formatCoord(value: number) {
  return (Math.round(value * 100) / 100).toString();
}

function cubicPoint(p0: Point, c1: Point, c2: Point, p1: Point, t: number): Point {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * c1.x + c * c2.x + d * p1.x,
    y: a * p0.y + b * c1.y + c * c2.y + d * p1.y,
  };
}

function splitSubpaths(commands: readonly WavyCommand[]) {
  const subpaths: WavyCommand[][] = [];
  let current: WavyCommand[] = [];
  for (const command of commands) {
    if (command.type === 'move' && current.length > 0) {
      subpaths.push(current);
      current = [];
    }
    current.push(command);
  }
  if (current.length > 0) subpaths.push(current);
  return subpaths;
}

function flattenSubpath(commands: readonly WavyCommand[], step: number) {
  const points: Point[] = [];
  let cursor: Point | null = null;
  let closed = false;

  for (const command of commands) {
    if (command.type === 'move') {
      cursor = { x: command.x, y: command.y };
      points.push(cursor);
      continue;
    }
    if (!cursor) continue;

    const end = { x: command.x, y: command.y };
    if (command.type === 'line') {
      const length = distance(cursor, end);
      const count = Math.max(1, Math.ceil(length / step));
      for (let index = 1; index <= count; index += 1) {
        const t = index / count;
        points.push({
          x: cursor.x + (end.x - cursor.x) * t,
          y: cursor.y + (end.y - cursor.y) * t,
        });
      }
    } else {
      const c1 = command.cp1 ?? cursor;
      const c2 = command.cp2 ?? end;
      const approx = distance(cursor, c1) + distance(c1, c2) + distance(c2, end);
      const count = Math.max(2, Math.ceil(approx / step));
      for (let index = 1; index <= count; index += 1) {
        points.push(cubicPoint(cursor, c1, c2, end, index / count));
      }
    }

    if (command.isClose) closed = true;
    cursor = end;
  }

  return { points, closed };
}

function polylineLength(points: readonly Point[]) {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    length += distance(points[index - 1], points[index]);
  }
  return length;
}

function pointOnPolyline(points: readonly Point[], distanceAlong: number) {
  let remaining = Math.max(0, distanceAlong);
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    const segment = distance(start, end);
    if (segment < 1e-6) continue;
    if (remaining <= segment || index === points.length - 1) {
      const t = Math.min(1, remaining / segment);
      return {
        point: {
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
        },
        tangent: { x: end.x - start.x, y: end.y - start.y },
      };
    }
    remaining -= segment;
  }

  const end = points[points.length - 1];
  const start = points[Math.max(0, points.length - 2)];
  return {
    point: end,
    tangent: { x: end.x - start.x, y: end.y - start.y },
  };
}

function offsetAlongNormal(point: Point, tangent: Point, amount: number): Point {
  const length = Math.hypot(tangent.x, tangent.y);
  if (length < 1e-6 || amount === 0) return point;
  return {
    x: point.x + (-tangent.y / length) * amount,
    y: point.y + (tangent.x / length) * amount,
  };
}

function pathFromPoints(points: readonly Point[], closed: boolean) {
  const [first, ...rest] = points;
  if (!first) return '';
  const parts = [`M ${formatCoord(first.x)} ${formatCoord(first.y)}`];
  for (const point of rest) {
    parts.push(`L ${formatCoord(point.x)} ${formatCoord(point.y)}`);
  }
  if (closed) parts.push('Z');
  return parts.join(' ');
}

function wavySubpath(commands: readonly WavyCommand[], strokeWidth: number) {
  const sw = Math.max(strokeWidth, 0.5);
  const targetWavelength = Math.max(sw * 14, 18);
  const preview = flattenSubpath(commands, Math.max(2, targetWavelength / 8));
  const length = polylineLength(preview.points);
  if (!(length >= targetWavelength * MIN_WAVY_LENGTH_RATIO) || preview.points.length < 2) {
    return null;
  }

  const waves = Math.max(1, Math.round(length / targetWavelength));
  const wavelength = length / waves;
  const amplitude = Math.min(sw * 2.4, wavelength * 0.22);
  const step = Math.max(1.25, wavelength / 18, length / MAX_SAMPLES);
  const geometry = flattenSubpath(commands, step);
  const preciseLength = polylineLength(geometry.points);
  const samples = Math.max(8, Math.round(preciseLength / step));
  const closed = geometry.closed;
  const count = closed ? samples : samples + 1;
  const points: Point[] = [];

  for (let index = 0; index < count; index += 1) {
    const distanceAlong = (index / samples) * preciseLength;
    const { point, tangent } = pointOnPolyline(geometry.points, distanceAlong);
    const phase = (Math.PI * 2 * distanceAlong) / (preciseLength / waves);
    const amount = amplitude * Math.sin(phase);
    points.push(offsetAlongNormal(point, tangent, amount));
  }

  const start = geometry.points[0];
  const end = geometry.points[geometry.points.length - 1];
  points[0] = start;
  if (!closed) points[points.length - 1] = end;

  return pathFromPoints(points, closed);
}

/** Синус вдоль пути. Для слишком короткого штриха возвращает null — его рисуют сплошным. */
export function buildWavyPathD(commands: readonly WavyCommand[], strokeWidth: number) {
  const parts = splitSubpaths(commands)
    .map((subpath) => wavySubpath(subpath, strokeWidth))
    .filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(' ') : null;
}
