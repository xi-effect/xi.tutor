import { getColorValue, type Editor } from '@ibodr/draw';
import type { CoordinateAxesShape } from './CoordinateAxesShape';
import { buildCoordinateAxesGeometry } from './utils/buildCoordinateAxesGeometry';
import type { CoordinateAxesGeometry } from './utils/buildCoordinateAxesGeometry';
import { COORDINATE_AXES_VISUAL } from './utils/visualStyles';

function AxisArrowHead({
  x,
  y,
  direction,
  color,
}: {
  x: number;
  y: number;
  direction: 'right' | 'up';
  color: string;
}) {
  const size = COORDINATE_AXES_VISUAL.arrowSize;
  const points =
    direction === 'right'
      ? `${x},${y} ${x - size},${y - size / 2} ${x - size},${y + size / 2}`
      : `${x},${y} ${x - size / 2},${y + size} ${x + size / 2},${y + size}`;

  return <polygon points={points} fill={color} stroke="none" />;
}

type AxesSvgContentProps = {
  geometry: CoordinateAxesGeometry;
  equation: string;
  showLabels: boolean;
  axisColor: string;
  plotStrokeColor: string;
  gridColor: string;
  errorColor: string;
  labelColor: string;
};

/** Чистый SVG-контент осей — и для канваса, и для toSvg-экспорта. */
export function CoordinateAxesSvgContent({
  geometry,
  equation,
  showLabels,
  axisColor,
  plotStrokeColor,
  gridColor,
  errorColor,
  labelColor,
}: AxesSvgContentProps) {
  const { axisStrokeWidth, plotStrokeWidth, gridStrokeWidth, gridOpacity } = COORDINATE_AXES_VISUAL;
  const { plot } = geometry;

  return (
    <g>
      <g opacity={gridOpacity}>
        {geometry.xGridLines.map(({ tick, pos }) => (
          <line
            key={`grid-x-${tick}`}
            x1={pos}
            y1={plot.y}
            x2={pos}
            y2={plot.y + plot.height}
            stroke={gridColor}
            strokeWidth={gridStrokeWidth}
          />
        ))}
        {geometry.yGridLines.map(({ tick, pos }) => (
          <line
            key={`grid-y-${tick}`}
            x1={plot.x}
            y1={pos}
            x2={plot.x + plot.width}
            y2={pos}
            stroke={gridColor}
            strokeWidth={gridStrokeWidth}
          />
        ))}
      </g>

      <line
        x1={plot.x}
        y1={geometry.xAxisLineY}
        x2={geometry.xAxisEnd}
        y2={geometry.xAxisLineY}
        stroke={axisColor}
        strokeWidth={axisStrokeWidth}
        strokeLinecap="butt"
      />
      <AxisArrowHead
        x={geometry.xArrow.x}
        y={geometry.xArrow.y}
        direction="right"
        color={axisColor}
      />

      <line
        x1={geometry.yAxisLineX}
        y1={plot.y + plot.height}
        x2={geometry.yAxisLineX}
        y2={geometry.yAxisEnd}
        stroke={axisColor}
        strokeWidth={axisStrokeWidth}
        strokeLinecap="butt"
      />
      <AxisArrowHead x={geometry.yArrow.x} y={geometry.yArrow.y} direction="up" color={axisColor} />

      {geometry.plotPath && (
        <path
          d={geometry.plotPath}
          fill="none"
          stroke={plotStrokeColor}
          strokeWidth={plotStrokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {geometry.plotError && equation.trim() && (
        <text
          x={plot.x + plot.width / 2}
          y={plot.y + plot.height / 2}
          textAnchor="middle"
          fill={errorColor}
          fontSize={12}
          fontFamily="sans-serif"
        >
          {geometry.plotError}
        </text>
      )}

      {showLabels && (
        <g fontFamily="sans-serif" fill={labelColor}>
          {geometry.xLabels.map((label) => (
            <text
              key={`label-x-${label.text}-${label.x}`}
              x={label.x}
              y={label.y + 11}
              textAnchor="middle"
              fontSize={11}
            >
              {label.text}
            </text>
          ))}
          {geometry.yLabels.map((label) => (
            <text
              key={`label-y-${label.text}-${label.y}`}
              x={label.x}
              y={label.y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={11}
            >
              {label.text}
            </text>
          ))}
          {geometry.originLabel && (
            <text x={geometry.originLabel.x} y={geometry.originLabel.y + 11} fontSize={11}>
              0
            </text>
          )}
          <text x={geometry.xName.x} y={geometry.xName.y + 12} fontSize={12} fill={axisColor}>
            x
          </text>
          <text x={geometry.yName.x} y={geometry.yName.y + 12} fontSize={12} fill={axisColor}>
            y
          </text>
        </g>
      )}
    </g>
  );
}

export function buildCoordinateAxesSvgProps(shape: CoordinateAxesShape, editor: Editor) {
  const theme = editor.getCurrentTheme();
  const colorMode = editor.getColorMode();
  const colors = theme.colors[colorMode];
  const {
    w,
    h,
    xMin,
    xMax,
    yMin,
    yMax,
    xDivisions,
    yDivisions,
    showLabels,
    equation,
    color,
    plotColor,
  } = shape.props;

  const geometry = buildCoordinateAxesGeometry({
    w: Math.round(w),
    h: Math.round(h),
    xMin,
    xMax,
    yMin,
    yMax,
    xDivisions,
    yDivisions,
    showLabels,
    equation,
  });

  return {
    geometry,
    equation,
    showLabels,
    axisColor: getColorValue(colors, color, 'solid'),
    plotStrokeColor: getColorValue(colors, plotColor, 'solid'),
    gridColor: getColorValue(colors, 'grey', 'semi'),
    errorColor: getColorValue(colors, 'red', 'solid'),
    labelColor: getColorValue(colors, 'grey', 'solid'),
  };
}
