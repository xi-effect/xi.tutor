import { memo, useMemo } from 'react';
import { HTMLContainer, SVGContainer, getColorValue, useEditor, useValue } from '@ibodr/draw';
import type { CoordinateAxesShape } from './CoordinateAxesShape';
import { buildCoordinateAxesGeometry } from './utils/buildCoordinateAxesGeometry';
import type { CoordinateAxesGeometry } from './utils/buildCoordinateAxesGeometry';
import { COORDINATE_AXES_VISUAL } from './utils/visualStyles';

type CoordinateAxesComponentProps = {
  shape: CoordinateAxesShape;
};

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

function AxisLabels({
  geometry,
  showLabels,
  labelColor,
  axisColor,
}: {
  geometry: CoordinateAxesGeometry;
  showLabels: boolean;
  labelColor: string;
  axisColor: string;
}) {
  if (!showLabels) return null;

  const labelStyle = {
    position: 'absolute' as const,
    pointerEvents: 'none' as const,
    fontFamily: 'sans-serif',
    lineHeight: 1,
    whiteSpace: 'nowrap' as const,
  };

  return (
    <div className="pointer-events-none absolute inset-0">
      {geometry.xLabels.map((label) => (
        <span
          key={`label-x-${label.text}-${label.x}`}
          style={{
            ...labelStyle,
            left: label.x,
            top: label.y,
            transform: 'translate(-50%, 0)',
            fontSize: 11,
            color: labelColor,
          }}
        >
          {label.text}
        </span>
      ))}
      {geometry.yLabels.map((label) => (
        <span
          key={`label-y-${label.text}-${label.y}`}
          style={{
            ...labelStyle,
            left: label.x,
            top: label.y,
            transform: 'translate(-100%, -50%)',
            fontSize: 11,
            color: labelColor,
          }}
        >
          {label.text}
        </span>
      ))}
      {geometry.originLabel && (
        <span
          style={{
            ...labelStyle,
            left: geometry.originLabel.x,
            top: geometry.originLabel.y,
            fontSize: 11,
            color: labelColor,
          }}
        >
          0
        </span>
      )}
      <span
        style={{
          ...labelStyle,
          left: geometry.xName.x,
          top: geometry.xName.y,
          fontSize: 12,
          color: axisColor,
        }}
      >
        x
      </span>
      <span
        style={{
          ...labelStyle,
          left: geometry.yName.x,
          top: geometry.yName.y,
          fontSize: 12,
          color: axisColor,
        }}
      >
        y
      </span>
    </div>
  );
}

const CoordinateAxesSvg = memo(function CoordinateAxesSvg({
  geometry,
  equation,
  axisColor,
  plotStrokeColor,
  gridColor,
  errorColor,
}: {
  geometry: CoordinateAxesGeometry;
  equation: string;
  axisColor: string;
  plotStrokeColor: string;
  gridColor: string;
  errorColor: string;
}) {
  const { axisStrokeWidth, plotStrokeWidth, gridStrokeWidth, gridOpacity } = COORDINATE_AXES_VISUAL;
  const { plot } = geometry;

  return (
    <SVGContainer>
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
    </SVGContainer>
  );
});

export const CoordinateAxesComponent = ({ shape }: CoordinateAxesComponentProps) => {
  const editor = useEditor();
  const theme = useValue('theme', () => editor.getCurrentTheme(), [editor]);
  const colorMode = useValue('colorMode', () => editor.getColorMode(), [editor]);
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

  const rw = Math.round(w);
  const rh = Math.round(h);

  const geometry = useMemo(
    () =>
      buildCoordinateAxesGeometry({
        w: rw,
        h: rh,
        xMin,
        xMax,
        yMin,
        yMax,
        xDivisions,
        yDivisions,
        showLabels,
        equation,
      }),
    [rw, rh, xMin, xMax, yMin, yMax, xDivisions, yDivisions, showLabels, equation],
  );

  const axisColor = getColorValue(colors, color, 'solid');
  const labelColor = getColorValue(colors, 'grey', 'solid');

  return (
    <HTMLContainer
      style={{
        width: w,
        height: h,
        pointerEvents: 'none',
        position: 'relative',
      }}
    >
      <CoordinateAxesSvg
        geometry={geometry}
        equation={equation}
        axisColor={axisColor}
        plotStrokeColor={getColorValue(colors, plotColor, 'solid')}
        gridColor={getColorValue(colors, 'grey', 'semi')}
        errorColor={getColorValue(colors, 'red', 'solid')}
      />
      <AxisLabels
        geometry={geometry}
        showLabels={showLabels}
        labelColor={labelColor}
        axisColor={axisColor}
      />
    </HTMLContainer>
  );
};
