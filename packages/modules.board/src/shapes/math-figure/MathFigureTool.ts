import {
  createShapeId,
  DefaultColorStyle,
  DefaultSizeStyle,
  StateNode,
  DrShapeId,
  VecLike,
} from '@ibodr/draw';
import { MathFigureKindStyle } from '../shapeStyles';
import { getMathFigureDefaultProps } from './MathFigureShape';
import { isMathFigureKind, MATH_FIGURE_DEFAULT_SIZE, MATH_FIGURE_MIN_SIZE } from './utils/kinds';

const CLICK_DRAG_THRESHOLD = 4;

export class MathFigureTool extends StateNode {
  static override id = 'math-figure';

  private currentShapeId: DrShapeId | null = null;
  private startPoint: VecLike | null = null;

  override onEnter() {
    this.editor.setCursor({ type: 'cross', rotation: 0 });
  }

  override onPointerDown() {
    this.currentShapeId = createShapeId();
    this.startPoint = {
      x: this.editor.inputs.currentPagePoint.x,
      y: this.editor.inputs.currentPagePoint.y,
    };

    const kindValue = this.editor.getStyleForNextShape(MathFigureKindStyle);
    const kind = isMathFigureKind(kindValue) ? kindValue : 'cube';
    const color = this.editor.getStyleForNextShape(DefaultColorStyle);
    const size = this.editor.getStyleForNextShape(DefaultSizeStyle);

    this.editor.createShape({
      id: this.currentShapeId,
      type: 'math-figure',
      x: this.startPoint.x,
      y: this.startPoint.y,
      props: {
        ...getMathFigureDefaultProps(kind),
        w: 0,
        h: 0,
        color,
        size,
      },
    });
  }

  override onPointerMove() {
    if (!this.currentShapeId || !this.startPoint) return;

    const currentPoint = this.editor.inputs.currentPagePoint;
    const width = Math.abs(currentPoint.x - this.startPoint.x);
    const height = Math.abs(currentPoint.y - this.startPoint.y);
    const x = Math.min(currentPoint.x, this.startPoint.x);
    const y = Math.min(currentPoint.y, this.startPoint.y);

    this.editor.updateShape({
      id: this.currentShapeId,
      type: 'math-figure',
      x,
      y,
      props: { w: width, h: height },
    });
  }

  override onPointerUp() {
    if (!this.currentShapeId || !this.startPoint) return;

    const currentPoint = this.editor.inputs.currentPagePoint;
    const dragW = Math.abs(currentPoint.x - this.startPoint.x);
    const dragH = Math.abs(currentPoint.y - this.startPoint.y);

    const shape = this.editor.getShape(this.currentShapeId);
    if (!shape || !this.editor.isShapeOfType(shape, 'math-figure')) {
      this.currentShapeId = null;
      this.startPoint = null;
      return;
    }

    const defaults = MATH_FIGURE_DEFAULT_SIZE[shape.props.kind];
    const isClick = dragW < CLICK_DRAG_THRESHOLD && dragH < CLICK_DRAG_THRESHOLD;
    const w = isClick ? defaults.w : Math.max(MATH_FIGURE_MIN_SIZE, dragW);
    const h = isClick ? defaults.h : Math.max(MATH_FIGURE_MIN_SIZE, dragH);
    const x = isClick ? this.startPoint.x - w / 2 : Math.min(currentPoint.x, this.startPoint.x);
    const y = isClick ? this.startPoint.y - h / 2 : Math.min(currentPoint.y, this.startPoint.y);

    this.editor.updateShape({
      id: this.currentShapeId,
      type: 'math-figure',
      x,
      y,
      props: { w, h },
    });

    this.editor.setCurrentTool('select');
    this.editor.setSelectedShapes([this.currentShapeId]);

    this.currentShapeId = null;
    this.startPoint = null;
  }

  override onCancel() {
    if (this.currentShapeId) {
      this.editor.deleteShape(this.currentShapeId);
    }
    this.currentShapeId = null;
    this.startPoint = null;
  }
}
