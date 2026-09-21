import { useYjsContext } from '../hooks/useYjsContext';
import { useCommentAuthor } from './useCommentAuthor';
import { useShallow } from 'zustand/shallow';
import { useCommentsUiStore } from './commentsUiStore';
import { useCloseOnOutsideClick } from './useCloseOnOutsideClick';
import { useYMapVersion } from './useYMapVersion';
import { CommentComposer } from './CommentComposer';
import { CommentPin } from './CommentPin';
import { createCommentThreadAt, getAllCommentThreads, getThreadMarkRange } from './commentQueries';
import { useEditorLayoutVersion } from '../hooks';
import { useEffect, useState } from 'react';

export const CommentsOverlay = () => {
  const { editor, commentThreadsMap, commentMessagesMap } = useYjsContext();
  const author = useCommentAuthor();
  const { draftRange, openThreadId, commentsVisible } = useCommentsUiStore(
    useShallow((s) => ({
      draftRange: s.draftRange,
      openThreadId: s.openThreadId,
      commentsVisible: s.commentsVisible,
    })),
  );
  const { setDraftRange, openThread } = useCommentsUiStore.getState();

  // Ре-рендер при любых изменениях тредов/сообщений (свои и чужие правки через Yjs).
  useYMapVersion(commentThreadsMap);
  useYMapVersion(commentMessagesMap);

  useCloseOnOutsideClick(!!openThreadId, () => openThread(null));
  useCloseOnOutsideClick(!!draftRange, () => setDraftRange(null));

  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!editor) return;

    const find = () => {
      if (editor.isDestroyed) return false;
      const el = editor.view.dom.closest('.xi-editor') as HTMLElement | null;
      if (el) {
        setContainer(el);
        return true;
      }
      return false;
    };

    if (find()) return;

    editor.on('create', find);
    return () => {
      editor.off('create', find);
    };
  }, [editor]);

  useEditorLayoutVersion(editor, container);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const dom = editor.view.dom;

    const onClick = (e: MouseEvent) => {
      // выделение мышью тоже даёт click, его пропускаем
      if (!editor.state.selection.empty) return;

      const hit = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
      if (!hit) return;

      const mark = editor.state.doc
        .resolve(hit.pos)
        .marks()
        .find((m) => m.type.name === 'comment');
      if (!mark) return;

      // setTimeout: иначе useCloseOnOutsideClick закроет тред тем же кликом
      setTimeout(() => openThread(mark.attrs.threadId), 0);
    };

    dom.addEventListener('click', onClick);
    return () => dom.removeEventListener('click', onClick);
  }, [editor, openThread]);

  if (!container || !editor || !commentsVisible) return null;

  /** Y-координата середины диапазона относительно контейнера пинов. */
  const selectionMidY = (from: number, to: number): number => {
    const start = editor.view.coordsAtPos(from, 1);
    const end = editor.view.coordsAtPos(to, -1);
    const mid = (start.top + end.bottom) / 2;

    const containerRect = container.getBoundingClientRect();
    return mid - containerRect.top + container.scrollTop;
  };

  const threads = getAllCommentThreads(commentThreadsMap);

  const draftMidY = draftRange ? selectionMidY(draftRange.from, draftRange.to) : null;

  const handleSubmitDraft = (text: string) => {
    if (!draftRange || !author) return;
    const thread = createCommentThreadAt(
      editor,
      commentThreadsMap,
      commentMessagesMap,
      draftRange,
      text,
      author,
    );
    setDraftRange(null);
    openThread(thread.id);
  };

  return (
    <>
      {threads.map((thread) => {
        const range = getThreadMarkRange(editor, thread.id);
        if (!range) return null;
        return (
          <CommentPin key={thread.id} thread={thread} top={selectionMidY(range.from, range.to)} />
        );
      })}

      {draftMidY !== null && author && (
        <CommentComposer
          top={draftMidY}
          authorId={author.authorId}
          authorName={author.authorName}
          onSubmit={handleSubmitDraft}
          onCancel={() => setDraftRange(null)}
        />
      )}
    </>
  );
};
