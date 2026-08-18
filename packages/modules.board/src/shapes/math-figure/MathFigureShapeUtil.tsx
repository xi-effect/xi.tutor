import { BaseBoxShapeUtil, DrResizeInfo, resizeBox } from '@ibodr/draw';
import {
  getMathFigureDefaultProps,
  MathFigureShape,
  mathFigureShapeProps,
} from './MathFigureShape';
import { MATH_FIGURE_MIN_SIZE } from './utils/kinds';
import { MathFigureComponent } from './MathFigureComponent';
import { buildMathFigureSvgProps } from './utils/buildMathFigureSvgProps';
import { MathFigureSvgContent } from './MathFigureSvgContent';

export class MathFigureShapeUtil extends BaseBoxShapeUtil<MathFigureShape> {
  static override type = 'math-figure' as const;
  static override props = mathFigureShapeProps;

  override getDefaultProps(): MathFigureShape['props'] {
    return getMathFigureDefaultProps('cube');
  }

  override canEdit() {
    return false;
  }

  override canResize() {
    return true;
  }

  override isAspectRatioLocked() {
    return false;
  }

  override onResize(shape: MathFigureShape, info: DrResizeInfo<MathFigureShape>) {
    return resizeBox(shape, info, {
      minWidth: MATH_FIGURE_MIN_SIZE,
      minHeight: MATH_FIGURE_MIN_SIZE,
    });
  }

  override component(shape: MathFigureShape) {
    return <MathFigureComponent shape={shape} />;
  }

  override toSvg(shape: MathFigureShape) {
    const props = buildMathFigureSvgProps(shape, this.editor);
    return <MathFigureSvgContent {...props} />;
  }

  override getIndicatorPath(shape: MathFigureShape) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}
