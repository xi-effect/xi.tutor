import type { CoordinateAxesShapeProps } from '../CoordinateAxesShape';
import { buildPlotPath } from './buildPlotPath';
import { COORDINATE_AXES_VISUAL } from './visualStyles';
import { snapLine, snapText } from './snapCoords';
import {
  CoordinateRange,
  formatTickValue,
  getPlotArea,
  getTickValues,
  mathToPixel,
  PlotArea,
} from './coordinateMapping';

type GridLine = { tick: number; pos: number };

function buildUniqueGridLines(ticks: number[], getPos: (tick: number) => number): GridLine[] {
  const seen = new Set<number>();
  const lines: GridLine[] = [];

  for (const tick of ticks) {
    const pos = getPos(tick);
    if (seen.has(pos)) continue;
    seen.add(pos);
    lines.push({ tick, pos });
  }

  return lines;
}

export type CoordinateAxesGeometry = {
  plot: PlotArea;
  xAxisLineY: number;
  yAxisLineX: number;
  xGridLines: { tick: number; pos: number }[];
  yGridLines: { tick: number; pos: number }[];
  xLabels: { x: number; y: number; text: string }[];
  yLabels: { x: number; y: number; text: string }[];
  xAxisEnd: number;
  yAxisEnd: number;
  xArrow: { x: number; y: number };
  yArrow: { x: number; y: number };
  xName: { x: number; y: number };
  yName: { x: number; y: number };
  originLabel: { x: number; y: number } | null;
  plotPath: string;
  plotError: string | null;
};

export function buildCoordinateAxesGeometry(
  props: Pick<
    CoordinateAxesShapeProps,
    | 'w'
    | 'h'
    | 'xMin'
    | 'xMax'
    | 'yMin'
    | 'yMax'
    | 'xDivisions'
    | 'yDivisions'
    | 'showLabels'
    | 'equation'
  >,
): CoordinateAxesGeometry {
  const { w, h, xMin, xMax, yMin, yMax, xDivisions, yDivisions, showLabels, equation } = props;
  const { arrowSize } = COORDINATE_AXES_VISUAL;

  // Округляем размер для стабильной геометрии при resize (меньше дрожания подписей)
  const rw = Math.round(w);
  const rh = Math.round(h);

  const plot = getPlotArea(rw, rh);
  const range: CoordinateRange = { xMin, xMax, yMin, yMax };
  const originInRange = xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0;
  const origin = originInRange ? mathToPixel(0, 0, range, plot) : null;

  const xAxisLineY = snapText(originInRange ? origin!.py : plot.y + plot.height);
  const yAxisLineX = snapText(originInRange ? origin!.px : plot.x);

  const xTicks = getTickValues(xMin, xMax, xDivisions);
  const yTicks = getTickValues(yMin, yMax, yDivisions);

  const xGridLines = buildUniqueGridLines(xTicks, (tick) =>
    snapLine(mathToPixel(tick, 0, range, plot).px),
  );
  const yGridLines = buildUniqueGridLines(yTicks, (tick) =>
    snapLine(mathToPixel(0, tick, range, plot).py),
  );

  const xLabels: CoordinateAxesGeometry['xLabels'] = [];
  const yLabels: CoordinateAxesGeometry['yLabels'] = [];
  let originLabel: CoordinateAxesGeometry['originLabel'] = null;

  if (showLabels) {
    for (const tick of xTicks) {
      if (originInRange && Math.abs(tick) < 1e-10) continue;
      const { px } = mathToPixel(tick, 0, range, plot);
      xLabels.push({
        x: snapText(px),
        y: snapText(xAxisLineY + 16),
        text: formatTickValue(tick),
      });
    }

    for (const tick of yTicks) {
      if (originInRange && Math.abs(tick) < 1e-10) continue;
      const { py } = mathToPixel(0, tick, range, plot);
      yLabels.push({
        x: snapText(yAxisLineX - 8),
        y: snapText(py + 4),
        text: formatTickValue(tick),
      });
    }

    if (originInRange) {
      originLabel = {
        x: snapText(yAxisLineX + 8),
        y: snapText(xAxisLineY + 14),
      };
    }
  }

  const plotResult = buildPlotPath(equation, range, rw, rh);

  return {
    plot,
    xAxisLineY,
    yAxisLineX,
    xGridLines,
    yGridLines,
    xLabels,
    yLabels,
    xAxisEnd: snapText(plot.x + plot.width - arrowSize),
    yAxisEnd: snapText(plot.y + arrowSize),
    xArrow: { x: snapText(plot.x + plot.width), y: xAxisLineY },
    yArrow: { x: yAxisLineX, y: snapText(plot.y) },
    xName: { x: snapText(plot.x + plot.width + 2), y: snapText(xAxisLineY - 6) },
    yName: { x: snapText(yAxisLineX + 8), y: snapText(plot.y - 4) },
    originLabel,
    plotPath: plotResult.ok ? plotResult.path : '',
    plotError: plotResult.ok ? null : plotResult.error,
  };
}
