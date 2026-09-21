import { EditorContent } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import { EditorToolkit } from './EditorToolkit';
import { EditorLoading, EditorSyncError } from './EditorLoading';
import { useYjsContext } from '../../hooks/useYjsContext';
import { CommentToggleButton } from '../../comments';

import '../editor.css';
import { CommentsOverlay } from '../../comments';
import { useEditorDeepLinkFocus } from '../../hooks/useEditorDeepLinkFocus';

export const TiptapEditor = () => {
  const { t } = useTranslation('editor');
  const { editor, isReadOnly, isSynced, hasSyncError, commentThreadsMap } = useYjsContext();

  useEditorDeepLinkFocus({ editor, commentThreadsMap, ready: isSynced });

  if (hasSyncError) {
    return <EditorSyncError />;
  }

  if (!isSynced || !editor) {
    return <EditorLoading />;
  }

  return (
    <div className="xi-editor relative w-full min-w-0 p-4 pr-15 md:pr-40">
      {/* Тоггл комментариев в правом верхнем углу заметки */}
      <CommentToggleButton t={t} />
      <EditorContent editor={editor} className="max-w-none focus:outline-none" />
      <EditorToolkit editor={editor} isReadOnly={isReadOnly} />
      <CommentsOverlay />
    </div>
  );
};
