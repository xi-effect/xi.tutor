import { BaseBoxShapeUtil, T, RecordProps, TLBaseShape, HTMLContainer, Rectangle2d } from 'tldraw';
import { EmojiStyle } from '../shapeStyles';
import { TEmoji } from '../../types';

export type EmojiShape = TLBaseShape<
  'emoji',
  {
    w: number;
    h: number;
    emoji: TEmoji;
  }
>;

declare module 'tldraw' {
  export interface TLGlobalShapePropsMap {
    emoji: {
      w: number;
      h: number;
      emoji: TEmoji;
    };
  }
}

const EMOJI_BOX_SIZE = 0.7;

export class EmojiShapeUtil extends BaseBoxShapeUtil<EmojiShape> {
  static override type = 'emoji' as const;

  static override props: RecordProps<EmojiShape> = {
    w: T.number,
    h: T.number,
    emoji: EmojiStyle,
  };

  override getDefaultProps(): EmojiShape['props'] {
    return {
      w: 80,
      h: 80,
      emoji: '😀',
    };
  }

  override getGeometry(shape: EmojiShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  override component(shape: EmojiShape) {
    const { w, h, emoji } = shape.props;
    const fontSize = Math.min(w, h) * EMOJI_BOX_SIZE;

    return (
      <HTMLContainer
        style={{
          width: w,
          height: h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${fontSize}px`,
          fontFamily: 'Apple Color Emoji, Twemoji Mozilla, Noto Color Emoji, Android Emoji',
        }}
      >
        {emoji}
      </HTMLContainer>
    );
  }

  override indicator(shape: EmojiShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  override isAspectRatioLocked() {
    return true;
  }

  override canEdit() {
    return true;
  }
}
