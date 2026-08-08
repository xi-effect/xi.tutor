import { evaluateEquation } from './evaluateEquation';
import { CoordinateRange, getPlotArea, mathToPixel } from './coordinateMapping';

const SAMPLES_PER_PIXEL = 3;
const MAX_SAMPLES = 512;
const DOMAIN_SEARCH_ITERATIONS = 28;

export type PlotPathResult = { ok: true; path: string } | { ok: false; error: string };

function formatPathCoord(n: number): string {
  return n.toFixed(2);
}

function isPlotPointValid(y: number, yMin: number, yMax: number): boolean {
  return Number.isFinite(y) && y >= yMin && y <= yMax;
}

function collectSampleXValues(xMin: number, xMax: number, sampleCount: number): number[] {
  const xs = new Set<number>([xMin, xMax]);

  if (xMin <= 0 && xMax >= 0) {
    xs.add(0);
  }

  const step = (xMax - xMin) / sampleCount;
  for (let i = 0; i <= sampleCount; i += 1) {
    xs.add(xMin + step * i);
  }

  return Array.from(xs).sort((a, b) => a - b);
}

/** Ищет левую границу области определения между невалидной и валидной точкой. */
function findDomainBoundaryX(
  evaluate: (x: number) => number,
  invalidX: number,
  validX: number,
  yMin: number,
  yMax: number,
): number {
  let lo = Math.min(invalidX, validX);
  let hi = Math.max(invalidX, validX);

  for (let i = 0; i < DOMAIN_SEARCH_ITERATIONS; i += 1) {
    const mid = (lo + hi) / 2;
    const y = evaluate(mid);
    if (isPlotPointValid(y, yMin, yMax)) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return hi;
}

export function buildPlotPath(
  equation: string,
  range: CoordinateRange,
  w: number,
  h: number,
): PlotPathResult {
  const trimmed = equation.trim();
  if (!trimmed) {
    return { ok: true, path: '' };
  }

  const parsed = evaluateEquation(trimmed);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const plot = getPlotArea(w, h);
  const sampleCount = Math.min(
    MAX_SAMPLES,
    Math.max(64, Math.ceil(plot.width * SAMPLES_PER_PIXEL)),
  );
  const { xMin, xMax, yMin, yMax } = range;
  const xValues = collectSampleXValues(xMin, xMax, sampleCount);
  const evaluate = parsed.evaluate;

  let path = '';
  let isDrawing = false;
  let lastInvalidX: number | null = null;

  const appendPoint = (x: number, y: number) => {
    const { px, py } = mathToPixel(x, y, range, plot);
    const sx = formatPathCoord(px);
    const sy = formatPathCoord(py);

    if (!isDrawing) {
      path += `M ${sx} ${sy}`;
      isDrawing = true;
    } else {
      path += ` L ${sx} ${sy}`;
    }
  };

  for (const x of xValues) {
    const y = evaluate(x);

    if (!isPlotPointValid(y, yMin, yMax)) {
      isDrawing = false;
      lastInvalidX = x;
      continue;
    }

    if (!isDrawing && lastInvalidX !== null && lastInvalidX < x) {
      const boundaryX = findDomainBoundaryX(evaluate, lastInvalidX, x, yMin, yMax);
      const boundaryY = evaluate(boundaryX);
      if (isPlotPointValid(boundaryY, yMin, yMax) && boundaryX < x - 1e-12) {
        appendPoint(boundaryX, boundaryY);
      }
    }

    appendPoint(x, y);
    lastInvalidX = null;
  }

  return { ok: true, path };
}
