import { useEffect, useRef } from 'react';
import type { Editor } from '@ibodr/draw';
import { useLocation, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useCommentsUiStore } from '../comments/commentsUiStore';
import {
  type BoardDeepLinkSearch,
  buildBoardDeepLink,
  copyBoardDeepLink,
  focusBoardComment,
  focusBoardShapes,
  parseShapeIdsFromSearch,
} from '../utils/boardDeepLink';

type UseBoardDeepLinkFocusArgs = {
  editor: Editor | null;
  /** Дождаться синхронизации Yjs перед попыткой найти элемент на доске. */
  ready?: boolean;
};

/**
 * При открытии доски по ссылке с `?shape=` или `?comment=` фокусирует камеру
 * и выделяет элемент / открывает комментарий (как в Miro / Figma).
 */
export function useBoardDeepLinkFocus({ editor, ready = true }: UseBoardDeepLinkFocusArgs) {
  const search = useSearch({ strict: false }) as BoardDeepLinkSearch;
  const appliedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!editor || !ready) return;

    const shapeIds = parseShapeIdsFromSearch(search.shape);
    const commentId = search.comment?.trim();
    if (!shapeIds.length && !commentId) {
      appliedKeyRef.current = null;
      return;
    }

    const key = `${search.shape ?? ''}|${search.comment ?? ''}`;
    if (appliedKeyRef.current === key) return;

    const openThread = useCommentsUiStore.getState().openThread;
    const setCommentsVisible = useCommentsUiStore.getState().setCommentsVisible;

    let handled = false;

    if (commentId) {
      handled = focusBoardComment(editor, commentId, { openThread, setCommentsVisible });
      if (!handled) toast.error('Комментарий не найден');
    } else if (shapeIds.length) {
      handled = focusBoardShapes(editor, shapeIds);
      if (!handled) toast.error('Элемент не найден');
    }

    if (handled) appliedKeyRef.current = key;
  }, [editor, ready, search.shape, search.comment]);
}

type UseCopyBoardDeepLinkArgs = {
  shapeIds?: string[];
  commentId?: string;
};

/** Копирует ссылку на текущую доску с фокусом на элемент или комментарий. */
export function useCopyBoardDeepLink({ shapeIds, commentId }: UseCopyBoardDeepLinkArgs = {}) {
  const { pathname } = useLocation();
  const search = useSearch({ strict: false }) as BoardDeepLinkSearch;

  return async () => {
    const url = buildBoardDeepLink({
      pathname,
      currentSearch: search.call ? { call: search.call } : undefined,
      shapeIds,
      commentId,
    });
    await copyBoardDeepLink(url);
  };
}
