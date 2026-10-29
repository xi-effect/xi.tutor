import { FrameShapeUtil as FrameShapeUtilDraw, type DrFrameShape } from '@ibodr/draw';
import { resolveLodStyle } from '../../utils/resolveLodStyle';

const BaseFrameShapeUtil = FrameShapeUtilDraw.configure({ showColors: true });

export class FrameShapeUtil extends BaseFrameShapeUtil {
  override getLodStyle(shape: DrFrameShape) {
    return resolveLodStyle(super.getLodStyle(shape));
  }
}
