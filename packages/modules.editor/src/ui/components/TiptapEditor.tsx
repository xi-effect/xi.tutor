import { EditorContent } from '@tiptap/react';
import { EditorToolkit } from './EditorToolkit';
import { EditorLoading, EditorSyncError } from './EditorLoading';
import { useYjsContext } from '../../hooks/useYjsContext';

import '../editor.css';
import { CommentsOverlay } from '../../comments';
import { useEditorDeepLinkFocus } from '../../hooks/useEditorDeepLinkFocus';

export const TiptapEditor = () => {
  const { editor, isReadOnly, isSynced, hasSyncError, commentThreadsMap } = useYjsContext();
  useEditorDeepLinkFocus({ editor, commentThreadsMap, ready: isSynced });

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
      <CommentsOverlay />
    </div>
  );
};
