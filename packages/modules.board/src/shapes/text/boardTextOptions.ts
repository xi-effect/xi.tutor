import { tipTapDefaultExtensions, type DrTextOptions } from '@ibodr/draw';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { BoardInlineMath } from './boardInlineMath';
import { BoardTextHighlight } from './boardTextHighlight';

const katexOptions = {
  throwOnError: false,
};

export const boardTextOptions: DrTextOptions = {
  tipTapConfig: {
    extensions: [
      ...tipTapDefaultExtensions.filter((extension) => extension.name !== 'highlight'),
      BoardTextHighlight,
      Superscript,
      Subscript,
      BoardInlineMath.configure({
        katexOptions,
      }),
    ],
  },
};
