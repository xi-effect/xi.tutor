import {
  createShapeId,
  DefaultColorStyle,
  DefaultFillStyle,
  DefaultSizeStyle,
  GeoShapeGeoStyle,
  StateNode,
  TLShapeId,
  VecLike,
} from 'tldraw';
import { BorderColorStyle } from '../shapeStyles';

export class XiGeoTool extends StateNode {
  static override id = 'xi-geo';

  private currentShapeId: TLShapeId | null = null;
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
    const width = Math.abs(currentPoint.x - this.startPoint.x);
    const height = Math.abs(currentPoint.y - this.startPoint.y);

    this.editor.updateShape({
      id: this.currentShapeId,
      type: 'xi-geo',
      props: {
        w: width > 100 ? width : 100,
        h: height > 100 ? height : 100,
      },
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
