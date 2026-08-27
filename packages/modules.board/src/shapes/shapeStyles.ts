import { StyleProp, T } from '@ibodr/draw';
import { MATH_FIGURE_KINDS } from './math-figure/utils/kinds';

export const BorderColorStyle = StyleProp.defineEnum('xi:borderColor', {
  values: [
    'none',
    'black',
    'white',
    'blue',
    'green',
    'grey',
    'light-blue',
    'light-green',
    'light-red',
    'light-violet',
    'orange',
    'red',
    'violet',
    'yellow',
  ],
  defaultValue: 'black',
});

export const EmojiStyle = StyleProp.define('xi:emoji', {
  defaultValue: '😀',
  type: T.string,
});

export const PlotColorStyle = StyleProp.defineEnum('xi:plotColor', {
  values: [
    'black',
    'white',
    'blue',
    'green',
    'grey',
    'light-blue',
    'light-green',
    'light-red',
    'light-violet',
    'orange',
    'red',
    'violet',
    'yellow',
  ],
  defaultValue: 'blue',
});

export const EmojiStickerStyle = StyleProp.define<string>('xi:emojiSticker', {
  defaultValue: '',
});

const FLIP_CARD_COLOR_VALUES = [
  'grey',
  'blue',
  'red',
  'green',
  'light-red',
  'yellow',
  'violet',
  'light-violet',
  'light-blue',
] as const;

export const FlipCardFrontColorStyle = StyleProp.defineEnum('xi:flipCardFrontColor', {
  values: FLIP_CARD_COLOR_VALUES,
  defaultValue: 'yellow',
});

export const FlipCardBackColorStyle = StyleProp.defineEnum('xi:flipCardBackColor', {
  values: FLIP_CARD_COLOR_VALUES,
  defaultValue: 'grey',
});

export const MathFigureKindStyle = StyleProp.defineEnum('xi:mathFigureKind', {
  values: [...MATH_FIGURE_KINDS],
  defaultValue: 'cube',
});
