import { T, DrBaseShape, RecordProps } from '@ibodr/draw';

export const emojiStickerShapeProps: RecordProps<EmojiStickerShape> = {
  src: T.string,
  w: T.number,
  h: T.number,
};

export type EmojiStickerShape = DrBaseShape<
  'emoji-sticker',
  {
    src: string;
    w: number;
    h: number;
  }
>;

declare module '@ibodr/draw' {
  interface DrGlobalShapePropsMap {
    'emoji-sticker': EmojiStickerShape['props'];
  }
}
