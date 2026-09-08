import { Editor } from '@tiptap/core';
import { useCallback } from 'react';
import { TextFormatTypeT } from '../types';
import { normalizeEditorLink } from '../utils/isUrl';

export const useTextFormat = (editor: Editor | null, type: TextFormatTypeT) => {
  const toggleFormat = useCallback(() => {
    if (!editor || !editor.isEditable) return;

    if (type === 'link') {
      if (editor.isActive('link')) {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
      } else {
        const previousUrl = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('URL', previousUrl || 'https://');

        if (url === null) return;
        if (url.trim() === '') {
          editor.chain().focus().extendMarkRange('link').unsetLink().run();
          return;
        }

        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({
            href: normalizeEditorLink(url),
            target: '_blank',
          })
          .run();
      }
    } else {
      editor.chain().focus().toggleMark(type).run();
    }
  }, [editor, type]);

  return { toggleFormat };
};
