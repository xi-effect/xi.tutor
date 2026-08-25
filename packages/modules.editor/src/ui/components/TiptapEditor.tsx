import { EditorContent } from '@tiptap/react';
import { EditorToolkit } from './EditorToolkit';
import { EditorLoading, EditorSyncError } from './EditorLoading';
import { useYjsContext } from '../../hooks/useYjsContext';

import '../editor.css';

export const TiptapEditor = () => {
  const { editor, isReadOnly, isSynced, hasSyncError } = useYjsContext();

  if (hasSyncError) {
    return <EditorSyncError />;
  }

  if (!isSynced || !editor) {
    return <EditorLoading />;
  }

  return (
    <div className="xi-editor relative w-full min-w-0 p-4">
      <EditorContent editor={editor} className="max-w-none focus:outline-none" />
      <EditorToolkit editor={editor} isReadOnly={isReadOnly} />
    </div>
  );
};
