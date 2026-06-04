export const PLOT_MARGIN = {
  top: 12,
  right: 16,
  bottom: 28,
  left: 36,
} as const;

export type CoordinateRange = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export type PlotArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getPlotArea(w: number, h: number): PlotArea {
  return {
    x: PLOT_MARGIN.left,
    y: PLOT_MARGIN.top,
    width: Math.max(1, w - PLOT_MARGIN.left - PLOT_MARGIN.right),
    height: Math.max(1, h - PLOT_MARGIN.top - PLOT_MARGIN.bottom),
  };
}

export function mathToPixel(
  x: number,
  y: number,
  range: CoordinateRange,
  plot: PlotArea,
): { px: number; py: number } {
  const { xMin, xMax, yMin, yMax } = range;
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;

  return {
    px: plot.x + ((x - xMin) / xSpan) * plot.width,
    py: plot.y + plot.height - ((y - yMin) / ySpan) * plot.height,
  };
}

export function getTickValues(min: number, max: number, divisions: number): number[] {
  const count = Math.max(1, Math.round(divisions));
  const step = (max - min) / count;
  const ticks: number[] = [];

  for (let i = 0; i <= count; i += 1) {
    ticks.push(min + step * i);
  }

  return ticks;
}

export function formatTickValue(value: number): string {
  if (Math.abs(value) < 1e-10) return '0';
  if (Number.isInteger(value)) return String(value);
  return Number(value.toFixed(2)).toString();
}
