import { useYjsContext } from '../hooks/useYjsContext';
import { useCommentAuthor } from './hooks/useCommentAuthor';
import { useShallow } from 'zustand/shallow';
import { useCommentsUiStore } from './commentsUiStore';
import { useCloseOnOutsideClick } from './hooks/useCloseOnOutsideClick';
import { useYMapVersion } from './hooks/useYMapVersion';
import { CommentComposer } from './ui/CommentComposer';
import { CommentPin } from './ui/CommentPin';
import {
  createCommentThreadAt,
  getAllCommentThreads,
  getThreadMarkRange,
  cancelDraftComment,
} from './commentQueries';
import { useEditorLayoutVersion } from '../hooks';
import { useEffect, useState } from 'react';
import { EditorCommentThread } from './commentRecords';
import type { Editor } from '@tiptap/core';

const PIN_SHIFT_STEP = 17;
const PINS_CLUSTER_PX = 12;

type Pin = { thread: EditorCommentThread; top: number };
type PinGroup = {
  avgTop: number; // Средний top для всей группы (чтобы они стояли ровно в ряд)
  items: Pin[];
};

/** Группирует пины по Y-координате: близкие по вертикали пины встают в один ряд. */
function groupPinsByRow(pins: Pin[]): PinGroup[] {
  return pins.reduce<PinGroup[]>((groups, pin) => {
    const group = groups.find((g) => Math.abs(g.avgTop - pin.top) <= PINS_CLUSTER_PX);
    if (!group) {
      groups.push({ avgTop: pin.top, items: [pin] });
      return groups;
    }
    group.items.push(pin);
    group.avgTop = group.items.reduce((sum, item) => sum + item.top, 0) / group.items.length;
    return groups;
  }, []);
}

/** Y-координата середины диапазона относительно контейнера пинов. */
function selectionMidY(editor: Editor, container: HTMLElement, from: number, to: number): number {
  const start = editor.view.coordsAtPos(from, 1);
  const end = editor.view.coordsAtPos(to, -1);
  const mid = (start.top + end.bottom) / 2;

  const containerRect = container.getBoundingClientRect();
  return mid - containerRect.top + container.scrollTop;
}

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
  const cancelDraft = () => {
    if (draftRange && editor) cancelDraftComment(editor, draftRange.threadId);
    setDraftRange(null);
  };

  // Ре-рендер при любых изменениях тредов/сообщений (свои и чужие правки через Yjs).
  useYMapVersion(commentThreadsMap);
  useYMapVersion(commentMessagesMap);

  useCloseOnOutsideClick(!!openThreadId, () => openThread(null));
  useCloseOnOutsideClick(!!draftRange, cancelDraft);

  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!editor) return;

    const find = () => {
      if (editor.isDestroyed) return false;
      const el = editor.view.dom.closest('.xi-editor') as HTMLElement | null;
      if (!el) return false;
      setContainer(el);
      return true;
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
      if (!editor.state.selection.empty) return;

      const hit = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
      if (!hit) return;

      const mark = editor.state.doc
        .resolve(hit.pos)
        .marks()
        .find((m) => m.type.name === 'comment');
      if (!mark) return;
      if (!commentThreadsMap.has(mark.attrs.threadId)) return;

      setTimeout(() => openThread(mark.attrs.threadId), 0);
    };

    dom.addEventListener('click', onClick);
    return () => dom.removeEventListener('click', onClick);
  }, [editor, openThread, commentThreadsMap]);

  if (!container || !editor || !commentsVisible) return null;

  const threads = getAllCommentThreads(commentThreadsMap);
  const draftTop = draftRange
    ? selectionMidY(editor, container, draftRange.from, draftRange.to)
    : null;

  const handleSubmitDraft = (text: string) => {
    if (!draftRange || !author) return;
    const thread = createCommentThreadAt(
      editor,
      draftRange.threadId,
      commentThreadsMap,
      commentMessagesMap,
      draftRange,
      text,
      author,
    );
    setDraftRange(null);
    openThread(thread.id);
  };

  const pins = threads
    .map((thread) => {
      const range = getThreadMarkRange(editor, thread.id);
      if (!range) return null;
      return { thread, top: selectionMidY(editor, container, range.from, range.to) };
    })
    .filter((pin): pin is Pin => pin !== null);

  const groups = groupPinsByRow(pins);

  return (
    <>
      {groups.flatMap((group) =>
        group.items.map((item, index) => (
          <CommentPin
            key={item.thread.id}
            thread={item.thread}
            top={group.avgTop}
            right={index * PIN_SHIFT_STEP}
          />
        )),
      )}

      {draftTop !== null && author && draftRange && (
        <CommentComposer
          top={draftTop}
          authorId={author.authorId}
          authorName={author.authorName}
          onSubmit={handleSubmitDraft}
          onCancel={cancelDraft}
        />
      )}
    </>
  );
};
