import {
  createShapeId,
  DefaultColorStyle,
  DefaultFillStyle,
  DefaultSizeStyle,
  GeoShapeGeoStyle,
  getGeoTypeDefinition,
  StateNode,
  DrShapeId,
  VecLike,
} from '@ibodr/draw';
import { BorderColorStyle } from '../shapeStyles';

/** Порог «клик без протягивания» — ниже считаем, что пользователь не задавал размер. */
const CLICK_DRAG_THRESHOLD = 4;

/** Минимальный размер при протягивании (как в @ibodr/draw: Math.max(1, …)). */
const MIN_DRAG_SIZE = 1;

const DEFAULT_CLICK_SIZE = { w: 100, h: 100 };

export class XiGeoTool extends StateNode {
  static override id = 'xi-geo';

  private currentShapeId: DrShapeId | null = null;
  private startPoint: VecLike | null = null;

  override onPointerDown() {
    this.currentShapeId = createShapeId();
    this.startPoint = {
      x: this.editor.inputs.currentPagePoint.x,
      y: this.editor.inputs.currentPagePoint.y,
    };

    const geo = this.editor.getStyleForNextShape(GeoShapeGeoStyle);
    const color = this.editor.getStyleForNextShape(DefaultColorStyle);
    const borderColor = this.editor.getStyleForNextShape(BorderColorStyle);
    const fill = this.editor.getStyleForNextShape(DefaultFillStyle);
    const size = this.editor.getStyleForNextShape(DefaultSizeStyle);

    this.editor.createShape({
      id: this.currentShapeId,
      type: 'xi-geo',
      x: this.startPoint.x,
      y: this.startPoint.y,
      props: {
        w: 0,
        h: 0,
        fill,
        geo,
        color,
        borderColor,
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
      type: 'xi-geo',
      x,
      y,
      props: {
        w: width,
        h: height,
      },
    });
  }

  override onPointerUp() {
    if (!this.currentShapeId || !this.startPoint) return;

    const currentPoint = this.editor.inputs.currentPagePoint;
    const dragW = Math.abs(currentPoint.x - this.startPoint.x);
    const dragH = Math.abs(currentPoint.y - this.startPoint.y);

    const shape = this.editor.getShape(this.currentShapeId);
    if (!shape || !this.editor.isShapeOfType(shape, 'xi-geo')) {
      this.currentShapeId = null;
      this.startPoint = null;
      return;
    }

    const def = getGeoTypeDefinition(shape.props.geo);
    const defaultSize = def?.defaultSize ?? DEFAULT_CLICK_SIZE;

    const isClick = dragW < CLICK_DRAG_THRESHOLD && dragH < CLICK_DRAG_THRESHOLD;

    const w = isClick ? defaultSize.w : Math.max(MIN_DRAG_SIZE, dragW);
    const h = isClick ? defaultSize.h : Math.max(MIN_DRAG_SIZE, dragH);

    const x = isClick ? this.startPoint.x - w / 2 : Math.min(currentPoint.x, this.startPoint.x);
    const y = isClick ? this.startPoint.y - h / 2 : Math.min(currentPoint.y, this.startPoint.y);

    this.editor.updateShape({
      id: this.currentShapeId,
      type: 'xi-geo',
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
