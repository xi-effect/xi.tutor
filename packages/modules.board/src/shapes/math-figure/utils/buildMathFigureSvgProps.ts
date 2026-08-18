import { getColorValue, type Editor } from '@ibodr/draw';
import type { MathFigureShape } from '../MathFigureShape';
import { buildMathFigureGeometry } from './buildMathFigureGeometry';
import { getMathFigureStrokeWidth } from './visualStyles';

export function buildMathFigureSvgProps(shape: MathFigureShape, editor: Editor) {
  const theme = editor.getCurrentTheme();
  const colorMode = editor.getColorMode();
  const colors = theme.colors[colorMode];
  const {
    w,
    h,
    kind,
    showHiddenEdges,
    showLabels,
    showHeight,
    showMedian,
    showBisector,
    color,
    size,
  } = shape.props;

  return {
    geometry: buildMathFigureGeometry({
      w,
      h,
      kind,
      showHiddenEdges,
      showLabels,
      showHeight,
      showMedian,
      showBisector,
    }),
    strokeColor: getColorValue(colors, color, 'solid'),
    strokeWidth: getMathFigureStrokeWidth(size),
  };
}
