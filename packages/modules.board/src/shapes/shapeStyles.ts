import { StyleProp, T } from '@ibodr/draw';

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
