import { EditorContent } from '@tiptap/react';
import { Chat } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { EditorToolkit } from './EditorToolkit';
import { EditorLoading, EditorSyncError } from './EditorLoading';
import { useYjsContext } from '../../hooks/useYjsContext';

import '../editor.css';
import { CommentsOverlay, useCommentsUiStore } from '../../comments';
import { useEditorDeepLinkFocus } from '../../hooks/useEditorDeepLinkFocus';
import { Button } from '@xipkg/button';

export const TiptapEditor = () => {
  const { t } = useTranslation('editor');
  const { editor, isReadOnly, isSynced, hasSyncError, commentThreadsMap } = useYjsContext();
  const commentsVisible = useCommentsUiStore((s) => s.commentsVisible);
  const setCommentsVisible = useCommentsUiStore((s) => s.setCommentsVisible);
  useEditorDeepLinkFocus({ editor, commentThreadsMap, ready: isSynced });

  if (hasSyncError) {
    return <EditorSyncError />;
  }

  if (!isSynced || !editor) {
    return <EditorLoading />;
  }

  return (
    <div className="xi-editor relative w-full min-w-0 p-4 pr-15 md:pr-40">
      {/* Тоггл видимости комментариев — правый верхний угол заметки */}
      <Button
        variant="none"
        data-comment-ui
        className={cn(
          'absolute top-1 right-6 z-30 flex size-7 items-center justify-center rounded-lg p-0 transition-colors md:right-30',
        )}
        title={commentsVisible ? t('comments.hide') : t('comments.show')}
        onClick={() => setCommentsVisible(!commentsVisible)}
      >
        <Chat className="size-4" />
      </Button>
      <EditorContent editor={editor} className="max-w-none focus:outline-none" />
      <EditorToolkit editor={editor} isReadOnly={isReadOnly} />
      <CommentsOverlay />
    </div>
  );
};
