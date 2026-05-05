import { TLDefaultColorTheme } from 'tldraw';
import { TColor, TFill, TSize } from '../../types';

export const getFillColor = (theme: TLDefaultColorTheme, fill: TFill, color: TColor): string => {
  if (fill === 'solid') return theme[color].solid;
  if (fill === 'semi') return theme[color].semi;

  return 'transparent';
};

export const getSizeInPixels = (size: TSize): number => {
  if (size === 'xl') return 20;
  if (size === 'l') return 16;
  if (size === 'm') return 10;

  return 6;
};
