import { StyleProp } from 'tldraw';

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
