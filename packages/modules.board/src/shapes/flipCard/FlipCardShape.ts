import {
  DefaultColorStyle,
  DefaultSizeStyle,
  T,
  DrBaseShape,
  DrRichText,
  DrAssetId,
  richTextValidator,
  idValidator,
} from '@ibodr/draw';

const assetIdValidator = idValidator<DrAssetId>('asset');

export type FlipCardShapeProps = {
  w: number;
  h: number;
  richText: DrRichText;
  frontRichText: DrRichText;
  backRichText: DrRichText;
  frontImageAssetId: DrAssetId | null;
  backImageAssetId: DrAssetId | null;
  isFlipped: boolean;
  color: typeof DefaultColorStyle.defaultValue;
  size: typeof DefaultSizeStyle.defaultValue;
};

export const flipCardShapeProps = {
  w: T.number,
  h: T.number,
  richText: richTextValidator,
  frontRichText: richTextValidator,
  backRichText: richTextValidator,
  frontImageAssetId: assetIdValidator.nullable(),
  backImageAssetId: assetIdValidator.nullable(),
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
