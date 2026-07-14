import { BaseBoxShapeUtil, HTMLContainer, Rectangle2d, T } from '@ibodr/draw';

import { EmojiStickerShape } from './EmojiStickerShape';
import { EmojiStickerStyle } from '../shapeStyles';

export class EmojiStickerShapeUtil extends BaseBoxShapeUtil<EmojiStickerShape> {
  static override type = 'emoji-sticker' as const;

  static override props = {
    src: EmojiStickerStyle,
    w: T.number,
    h: T.number,
  };

  override getDefaultProps() {
    return {
      src: '',
      w: 128,
      h: 128,
    };
  }

  override getGeometry(shape: EmojiStickerShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  override component(shape: EmojiStickerShape) {
    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={shape.props.src}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      </HTMLContainer>
    );
  }

  override getIndicatorPath(shape: EmojiStickerShape) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }

  override isAspectRatioLocked() {
    return true;
  }

  override canEdit() {
    return false;
  }
}
