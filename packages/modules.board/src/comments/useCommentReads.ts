import { useCallback, useEffect, useState } from 'react';
import { useCurrentUser } from 'common.services';
import type * as Y from 'yjs';
import { useYjsContext } from '../providers/YjsProvider';
import type { DrCommentMessage } from './commentRecords';

function useCurrentUserId(): string | undefined {
  const { data: currentUser } = useCurrentUser();
  return currentUser?.id != null ? String(currentUser.id) : undefined;
}

/** Реактивная подписка на изменение отметок прочтения конкретного треда (свои и чужие). */
function useCommentReadsVersion(threadId: string) {
  const { commentReadsMap } = useYjsContext();
  const [, bump] = useState(0);

  useEffect(() => {
    const onChange = (event: Y.YMapEvent<number>) => {
      for (const key of event.keysChanged) {
        if (key.startsWith(`${threadId}:`)) {
          bump((v) => v + 1);
          return;
        }
      }
    };
    commentReadsMap.observe(onChange);
    return () => commentReadsMap.unobserve(onChange);
  }, [commentReadsMap, threadId]);
}

function computeIsUnread(
  commentReadsMap: Y.Map<number>,
  userId: string | undefined,
  threadId: string,
  messages: DrCommentMessage[],
): boolean {
  if (!userId) return false;

  const lastOthersMessageAt = messages.reduce(
    (max, m) => (m.authorId !== userId && m.createdAt > max ? m.createdAt : max),
    0,
  );
  if (lastOthersMessageAt === 0) return false;

  const readAt = commentReadsMap.get(`${threadId}:${userId}`) ?? 0;
  return lastOthersMessageAt > readAt;
}

/** Тред непрочитан, если есть чужие сообщения новее последней отметки прочтения текущего пользователя. */
export function useThreadUnread(threadId: string, messages: DrCommentMessage[]): boolean {
  const { commentReadsMap } = useYjsContext();
  const userId = useCurrentUserId();
  useCommentReadsVersion(threadId);

  return computeIsUnread(commentReadsMap, userId, threadId, messages);
}

/**
 * Реактивная подписка на любые изменения отметок прочтения (для списков, где нельзя
 * вызывать `useThreadUnread` в цикле). Возвращает функцию проверки конкретного треда.
 */
export function useCommentUnreadChecker(): (
  threadId: string,
  messages: DrCommentMessage[],
) => boolean {
  const { commentReadsMap } = useYjsContext();
  const userId = useCurrentUserId();
  const [, bump] = useState(0);

  useEffect(() => {
    const onChange = () => bump((v) => v + 1);
    commentReadsMap.observe(onChange);
    return () => commentReadsMap.unobserve(onChange);
  }, [commentReadsMap]);

  return useCallback(
    (threadId: string, messages: DrCommentMessage[]) =>
      computeIsUnread(commentReadsMap, userId, threadId, messages),
    [commentReadsMap, userId],
  );
}

export function useMarkCommentThreadRead(): (threadId: string) => void {
  const { commentReadsMap } = useYjsContext();
  const userId = useCurrentUserId();

  return useCallback(
    (threadId: string) => {
      if (!userId) return;
      commentReadsMap.set(`${threadId}:${userId}`, Date.now());
    },
    [commentReadsMap, userId],
  );
}
