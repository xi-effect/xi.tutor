import { Extension } from '@tiptap/core';
import { moveBlock } from '../utils/moveBlock';

/**
 * Расширение: горячие клавиши для перемещения блока вверх/вниз.
 * Mod+Shift+ArrowUp / Mod+Shift+ArrowDown
 */
export const MoveBlockKeyboard = Extension.create({
  name: 'moveBlockKeyboard',

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-ArrowUp': () => moveBlock(this.editor, 'up'),
      'Mod-Shift-ArrowDown': () => moveBlock(this.editor, 'down'),
    };
  },
});
