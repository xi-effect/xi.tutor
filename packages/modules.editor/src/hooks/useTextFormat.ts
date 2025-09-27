import { Editor } from '@tiptap/core';
import { useCallback } from 'react';
import { TextFormatTypeT } from '../types';

export const useTextFormat = (editor: Editor | null, type: TextFormatTypeT) => {
  const toggleFormat = useCallback(() => {
    if (!editor) return;

    if (type === 'link') {
      if (editor.isActive('link')) {
        editor.chain().focus().unsetLink().run();
      } else {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl || 'https://');

        if (url === null) return;
        if (url === '') {
          editor.chain().focus().unsetLink().run();
          return;
        }

        editor
          .chain()
          .focus()
          .setLink({
            href: url,
            class:
              'text-blue-500 hover:text-blue-700 underline dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer',
          })
          .run();
      }
    } else {
      editor.chain().focus().toggleMark(type).run();
    }
  }, [editor, type]);

  return { toggleFormat };
};
