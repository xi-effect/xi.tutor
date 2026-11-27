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
import { draggedBox } from './draggedBox';
import { getGeoDrawIntent } from './geoDrawIntent';

/** Порог «клик без протягивания» — ниже считаем, что пользователь не задавал размер. */
const CLICK_DRAG_THRESHOLD = 4;

/** Минимальный размер при протягивании (как в @ibodr/draw: Math.max(1, …)). */
const MIN_DRAG_SIZE = 1;

const DEFAULT_CLICK_SIZE = { w: 100, h: 100 };
const LOCK_ASPECT_META_KEY = 'lockAspect';

export class XiGeoTool extends StateNode {
  static override id = 'xi-geo';
  static override isLockable = true;

  private currentShapeId: DrShapeId | null = null;
  private startPoint: VecLike | null = null;

  override onPointerDown() {
    const currentPagePoint = this.editor.inputs.getCurrentPagePoint();
    this.currentShapeId = createShapeId();
    this.startPoint = {
      x: currentPagePoint.x,
      y: currentPagePoint.y,
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
      meta: getGeoDrawIntent().lockAspect ? { [LOCK_ASPECT_META_KEY]: true } : {},
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

    const currentPoint = this.editor.inputs.getCurrentPagePoint();
    const box = draggedBox(this.startPoint, currentPoint, this.shouldLockAspect());

    this.editor.updateShape({
      id: this.currentShapeId,
      type: 'xi-geo',
      x: box.x,
      y: box.y,
      props: {
        w: box.w,
        h: box.h,
      },
    });
  }

  override onPointerUp() {
    if (!this.currentShapeId || !this.startPoint) return;

    const currentPoint = this.editor.inputs.getCurrentPagePoint();
    const dragW = Math.abs(currentPoint.x - this.startPoint.x);
    const dragH = Math.abs(currentPoint.y - this.startPoint.y);
    const shapeId = this.currentShapeId;

    const shape = this.editor.getShape(shapeId);
    if (!shape || !this.editor.isShapeOfType(shape, 'xi-geo')) {
      this.currentShapeId = null;
      this.startPoint = null;
      return;
    }

    const def = getGeoTypeDefinition(shape.props.geo);
    const defaultSize = def?.defaultSize ?? DEFAULT_CLICK_SIZE;
    const isClick = dragW < CLICK_DRAG_THRESHOLD && dragH < CLICK_DRAG_THRESHOLD;
    const lockAspect = this.shouldLockAspect();
    const squareSide = Math.max(defaultSize.w, defaultSize.h);

    const box = isClick
      ? {
          w: lockAspect ? squareSide : defaultSize.w,
          h: lockAspect ? squareSide : defaultSize.h,
          x: this.startPoint.x - (lockAspect ? squareSide : defaultSize.w) / 2,
          y: this.startPoint.y - (lockAspect ? squareSide : defaultSize.h) / 2,
        }
      : draggedBox(this.startPoint, currentPoint, lockAspect);

    const w = isClick ? box.w : Math.max(MIN_DRAG_SIZE, box.w);
    const h = isClick ? box.h : Math.max(MIN_DRAG_SIZE, box.h);

    this.editor.updateShape({
      id: shapeId,
      type: 'xi-geo',
      x: box.x,
      y: box.y,
      props: { w, h },
    });

    this.currentShapeId = null;
    this.startPoint = null;
    this.editor.setSelectedShapes([shapeId]);
    this.editor.setCurrentTool('select');
  }

  override onCancel() {
    const hasPendingGesture = Boolean(this.currentShapeId);
    if (this.currentShapeId) {
      this.editor.deleteShape(this.currentShapeId);
    }
    this.currentShapeId = null;
    this.startPoint = null;
    if (!hasPendingGesture) this.editor.setCurrentTool('select');
  }

  private shouldLockAspect() {
    return getGeoDrawIntent().lockAspect || this.editor.inputs.getShiftKey();
  }
}
