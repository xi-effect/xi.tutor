import { TextShapeUtil as TextShapeUtilDraw, type DrTextShape } from '@ibodr/draw';
import { resolveLodStyle } from '../../utils/resolveLodStyle';

/**
 * Клик по ссылке внутри текстовой фигуры не должен открывать её — переход доступен только
 * через LinkHoverPreview (см. useLinkHoverPreview).
 */
const BaseTextShapeUtil = TextShapeUtilDraw.configure({ openLinksOnClick: false });

export class TextShapeUtil extends BaseTextShapeUtil {
  override getLodStyle(shape: DrTextShape) {
    return resolveLodStyle(super.getLodStyle(shape));
  }
}
