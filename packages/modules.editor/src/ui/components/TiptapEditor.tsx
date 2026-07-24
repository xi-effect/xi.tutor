import { EditorContent } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { EditorToolkit } from './EditorToolkit';
import { useYjsContext } from '../../hooks/useYjsContext';

import '../editor.css';

export const TiptapEditor = () => {
  const { t } = useTranslation('editor');
  const { editor, isReadOnly } = useYjsContext();

  if (!editor) {
    return (
      <div className="flex w-full justify-center py-8">
        <div className="bg-background-surface w-full max-w-5xl overflow-hidden rounded-lg">
          <div className="relative px-16 py-12">
            <div className="text-text-secondary text-center">{t('status.initializing')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="xi-editor relative p-4">
      <EditorContent editor={editor} className="max-w-none focus:outline-none" />
      <EditorToolkit editor={editor} isReadOnly={isReadOnly} />
    </div>
  );
};
