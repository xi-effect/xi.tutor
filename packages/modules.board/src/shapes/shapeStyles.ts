import { StyleProp, T } from '@ibodr/draw';
import { MATH_FIGURE_KINDS } from './math-figure/utils/kinds';
import { BOARD_COLORS } from '../utils/boardColors';

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

const FLIP_CARD_COLOR_VALUES = BOARD_COLORS.map((option) => option.name);

export const FlipCardFrontColorStyle = StyleProp.defineEnum('xi:flipCardFrontColor', {
  values: FLIP_CARD_COLOR_VALUES,
  defaultValue: 'light-violet',
});

export const FlipCardBackColorStyle = StyleProp.defineEnum('xi:flipCardBackColor', {
  values: FLIP_CARD_COLOR_VALUES,
  defaultValue: 'white',
});

export const MathFigureKindStyle = StyleProp.defineEnum('xi:mathFigureKind', {
  values: [...MATH_FIGURE_KINDS],
  defaultValue: 'cube',
});
