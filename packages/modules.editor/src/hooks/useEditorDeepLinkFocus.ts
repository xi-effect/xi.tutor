import { useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import { useLocation, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import type * as Y from 'yjs';
import { useCommentsUiStore } from '../comments/commentsUiStore';
import type { EditorCommentThread } from '../comments/commentRecords';
import {
  type EditorDeepLinkSearch,
  buildEditorDeepLink,
  copyEditorDeepLink,
  focusEditorComment,
} from '../utils/editorDeepLink';
import i18n from 'i18next';

type UseEditorDeepLinkFocusArgs = {
  editor: Editor | null;
  commentThreadsMap: Y.Map<EditorCommentThread>;
  /** Дождаться синхронизации Yjs перед попыткой найти комментарий в документе. */
  ready?: boolean;
};

/** При открытии редактора по ссылке с `?comment=` открывает и скроллит к треду (как в Miro/Figma). */
export function useEditorDeepLinkFocus({
  editor,
  commentThreadsMap,
  ready = true,
}: UseEditorDeepLinkFocusArgs) {
  const search = useSearch({ strict: false }) as EditorDeepLinkSearch;
  const appliedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!editor || !ready) return;

    const commentId = search.comment?.trim();
    if (!commentId) {
      appliedKeyRef.current = null;
      return;
    }

    if (appliedKeyRef.current === commentId) return;

    const openThread = useCommentsUiStore.getState().openThread;
    const setCommentsVisible = useCommentsUiStore.getState().setCommentsVisible;

    const handled = focusEditorComment(editor, commentThreadsMap, commentId, {
      openThread,
      setCommentsVisible,
    });
    if (!handled) {
      toast.error(i18n.t('comments.notFound', { ns: 'editor' }));
    } else {
      appliedKeyRef.current = commentId;
    }
  }, [editor, ready, commentThreadsMap, search.comment]);
}

type UseCopyEditorDeepLinkArgs = {
  commentId?: string;
};

/** Копирует ссылку на текущий документ с фокусом на комментарий. */
export function useCopyEditorDeepLink({ commentId }: UseCopyEditorDeepLinkArgs = {}) {
  const { pathname } = useLocation();
  const search = useSearch({ strict: false }) as EditorDeepLinkSearch;

  return async () => {
    const url = buildEditorDeepLink({
      pathname,
      currentSearch: search.call ? { call: search.call } : undefined,
      commentId,
    });
    await copyEditorDeepLink(url);
  };
}
