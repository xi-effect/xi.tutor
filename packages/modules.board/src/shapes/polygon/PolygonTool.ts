import {
  createShapeId,
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFillStyle,
  DefaultSizeStyle,
  StateNode,
} from '@ibodr/draw';
import { BorderColorStyle } from '../shapeStyles';
import { releaseToolUnlessLocked } from '../../utils/releaseToolUnlessLocked';
import {
  distance,
  guideThrough,
  isValidTrapezoid,
  isValidTriangle,
  normalizeVertices,
  projectOntoLine,
  sub,
  type Pt,
} from './polygonGeometry';
import { usePolygonDraft, type PolygonGuide } from './polygonDraft';
import type { XiPolygonShapeProps } from './XiPolygonShapeUtil';

type PolygonKind = 'triangle' | 'trapezoid';

abstract class PolygonBuildTool extends StateNode {
  static override isLockable = true;

  abstract readonly kind: PolygonKind;
  abstract readonly pointCount: number;

  protected points: Pt[] = [];

  override onEnter() {
    this.points = [];
    this.editor.setCursor({ type: 'cross', rotation: 0 });
    usePolygonDraft.getState().setDraft(null);
  }

  override onExit() {
    this.points = [];
    usePolygonDraft.getState().setDraft(null);
  }

  override onPointerMove() {
    if (this.points.length === 0) return;
    const raw = this.pagePoint();
    const preview = this.preview(raw);
    this.publish(preview.cursor, preview.valid, preview.guide);
  }

  override onPointerDown() {
    const raw = this.pagePoint();
    const minGap = this.minGap();

    if (this.points.length + 1 < this.pointCount) {
      if (this.points.some((point) => distance(point, raw) < minGap)) return;
      this.points = [...this.points, raw];
      this.publish(raw, true, null);
      return;
    }

    const preview = this.preview(raw);
    if (!preview.valid) return;

    this.commit([...this.points, preview.cursor]);
  }

  override onCancel() {
    if (this.points.length > 0) {
      this.points = [];
      usePolygonDraft.getState().setDraft(null);
      return;
    }
    this.editor.setCurrentTool('select');
  }

  private pagePoint(): Pt {
    const point = this.editor.inputs.getCurrentPagePoint();
    return { x: point.x, y: point.y };
  }

  private minGap() {
    return Math.max(1, 8 / this.editor.getZoomLevel());
  }

  private preview(raw: Pt): { cursor: Pt; valid: boolean; guide: PolygonGuide | null } {
    const minGap = this.minGap();

    if (this.kind === 'trapezoid' && this.points.length >= 3) {
      const [first, second, third] = this.points;
      if (!first || !second || !third) return { cursor: raw, valid: false, guide: null };
      const direction = sub(second, first);
      const projected = projectOntoLine(third, direction, raw);
      const cursor = projected ?? raw;
      const guide = projected ? guideThrough(third, direction) : null;
      const valid = projected ? isValidTrapezoid([first, second, third, projected], minGap) : false;
      return { cursor, valid, guide };
    }

    const candidate = [...this.points, raw];
    const valid =
      this.kind === 'triangle' && this.points.length >= 2
        ? isValidTriangle(candidate, minGap)
        : this.points.every((point) => distance(point, raw) >= minGap);

    return { cursor: raw, valid, guide: null };
  }

  private publish(cursor: Pt, valid: boolean, guide: PolygonGuide | null) {
    usePolygonDraft.getState().setDraft({
      kind: this.kind,
      points: this.points.map((point) => ({ ...point })),
      cursor,
      valid,
      guide,
    });
  }

  private commit(pagePoints: Pt[]) {
    const placed = normalizeVertices({ x: 0, y: 0 }, 0, pagePoints);
    const id = createShapeId();
    const color = this.editor.getStyleForNextShape(DefaultColorStyle);
    const fill = this.editor.getStyleForNextShape(DefaultFillStyle);
    const size = this.editor.getStyleForNextShape(DefaultSizeStyle);
    const dash = this.editor.getStyleForNextShape(DefaultDashStyle);
    const borderColor = this.editor.getStyleForNextShape(BorderColorStyle);

    this.editor.markHistoryStoppingPoint('create-polygon');
    this.editor.createShapes([
      {
        id,
        type: 'xi-polygon',
        x: placed.x,
        y: placed.y,
        props: {
          kind: this.kind,
          vertices: placed.vertices,
          color: color as XiPolygonShapeProps['color'],
          fill: fill as XiPolygonShapeProps['fill'],
          size: size as XiPolygonShapeProps['size'],
          dash: dash as XiPolygonShapeProps['dash'],
          borderColor: borderColor as XiPolygonShapeProps['borderColor'],
        },
      },
    ]);

    if (!this.editor.getShape(id)) return;

    this.points = [];
    usePolygonDraft.getState().setDraft(null);
    this.editor.setSelectedShapes([id]);
    releaseToolUnlessLocked(this.editor);
  }
}

export class FreeTriangleTool extends PolygonBuildTool {
  static override id = 'xi-triangle';

  override readonly kind = 'triangle';
  override readonly pointCount = 3;
}

export class FreeTrapezoidTool extends PolygonBuildTool {
  static override id = 'xi-trapezoid';

  override readonly kind = 'trapezoid';
  override readonly pointCount = 4;
}
