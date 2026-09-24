import { evaluateEquation } from '../../shapes/coordinate-axes/utils/evaluateEquation';

export function inferFunctionGraphRange(
  expressions: string[],
  intentRange?: { xRange?: [number, number]; yRange?: [number, number] },
): { xMin: number; xMax: number; yMin: number; yMax: number } {
  const isTrig = expressions.some((expression) => /\b(sin|cos|tan)\b/i.test(expression));
  const xMin = intentRange?.xRange?.[0] ?? (isTrig ? -6.5 : -5);
  const xMax = intentRange?.xRange?.[1] ?? (isTrig ? 6.5 : 5);
  if (intentRange?.yRange) {
    return { xMin, xMax, yMin: intentRange.yRange[0], yMax: intentRange.yRange[1] };
  }

  const values: number[] = [];
  for (const expression of expressions) {
    const parsed = evaluateEquation(expression);
    if (!parsed.ok) continue;
    for (let index = 0; index <= 80; index += 1) {
      const x = xMin + ((xMax - xMin) * index) / 80;
      const y = parsed.evaluate(x);
      if (Number.isFinite(y) && Math.abs(y) < 40) values.push(y);
    }
  }

  if (values.length === 0) {
    return { xMin, xMax, yMin: isTrig ? -2 : -5, yMax: isTrig ? 2 : 5 };
  }

  let yMin = Math.min(0, ...values);
  let yMax = Math.max(0, ...values);
  if (yMax - yMin < 2) {
    yMin -= 1;
    yMax += 1;
  }
  if (yMax - yMin > 16) {
    yMin = Math.max(yMin, -8);
    yMax = Math.min(yMax, 8);
  }
  const pad = (yMax - yMin) * 0.08;
  return {
    xMin,
    xMax,
    yMin: niceBound(yMin - pad, 'floor'),
    yMax: niceBound(yMax + pad, 'ceil'),
  };
}

function niceBound(value: number, mode: 'floor' | 'ceil'): number {
  if (!Number.isFinite(value) || value === 0) return 0;
  const abs = Math.abs(value);
  const mag = 10 ** Math.max(0, Math.floor(Math.log10(abs)) - 1);
  const scaled = abs / mag;
  const rounded = mode === 'ceil' ? Math.ceil(scaled) : Math.floor(scaled);
  return Math.sign(value) * rounded * mag;
}
