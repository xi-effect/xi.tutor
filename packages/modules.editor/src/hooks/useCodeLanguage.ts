/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { Transforms, Element } from 'slate';
import { codeEditorLanguages } from '../const/codeEditorLanguages';

export const useCodeLanguage = () => {
  const editor = useSlate();

  const getLanguage = useCallback((node: any) => {
    if (!node || node.type !== 'code') {
      return null;
    }

    const lang = node.language?.toLowerCase();

    if (!lang || lang === 'plaintext' || lang === 'plain') {
      return 'typescript';
    }

    if (codeEditorLanguages.includes(lang)) {
      return lang;
    }

    return 'typescript';
  }, []);

  const setLanguage = useCallback(
    (element: Element, language: string) => {
      if (element && element.type === 'code') {
        try {
          const path = ReactEditor.findPath(editor, element);
          Transforms.setNodes(
            editor,
            { language },
            {
              at: path,
            },
          );
        } catch (error) {
          console.error('Error setting code language:', error);
        }
      }
    },
    [editor],
  );

  return { getLanguage, setLanguage };
};
