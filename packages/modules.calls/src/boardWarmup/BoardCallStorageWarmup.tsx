import { useQueryClient } from '@tanstack/react-query';
import { useCallStore } from '@xipkg/calls-store';
import { useCurrentUser } from 'common.services';
import { prefetchBoardStorageItem } from 'modules.board/warmup';
import { useEffect } from 'react';

/** Prefetch storage-item при смене activeBoardId в звонке (до редиректа на доску). */
export const BoardCallStorageWarmup = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const activeBoardId = useCallStore((state) => state.activeBoardId);
  const activeClassroom = useCallStore((state) => state.activeClassroom);

  const isTutor = user?.default_layout === 'tutor';

  useEffect(() => {
    if (!activeBoardId || !activeClassroom) return;

    void prefetchBoardStorageItem(queryClient, activeClassroom, activeBoardId, isTutor).catch(
      () => undefined,
    );
  }, [activeBoardId, activeClassroom, isTutor, queryClient]);

  return null;
};
