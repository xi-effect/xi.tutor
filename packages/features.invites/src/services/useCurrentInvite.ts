import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAddInvitation, useDeleteInvitation, useInvitationsList } from 'common.services';
import { InvitationDataT } from 'common.types';
import { mapInviteError, type InviteAnalyticsSource } from 'common.utils';
import { selectCurrentInvite } from './selectCurrentInvite';

type CreateInviteOptions = {
  onSuccess?: (invite: InvitationDataT) => void;
};

type UseCurrentInviteResult = {
  invites: InvitationDataT[];
  currentInvite: InvitationDataT | null;
  isLoading: boolean;
  isListError: boolean;
  refetch: () => void;
  isCreating: boolean;
  isCreateError: boolean;
  isCreateLimitReached: boolean;
  isRefreshing: boolean;
  createInvite: (options?: CreateInviteOptions) => void;
  retryCreate: () => void;
  refreshCurrentInvite: (options?: CreateInviteOptions) => void;
};

/**
 * Оркестрирует выбор актуального приглашения (последнее созданное) и
 * автосоздание, только если приглашений ещё нет.
 *
 * Защита от повторного создания:
 * - `autoCreateAttemptedRef` не сбрасывается за время жизни хука — гарантирует
 *   ровно одну попытку автосоздания, даже при двойном вызове эффекта в React
 *   Strict Mode или при ререндерах из-за смены других пропсов;
 * - при ошибке создания повторная попытка — только вручную через `retryCreate`,
 *   без автоматического retry (см. ТЗ, раздел 9 «Ошибка создания»);
 * - создание никогда не запускается из render-функции — только из mutation
 *   внутри `useEffect`/явных обработчиков;
 * - перед обновлением ссылки текущая удаляется, `autoCreateAttemptedRef`
 *   заранее ставится в true, чтобы эффект не создал вторую ссылку, пока список
 *   на мгновение пуст.
 */
export const useCurrentInvite = (source: InviteAnalyticsSource): UseCurrentInviteResult => {
  const { data, isLoading, isError: isListError, refetch } = useInvitationsList();
  const {
    mutate: addInvitationMutate,
    isPending: isCreating,
    isError: isCreateError,
    error: createError,
  } = useAddInvitation();
  const { mutate: deleteInvitationMutate, isPending: isDeleting } = useDeleteInvitation();

  const invites = useMemo(() => data ?? [], [data]);
  const currentInvite = useMemo(() => selectCurrentInvite(invites), [invites]);

  const createInvite = useCallback(
    (options?: CreateInviteOptions) => {
      addInvitationMutate(
        { source },
        {
          onSuccess: (response) => {
            const created =
              response && typeof response === 'object' && 'data' in response
                ? (response.data as InvitationDataT | undefined)
                : undefined;
            if (created) options?.onSuccess?.(created);
          },
        },
      );
    },
    [addInvitationMutate, source],
  );

  const autoCreateAttemptedRef = useRef(false);
  const limitRefetchAttemptedRef = useRef(false);
  const isCreateLimitReached = isCreateError && mapInviteError(createError) === 'limit_reached';

  useEffect(() => {
    if (isLoading || isListError) return;
    if (currentInvite) return;
    if (autoCreateAttemptedRef.current) return;
    autoCreateAttemptedRef.current = true;
    createInvite();
  }, [isLoading, isListError, currentInvite, createInvite]);

  useEffect(() => {
    if (!isCreateLimitReached || currentInvite || limitRefetchAttemptedRef.current) return;
    limitRefetchAttemptedRef.current = true;
    refetch();
  }, [isCreateLimitReached, currentInvite, refetch]);

  const retryCreate = useCallback(() => {
    if (isCreateLimitReached) {
      refetch();
      return;
    }
    createInvite();
  }, [isCreateLimitReached, refetch, createInvite]);

  const refreshCurrentInvite = useCallback(
    (options?: CreateInviteOptions) => {
      if (!currentInvite) return;
      autoCreateAttemptedRef.current = true;
      deleteInvitationMutate(currentInvite.id, {
        onSuccess: () => {
          createInvite(options);
        },
        onError: () => {
          autoCreateAttemptedRef.current = false;
        },
      });
    },
    [currentInvite, deleteInvitationMutate, createInvite],
  );

  return {
    invites,
    currentInvite,
    isLoading,
    isListError,
    refetch,
    isCreating,
    isCreateError,
    isCreateLimitReached,
    isRefreshing: isDeleting || isCreating,
    createInvite,
    retryCreate,
    refreshCurrentInvite,
  };
};
