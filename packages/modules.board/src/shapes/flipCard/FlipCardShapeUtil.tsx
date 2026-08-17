import { BaseBoxShapeUtil, DrResizeInfo, resizeBox } from '@ibodr/draw';
import { FlipCardShape, flipCardShapeProps } from './FlipCardShape';
import { FlipCardComponent } from './FlipCardComponent';
import { BASE_CARD_HEIGHT, BASE_CARD_WIDTH, EMPTY_RICH_TEXT, FLIP_CARD_MIN_SIZE } from './consts';
import { createElement } from 'react';

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
      color: 'black',
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
      minWidth: FLIP_CARD_MIN_SIZE,
      minHeight: FLIP_CARD_MIN_SIZE,
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
