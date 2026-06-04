import {
  createShapeId,
  DefaultColorStyle,
  DefaultSizeStyle,
  StateNode,
  DrShapeId,
  VecLike,
} from '@ibodr/draw';
import {
  COORDINATE_AXES_DEFAULT_HEIGHT,
  COORDINATE_AXES_DEFAULT_WIDTH,
} from './CoordinateAxesShape';

const CLICK_DRAG_THRESHOLD = 4;
const MIN_DRAG_SIZE = 160;

export class CoordinateAxesTool extends StateNode {
  static override id = 'coordinate-axes';

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

    const color = this.editor.getStyleForNextShape(DefaultColorStyle);
    const size = this.editor.getStyleForNextShape(DefaultSizeStyle);

    this.editor.createShape({
      id: this.currentShapeId,
      type: 'coordinate-axes',
      x: this.startPoint.x,
      y: this.startPoint.y,
      props: {
        w: 0,
        h: 0,
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 5,
        xDivisions: 10,
        yDivisions: 10,
        showLabels: true,
        equation: '',
        color,
        plotColor: 'blue',
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
      type: 'coordinate-axes',
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
    if (!shape || !this.editor.isShapeOfType(shape, 'coordinate-axes')) {
      this.currentShapeId = null;
      this.startPoint = null;
      return;
    }

    const isClick = dragW < CLICK_DRAG_THRESHOLD && dragH < CLICK_DRAG_THRESHOLD;
    const w = isClick ? COORDINATE_AXES_DEFAULT_WIDTH : Math.max(MIN_DRAG_SIZE, dragW);
    const h = isClick ? COORDINATE_AXES_DEFAULT_HEIGHT : Math.max(MIN_DRAG_SIZE, dragH);
    const x = isClick ? this.startPoint.x - w / 2 : Math.min(currentPoint.x, this.startPoint.x);
    const y = isClick ? this.startPoint.y - h / 2 : Math.min(currentPoint.y, this.startPoint.y);

    this.editor.updateShape({
      id: this.currentShapeId,
      type: 'coordinate-axes',
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
