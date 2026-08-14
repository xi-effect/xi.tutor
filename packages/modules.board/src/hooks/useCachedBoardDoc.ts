import { useEffect, useState } from 'react';
import {
  getCachedBoardDocWithTimeout,
  makeBoardDocCacheKey,
  type CachedBoardDoc,
} from '../utils/boardDocCache';

export type CachedBoardDocState = {
  status: 'loading' | 'ready';
  doc: CachedBoardDoc | null;
};

export function useCachedBoardDoc(
  userId: string | undefined,
  boardId: string | undefined,
  enabled = true,
): CachedBoardDocState {
  const lookupKey = enabled && userId && boardId ? makeBoardDocCacheKey(userId, boardId) : null;
  const [resolved, setResolved] = useState<{ key: string | null; doc: CachedBoardDoc | null }>({
    key: null,
    doc: null,
  });

  useEffect(() => {
    if (!lookupKey || !userId || !boardId) {
      setResolved({ key: null, doc: null });
      return;
    }

    let cancelled = false;

    void getCachedBoardDocWithTimeout(userId, boardId).then((doc) => {
      if (!cancelled) setResolved({ key: lookupKey, doc });
    });

    return () => {
      cancelled = true;
    };
  }, [lookupKey, userId, boardId]);

  if (lookupKey === null) {
    return { status: 'ready', doc: null };
  }

  if (resolved.key !== lookupKey) {
    return { status: 'loading', doc: null };
  }

  return { status: 'ready', doc: resolved.doc };
}
