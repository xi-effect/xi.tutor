import {
  BaseBoxShapeUtil,
  T,
  RecordProps,
  DrBaseShape,
  HTMLContainer,
  Rectangle2d,
  LruCache,
} from '@ibodr/draw';
import { Emoji, getEmojiIconId } from '@xipkg/emojipicker';
import { EmojiStyle } from '../shapeStyles';
import { TEmoji } from '../../types';
import { blobOrUrlToDataUrl } from '../../utils/shapeSvgExport';

const EMOJI_IMAGE_BASE_URL = '/emoji/svg';

export type EmojiShapeProps = {
  w: number;
  h: number;
  emoji: TEmoji;
};

export type EmojiShape = DrBaseShape<'emoji', EmojiShapeProps>;

declare module '@ibodr/draw' {
  export interface DrGlobalShapePropsMap {
    emoji: EmojiShapeProps;
  }
}

const EMOJI_BOX_SIZE = 0.7;
const FALLBACK_FONT_FAMILY =
  'Apple Color Emoji, Twemoji Mozilla, Noto Color Emoji, Android Emoji, sans-serif';

const emojiSvgDataUrlCache = new LruCache<string, string>(100);
const inFlightRequests = new Map<string, Promise<string | null>>();

const getEmojiSvgDataUrl = (iconId: string): Promise<string | null> => {
  const cached = emojiSvgDataUrlCache.get(iconId);
  if (cached) return Promise.resolve(cached);

  const inFlight = inFlightRequests.get(iconId);
  if (inFlight) return inFlight;

  const promise = (async () => {
    const dataUrl = await blobOrUrlToDataUrl(`${EMOJI_IMAGE_BASE_URL}/${iconId}.svg`);
    const result = dataUrl?.startsWith('data:image/svg') ? dataUrl : null;

    if (result) emojiSvgDataUrlCache.set(iconId, result);

    return result;
  })();

  inFlightRequests.set(iconId, promise);
  promise.finally(() => inFlightRequests.delete(iconId));

  return promise;
};

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
    const size = Math.min(w, h) * EMOJI_BOX_SIZE;

    return (
      <HTMLContainer
        style={{
          width: w,
          height: h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Emoji char={emoji} size={size} baseUrl={EMOJI_IMAGE_BASE_URL} />
      </HTMLContainer>
    );
  }

  override async toSvg(shape: EmojiShape) {
    const { w, h, emoji } = shape.props;
    const size = Math.min(w, h) * EMOJI_BOX_SIZE;
    const src = await getEmojiSvgDataUrl(getEmojiIconId(emoji));

    if (!src) {
      return (
        <text
          x={w / 2}
          y={h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size}
          fontFamily={FALLBACK_FONT_FAMILY}
        >
          {emoji}
        </text>
      );
    }

    return <image href={src} x={(w - size) / 2} y={(h - size) / 2} width={size} height={size} />;
  }

  override getIndicatorPath(shape: EmojiShape) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }

  override isAspectRatioLocked() {
    return true;
  }

  override canEdit() {
    return true;
  }
}
