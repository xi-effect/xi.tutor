import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAddInvitation, useInvitationsList } from 'common.services';
import { InvitationDataT } from 'common.types';
import { type InviteAnalyticsSource } from 'common.utils';
import { selectCurrentInvite } from './selectCurrentInvite';

/** Максимум индивидуальных приглашений на репетитора (сохраняем текущее ограничение). */
export const MAX_INVITES = 10;

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
  isAtLimit: boolean;
  createInvite: (options?: CreateInviteOptions) => void;
  retryCreate: () => void;
};

/**
 * Оркестрирует выбор актуального приглашения и его автосоздание, если
 * неиспользованного приглашения нет.
 *
 * Защита от повторного создания:
 * - `autoCreateAttemptedRef` не сбрасывается за время жизни хука — гарантирует
 *   ровно одну попытку автосоздания, даже при двойном вызове эффекта в React
 *   Strict Mode или при ререндерах из-за смены других пропсов;
 * - при ошибке создания повторная попытка — только вручную через `retryCreate`,
 *   без автоматического retry (см. ТЗ, раздел 9 «Ошибка создания»);
 * - создание никогда не запускается из render-функции — только из mutation
 *   внутри `useEffect`/явных обработчиков.
 */
export const useCurrentInvite = (source: InviteAnalyticsSource): UseCurrentInviteResult => {
  const { data, isLoading, isError: isListError, refetch } = useInvitationsList();
  const {
    mutate: addInvitationMutate,
    isPending: isCreating,
    isError: isCreateError,
  } = useAddInvitation();

  const invites = useMemo(() => data ?? [], [data]);
  const currentInvite = useMemo(() => selectCurrentInvite(invites), [invites]);
  const isAtLimit = invites.length >= MAX_INVITES;

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

  useEffect(() => {
    if (isLoading || isListError) return;
    if (currentInvite) return;
    if (isAtLimit) return;
    if (autoCreateAttemptedRef.current) return;
    autoCreateAttemptedRef.current = true;
    createInvite();
  }, [isLoading, isListError, currentInvite, isAtLimit, createInvite]);

  const retryCreate = useCallback(() => createInvite(), [createInvite]);

  return {
    invites,
    currentInvite,
    isLoading,
    isListError,
    refetch,
    isCreating,
    isCreateError,
    isAtLimit,
    createInvite,
    retryCreate,
  };
};
