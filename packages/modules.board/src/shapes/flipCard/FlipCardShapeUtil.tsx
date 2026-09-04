import { BaseBoxShapeUtil, DrResizeInfo, resizeBox } from '@ibodr/draw';
import { FlipCardShape, flipCardShapeProps } from './FlipCardShape';
import { FlipCardComponent } from './FlipCardComponent';
import {
  BASE_CARD_HEIGHT,
  BASE_CARD_WIDTH,
  EMPTY_RICH_TEXT,
  FLIP_CARD_MAX_HEIGHT,
  FLIP_CARD_MAX_WIDTH,
  FLIP_CARD_MIN_HEIGHT,
  FLIP_CARD_MIN_WIDTH,
} from './consts';
import { createElement } from 'react';
import { FlipCardBackColorStyle, FlipCardFrontColorStyle } from '../shapeStyles';

export class FlipCardShapeUtil extends BaseBoxShapeUtil<FlipCardShape> {
  static override type = 'flip-card' as const;
  static override props = flipCardShapeProps;

  override getDefaultProps(): FlipCardShape['props'] {
    return {
      w: BASE_CARD_WIDTH,
      h: BASE_CARD_HEIGHT,
      richText: EMPTY_RICH_TEXT,
      frontRichText: EMPTY_RICH_TEXT,
      backRichText: EMPTY_RICH_TEXT,
      frontImageAssetId: null,
      backImageAssetId: null,
      isFlipped: false,
      frontColor: FlipCardFrontColorStyle.defaultValue,
      backColor: FlipCardBackColorStyle.defaultValue,
      size: 'm',
    };
  }

  override canEdit() {
    return true;
  }

  override canResize() {
    return true;
  }

  override isAspectRatioLocked() {
    return true;
  }

  override onResize(shape: FlipCardShape, info: DrResizeInfo<FlipCardShape>) {
    return resizeBox(shape, info, {
      minWidth: FLIP_CARD_MIN_WIDTH,
      minHeight: FLIP_CARD_MIN_HEIGHT,
      maxWidth: FLIP_CARD_MAX_WIDTH,
      maxHeight: FLIP_CARD_MAX_HEIGHT,
    });
  }

  override component(shape: FlipCardShape) {
    return createElement(FlipCardComponent, { shape });
  }

  override getIndicatorPath(shape: FlipCardShape) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}
