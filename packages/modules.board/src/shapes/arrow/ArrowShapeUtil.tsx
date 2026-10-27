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
}
