import { HTMLContainer, SVGContainer, getColorValue, useEditor, useValue } from '@ibodr/draw';
import { getFillColor, getSizeInPixels } from '../geo/geoUtils';
import { polygonDashArray } from './polygonDash';
import type { XiPolygonShape } from './XiPolygonShapeUtil';

export function PolygonShapeView({ shape }: { shape: XiPolygonShape }) {
  const editor = useEditor();
  const theme = useValue('polygon-theme', () => editor.getCurrentTheme(), [editor]);
  const colorMode = useValue('polygon-color-mode', () => editor.getColorMode(), [editor]);
  const colors = theme.colors[colorMode];
  const border = shape.props.borderColor === 'none' ? null : shape.props.borderColor;
  const strokeWidth = border ? getSizeInPixels(shape.props.size) : 0;
  const points = shape.props.vertices.map((vertex) => `${vertex.x},${vertex.y}`).join(' ');

  return (
    <HTMLContainer style={{ pointerEvents: 'all', overflow: 'visible' }}>
      <SVGContainer style={{ overflow: 'visible' }}>
        <polygon
          points={points}
          fill={getFillColor(colors, shape.props.fill, shape.props.color)}
          stroke={border ? getColorValue(colors, border, 'solid') : 'none'}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeDasharray={polygonDashArray(shape.props.dash, Math.max(strokeWidth, 1))}
        />
      </SVGContainer>
    </HTMLContainer>
  );
}
