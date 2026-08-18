import { arcPath, type MathFigureGeometry } from './utils/buildMathFigureGeometry';
import { edgesToPolylines, polylinePath, uniqueEdgePoints } from './utils/edgesToPolylines';
import { MATH_FIGURE_LABEL_DY, MATH_FIGURE_VISUAL } from './utils/visualStyles';
import { SvgStaticText } from '../labels/SvgStaticText';

type MathFigureSvgContentProps = {
  geometry: MathFigureGeometry;
  strokeColor: string;
  strokeWidth: number;
};

export function MathFigureSvgContent({
  geometry,
  strokeColor,
  strokeWidth,
}: MathFigureSvgContentProps) {
  const { hiddenDash, heightDash, medianDash, bisectorDash, labelFontSize, electronRadius } =
    MATH_FIGURE_VISUAL;
  const jointRadius = strokeWidth / 2;
  const vertices = uniqueEdgePoints([
    ...geometry.visibleEdges,
    ...geometry.hiddenEdges,
    ...geometry.heightEdges,
    ...geometry.medianEdges,
    ...geometry.bisectorEdges,
  ]);

  return (
    <g
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={4}
    >
      {geometry.ellipses.map((ellipse, index) => (
        <ellipse
          key={`ellipse-${index}`}
          cx={ellipse.cx}
          cy={ellipse.cy}
          rx={ellipse.rx}
          ry={ellipse.ry}
        />
      ))}

      {geometry.visibleArcs.map((arc, index) => (
        <path key={`arc-visible-${index}`} d={arcPath(arc)} />
      ))}

      {geometry.hiddenArcs.map((arc, index) => (
        <path key={`arc-hidden-${index}`} d={arcPath(arc)} strokeDasharray={hiddenDash} />
      ))}

      {edgesToPolylines(geometry.visibleEdges).map((points, index) => (
        <path key={`edge-visible-${index}`} d={polylinePath(points)} />
      ))}

      {edgesToPolylines(geometry.hiddenEdges).map((points, index) => (
        <path key={`edge-hidden-${index}`} d={polylinePath(points)} strokeDasharray={hiddenDash} />
      ))}

      {edgesToPolylines(geometry.heightEdges).map((points, index) => (
        <path key={`edge-height-${index}`} d={polylinePath(points)} strokeDasharray={heightDash} />
      ))}

      {edgesToPolylines(geometry.medianEdges).map((points, index) => (
        <path key={`edge-median-${index}`} d={polylinePath(points)} strokeDasharray={medianDash} />
      ))}

      {edgesToPolylines(geometry.bisectorEdges).map((points, index) => (
        <path
          key={`edge-bisector-${index}`}
          d={polylinePath(points)}
          strokeDasharray={bisectorDash}
        />
      ))}

      {geometry.marks.map((points, index) => (
        <path
          key={`mark-${index}`}
          d={polylinePath(points)}
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
      ))}

      {geometry.extraDots.map((point, index) => (
        <circle
          key={`dot-${index}`}
          cx={point.x}
          cy={point.y}
          r={electronRadius}
          fill={strokeColor}
          stroke="none"
        />
      ))}

      {vertices.map((point, index) => (
        <circle
          key={`vertex-${index}`}
          cx={point.x}
          cy={point.y}
          r={jointRadius}
          fill={strokeColor}
          stroke="none"
        />
      ))}

      {geometry.labels.map((label, index) => (
        <SvgStaticText
          key={`label-${label.text}-${index}`}
          x={label.x}
          y={label.y}
          text={label.text}
          fontSize={labelFontSize}
          fill={strokeColor}
          anchor={label.anchor}
          dy={MATH_FIGURE_LABEL_DY[label.baseline]}
        />
      ))}
    </g>
  );
}
