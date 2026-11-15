import { ArrowShapeUtil as ArrowShapeUtilDraw, type DrArrowShape } from '@ibodr/draw';
import { resolveLodStyle } from '../../utils/resolveLodStyle';

/**
 * Клик по ссылке внутри лейбла стрелки не должен открывать её — переход доступен только
 * через LinkHoverPreview (см. useLinkHoverPreview).
 */
const BaseArrowShapeUtil = ArrowShapeUtilDraw.configure({ openLinksOnClick: false });

export class ArrowShapeUtil extends BaseArrowShapeUtil {
  override getLodStyle(shape: DrArrowShape) {
    return resolveLodStyle(super.getLodStyle(shape));
  }

  // Обводка выделения не рисуется у заблокированных фигур, а рамку стрелка прячет.
  // Без рамки выбранную заблокированную стрелку не видно и нечем разблокировать.
  override hideSelectionBoundsFg(shape: DrArrowShape) {
    if (shape.isLocked) return false;
    return super.hideSelectionBoundsFg(shape);
  }

  override hideSelectionBoundsBg(shape: DrArrowShape) {
    if (shape.isLocked) return false;
    return super.hideSelectionBoundsBg(shape);
  }
}
