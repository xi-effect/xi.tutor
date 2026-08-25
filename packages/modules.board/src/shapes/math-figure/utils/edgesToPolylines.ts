import type { MathFigureEdge, MathFigurePoint } from './buildMathFigureGeometry';

const COORD_EPS = 0.05;

function samePoint(a: MathFigurePoint, b: MathFigurePoint): boolean {
  return Math.abs(a.x - b.x) < COORD_EPS && Math.abs(a.y - b.y) < COORD_EPS;
}

function pointKey(p: MathFigurePoint): string {
  return `${Math.round(p.x * 100) / 100},${Math.round(p.y * 100) / 100}`;
}

/** Склеивает отрезки в ломаные, чтобы SVG мог скруглить стыки (linejoin). */
export function edgesToPolylines(edges: MathFigureEdge[]): MathFigurePoint[][] {
  const remaining = [...edges];
  const polylines: MathFigurePoint[][] = [];

  while (remaining.length > 0) {
    const first = remaining.pop();
    if (!first) break;

    const points: MathFigurePoint[] = [first.from, first.to];
    let extended = true;

    while (extended) {
      extended = false;
      for (let i = remaining.length - 1; i >= 0; i -= 1) {
        const edge = remaining[i];
        const head = points[0];
        const tail = points[points.length - 1];

        if (samePoint(edge.from, tail)) {
          points.push(edge.to);
        } else if (samePoint(edge.to, tail)) {
          points.push(edge.from);
        } else if (samePoint(edge.to, head)) {
          points.unshift(edge.from);
        } else if (samePoint(edge.from, head)) {
          points.unshift(edge.to);
        } else {
          continue;
        }

        remaining.splice(i, 1);
        extended = true;
        break;
      }
    }

    polylines.push(points);
  }

  return polylines;
}

export function polylinePath(points: MathFigurePoint[]): string {
  if (points.length < 2) return '';

  const closed = points.length > 2 && samePoint(points[0], points[points.length - 1]);
  const body = closed ? points.slice(0, -1) : points;
  const d = body
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return closed ? `${d} Z` : d;
}

export function uniqueEdgePoints(edges: MathFigureEdge[]): MathFigurePoint[] {
  const points = new Map<string, MathFigurePoint>();

  for (const edge of edges) {
    points.set(pointKey(edge.from), edge.from);
    points.set(pointKey(edge.to), edge.to);
  }

  return [...points.values()];
}

export function uniquePoints(points: MathFigurePoint[]): MathFigurePoint[] {
  const map = new Map<string, MathFigurePoint>();
  for (const point of points) {
    map.set(pointKey(point), point);
  }
  return [...map.values()];
}
