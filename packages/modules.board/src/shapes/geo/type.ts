import { DrBaseShape, DrGeoShapeProps, DrRichText } from '@ibodr/draw';
import { TAlign, TColor, TDash, TFill, TFont, TGeoShape, TSize, TVerticalAlign } from '../../types';

export type TShareShape = {
  props?: { class: string; borderColor?: string; color?: string; fill?: TFill; size?: TSize };
};

export type XiGeoShapeProps = DrGeoShapeProps & {
  borderColor: TColor;
  text: string;
};

export type XiGeoShape = DrBaseShape<'xi-geo', XiGeoShapeProps>;

/** @deprecated use XiGeoShapeProps */
export type TXiGeoShapeProps = {
  geo: TGeoShape;
  w: number;
  h: number;
  richText?: DrRichText;
  color: TColor;
  labelColor: TColor;
  fill: TFill;
  dash: TDash;
  size: TSize;
  font: TFont;
  align: TAlign;
  verticalAlign: TVerticalAlign;
  growY: number;
  url: string;
  scale: number;
  borderColor: TColor;
  text: string;
};

declare module '@ibodr/draw' {
  export interface DrGlobalShapePropsMap {
    'xi-geo': XiGeoShapeProps;
  }
}
