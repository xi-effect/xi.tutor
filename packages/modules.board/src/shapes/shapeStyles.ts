import { StyleProp, T } from '@ibodr/draw';
import { MATH_FIGURE_KINDS } from './math-figure/utils/kinds';

export const BorderColorStyle = StyleProp.defineEnum('xi:borderColor', {
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

export const MathFigureKindStyle = StyleProp.defineEnum('xi:mathFigureKind', {
  values: [...MATH_FIGURE_KINDS],
  defaultValue: 'cube',
});
