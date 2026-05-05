import { TLRichText } from 'tldraw';
import { TAlign, TColor, TDash, TFill, TFont, TGeoShape, TSize, TVerticalAlign } from '../../types';

export type TShareShape = {
  props?: { class: string; borderColor?: string; color?: string; fill?: TFill; size?: TSize };
};

export type TXiGeoShapeProps = {
  geo: TGeoShape;
  w: number;
  h: number;
  richText?: TLRichText;
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
