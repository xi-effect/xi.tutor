import { tipTapDefaultExtensions, type DrTextOptions } from '@ibodr/draw';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { BoardInlineMath } from './boardInlineMath';

const katexOptions = {
  throwOnError: false,
};

export const boardTextOptions: DrTextOptions = {
  tipTapConfig: {
    extensions: [
      ...tipTapDefaultExtensions,
      Superscript,
      Subscript,
      BoardInlineMath.configure({
        katexOptions,
      }),
    ],
  },
};
