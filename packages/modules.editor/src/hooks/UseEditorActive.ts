import { useState, useEffect } from 'react';
import { Editor } from '@tiptap/core';

export const useEditorActive = (editor: Editor | null) => {
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    strike: false,
    underline: false,
    link: false,
  });

  useEffect(() => {
    if (!editor) return;

    const updateActiveStates = () => {
      setActiveStates({
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        strike: editor.isActive('strike'),
        underline: editor.isActive('underline'),
        link: editor.isActive('link'),
      });
    };

    editor.on('selectionUpdate', updateActiveStates);
    editor.on('transaction', updateActiveStates);
    updateActiveStates();

    return () => {
      editor.off('selectionUpdate', updateActiveStates);
      editor.off('transaction', updateActiveStates);
    };
  }, [editor]);

  return activeStates;
};
