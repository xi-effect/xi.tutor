import { DrThemeColors, getColorValue, type DrColorStyle } from '@ibodr/draw';
import { TFill, TSize } from '../../types';

const SIZE_IN_PIXELS: Partial<Record<TSize, number>> = { xl: 20, l: 16, m: 10 };

export const getFillColor = (colors: DrThemeColors, fill: TFill, color: DrColorStyle): string => {
  if (fill === 'solid') return getColorValue(colors, color, 'solid');
  if (fill === 'semi') return getColorValue(colors, color, 'semi');

  return 'transparent';
};

export const getSizeInPixels = (size: TSize): number => SIZE_IN_PIXELS[size] ?? 6;
