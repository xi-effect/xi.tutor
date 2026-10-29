import {
  DrawShapeUtil as DrawShapeUtilBase,
  HighlightShapeUtil as HighlightShapeUtilBase,
  LineShapeUtil as LineShapeUtilBase,
  type DrDrawShape,
  type DrHighlightShape,
  type DrLineShape,
} from '@ibodr/draw';
import { resolveLodStyle } from '../utils/resolveLodStyle';

/** Цвета темы — CSS-переменные. Упрощённый холст 0.2.9 красит ими напрямую, поэтому резолвим. */
export class DrawShapeUtil extends DrawShapeUtilBase {
  override getLodStyle(shape: DrDrawShape) {
    return resolveLodStyle(super.getLodStyle(shape));
  }
}

export class HighlightShapeUtil extends HighlightShapeUtilBase {
  override getLodStyle(shape: DrHighlightShape) {
    return resolveLodStyle(super.getLodStyle(shape));
  }
}

export class LineShapeUtil extends LineShapeUtilBase {
  override getLodStyle(shape: DrLineShape) {
    return resolveLodStyle(super.getLodStyle(shape));
  }
}
