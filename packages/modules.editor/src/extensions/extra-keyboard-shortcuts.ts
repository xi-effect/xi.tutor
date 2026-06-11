import { Extension } from '@tiptap/core';
import { duplicateBlock, removeBlock } from '../hooks/useBlockMenuActions';

export const ExtraShortcuts = Extension.create({
  name: 'extraShortcuts',

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-C': () => duplicateBlock(this.editor),
      Delete: () => removeBlock(this.editor),
    };
  },
});
