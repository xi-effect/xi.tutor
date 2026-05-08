import { TLDefaultColorTheme } from 'tldraw';
import { TColor, TFill, TSize } from '../../types';

const SIZE_IN_PIXELS: Partial<Record<TSize, number>> = { xl: 20, l: 16, m: 10 };

export const getFillColor = (theme: TLDefaultColorTheme, fill: TFill, color: TColor): string => {
  if (fill === 'solid') return theme[color].solid;
  if (fill === 'semi') return theme[color].semi;

  return 'transparent';
};

export const getSizeInPixels = (size: TSize): number => SIZE_IN_PIXELS[size] ?? 6;
