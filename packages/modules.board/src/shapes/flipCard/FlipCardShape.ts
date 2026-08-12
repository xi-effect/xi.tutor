import {
  DefaultColorStyle,
  DefaultSizeStyle,
  T,
  DrBaseShape,
  DrRichText,
  richTextValidator,
} from '@ibodr/draw';

export type FlipCardShapeProps = {
  w: number;
  h: number;
  richText: DrRichText;
  backText: DrRichText;
  isFlipped: boolean;
  color: typeof DefaultColorStyle.defaultValue;
  size: typeof DefaultSizeStyle.defaultValue;
};

export const flipCardShapeProps = {
  w: T.number,
  h: T.number,
  richText: richTextValidator,
  backText: richTextValidator,
  isFlipped: T.boolean,
  color: DefaultColorStyle,
  size: DefaultSizeStyle,
};

export type FlipCardShape = DrBaseShape<'flip-card', FlipCardShapeProps>;

declare module '@ibodr/draw' {
  export interface DrGlobalShapePropsMap {
    'flip-card': FlipCardShapeProps;
  }
}
