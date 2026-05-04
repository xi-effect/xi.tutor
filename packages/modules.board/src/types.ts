import {
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFillStyle,
  DefaultFontStyle,
  DefaultSizeStyle,
  DefaultTextAlignStyle,
  DefaultVerticalAlignStyle,
  GeoShapeGeoStyle,
} from 'tldraw';

// types/index.ts
export type ToolType =
  | 'pen'
  | 'sticker'
  | 'text'
  | 'eraser'
  | 'rectangle'
  | 'image'
  | 'select'
  | 'hand'
  | 'arrow'
  | 'asset'
  | 'geo'
  | 'frame'
  | 'xi-geo';

export type ElementType =
  | 'line'
  | 'rectangle'
  | 'rect'
  | 'circle'
  | 'text'
  | 'sticker'
  | 'image'
  | 'toolbar'
  | 'note'
  | 'draw'
  | 'geo'
  | 'frame'
  | 'xi-geo';

export interface BoardElement {
  id: string;
  type: ElementType;
  // Свойства для линии
  points?: number[];
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  // Свойства для прямоугольника и круга
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill?: string;
  // Свойства масштабирования для всех элементов
  scaleX?: number;
  scaleY?: number;
  // Свойства для текста и стикера
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  // Свойства для изображения
  src?: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface ToolbarElement extends BoardElement {
  type: 'toolbar';
}

export type TGeoShape = (typeof GeoShapeGeoStyle)['defaultValue'];
export type TColor = (typeof DefaultColorStyle)['defaultValue'];
export type TSize = (typeof DefaultSizeStyle)['defaultValue'];
export type TFill = (typeof DefaultFillStyle)['defaultValue'];
export type TDash = (typeof DefaultDashStyle)['defaultValue'];
export type TFont = (typeof DefaultFontStyle)['defaultValue'];
export type TAlign = (typeof DefaultTextAlignStyle)['defaultValue'];
export type TVerticalAlign = (typeof DefaultVerticalAlignStyle)['defaultValue'];
