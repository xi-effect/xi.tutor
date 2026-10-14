const MIN_LENGTH_IN_STROKES = 8;

function formatLength(value: number) {
  return (Math.round(value * 100) / 100).toString();
}

/**
 * Паттерн «точка-тире», который начинается и заканчивается на середине тире.
 * Длина пути равна целому числу циклов, поэтому концы линии не обрываются в промежутке.
 */
export function dashDotStroke(length: number, strokeWidth: number) {
  const sw = Math.max(strokeWidth, 0.5);
  if (!(length > sw * MIN_LENGTH_IN_STROKES)) {
    return { strokeDasharray: 'none', strokeDashoffset: '0' };
  }

  const baseDash = sw * 4.2;
  const baseGap = sw * 2.5;
  const baseDot = Math.max(sw * 0.08, 0.2);
  const cycle = baseDash + baseGap + baseDot + baseGap;
  const count = Math.max(1, Math.round(length / cycle));
  const scale = length / (count * cycle);
  const dash = baseDash * scale;
  const gap = baseGap * scale;
  const dot = baseDot * scale;

  return {
    strokeDasharray: [dash, gap, dot, gap].map(formatLength).join(' '),
    strokeDashoffset: formatLength(dash / 2),
  };
}
