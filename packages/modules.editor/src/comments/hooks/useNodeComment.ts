import { useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import { useCommentAuthor } from './useCommentAuthor';
import { useCommentsUiStore } from '../commentsUiStore';
import { createEditorCommentThreadId } from '../commentRecords';
import { applyDraftCommentMark } from '../commentQueries';

/** Начать комментарий к блочной ноде (или открыть существующий тред). */
export function useNodeComment(editor: Editor | null, getPos: () => number | undefined) {
  const author = useCommentAuthor();

  const startComment = useCallback(() => {
    if (!editor || editor.isDestroyed || !author) return;
    const pos = getPos();
    if (pos === undefined) return;
    const node = editor.state.doc.nodeAt(pos);
    if (!node) return;

    const existing = node.attrs.commentThreadId as string | null;
    if (existing) {
      useCommentsUiStore.getState().openThread(existing);
      return;
    }

    const threadId = createEditorCommentThreadId();
    const range = { from: pos, to: pos + node.nodeSize };
    applyDraftCommentMark(editor, range, threadId, author.authorId);
    useCommentsUiStore.getState().setDraftRange({ threadId, ...range });
  }, [editor, author, getPos]);

  return { startComment };
}
