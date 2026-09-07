import type { GeometryScalar } from '../semantic/types';
import type { ScenePoint } from '../scene/types';

export const GEOMETRY_EPSILON = 1e-6;
export const ANGLE_EPSILON = 1e-4;

class NumericExpressionParser {
  private index = 0;

  constructor(private readonly source: string) {}

  parse(): number | null {
    const value = this.expression();
    this.skipSpaces();
    return this.index === this.source.length && Number.isFinite(value) ? value : null;
  }

  private expression(): number {
    let value = this.term();
    while (true) {
      this.skipSpaces();
      if (this.take('+')) value += this.term();
      else if (this.take('-')) value -= this.term();
      else return value;
    }
  }

  private term(): number {
    let value = this.power();
    while (true) {
      this.skipSpaces();
      if (this.take('*')) value *= this.power();
      else if (this.take('/')) value /= this.power();
      else return value;
    }
  }

  private power(): number {
    let value = this.unary();
    this.skipSpaces();
    if (this.take('^')) value **= this.power();
    return value;
  }

  private unary(): number {
    this.skipSpaces();
    if (this.take('+')) return this.unary();
    if (this.take('-')) return -this.unary();
    if (this.source.slice(this.index, this.index + 4).toLowerCase() === 'sqrt') {
      this.index += 4;
      this.skipSpaces();
      if (!this.take('(')) return Number.NaN;
      const value = this.expression();
      this.skipSpaces();
      if (!this.take(')') || value < 0) return Number.NaN;
      return Math.sqrt(value);
    }
    if (this.take('(')) {
      const value = this.expression();
      this.skipSpaces();
      return this.take(')') ? value : Number.NaN;
    }
    return this.number();
  }

  private number(): number {
    this.skipSpaces();
    const match = this.source.slice(this.index).match(/^\d+(?:[.,]\d+)?/);
    if (!match) return Number.NaN;
    this.index += match[0].length;
    return Number(match[0].replace(',', '.'));
  }

  private take(token: string): boolean {
    if (this.source[this.index] !== token) return false;
    this.index += 1;
    return true;
  }

  private skipSpaces() {
    while (/\s/.test(this.source[this.index] ?? '')) this.index += 1;
  }
}

export function evaluateGeometryScalar(value: GeometryScalar): number | null {
  const evaluated =
    value.type === 'number' ? value.value : new NumericExpressionParser(value.expression).parse();
  return evaluated != null && Number.isFinite(evaluated) && evaluated > 0 ? evaluated : null;
}

export function distance(a: ScenePoint, b: ScenePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function angle(a: ScenePoint, vertex: ScenePoint, c: ScenePoint): number {
  const first = { x: a.x - vertex.x, y: a.y - vertex.y };
  const second = { x: c.x - vertex.x, y: c.y - vertex.y };
  const denominator = Math.hypot(first.x, first.y) * Math.hypot(second.x, second.y);
  if (denominator < GEOMETRY_EPSILON) return Number.NaN;
  const cosine = Math.max(-1, Math.min(1, (first.x * second.x + first.y * second.y) / denominator));
  return (Math.acos(cosine) * 180) / Math.PI;
}

export function areCollinear(a: ScenePoint, b: ScenePoint, c: ScenePoint): boolean {
  const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const scale = Math.max(1, distance(a, b), distance(a, c));
  return Math.abs(cross) <= GEOMETRY_EPSILON * scale * scale;
}

export function arePerpendicular(
  a: ScenePoint,
  b: ScenePoint,
  c: ScenePoint,
  d: ScenePoint,
): boolean {
  const dot = (b.x - a.x) * (d.x - c.x) + (b.y - a.y) * (d.y - c.y);
  const scale = Math.max(1, distance(a, b) * distance(c, d));
  return Math.abs(dot) <= GEOMETRY_EPSILON * scale;
}

export function areParallel(a: ScenePoint, b: ScenePoint, c: ScenePoint, d: ScenePoint): boolean {
  const cross = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
  const scale = Math.max(1, distance(a, b) * distance(c, d));
  return Math.abs(cross) <= GEOMETRY_EPSILON * scale;
}

export function isMidpoint(point: ScenePoint, a: ScenePoint, b: ScenePoint): boolean {
  return (
    areCollinear(a, point, b) &&
    Math.abs(distance(point, a) * 2 - distance(a, b)) <= GEOMETRY_EPSILON &&
    Math.abs(distance(point, a) - distance(point, b)) <= GEOMETRY_EPSILON
  );
}

export function isPointOnCircle(point: ScenePoint, center: ScenePoint, radius: number): boolean {
  return Math.abs(distance(point, center) - radius) <= GEOMETRY_EPSILON;
}
