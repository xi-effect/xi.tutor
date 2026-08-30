import { useEffect, useRef } from 'react';
import { resolveRoleFromSearch } from './resolveRoleFromSearch';
import { useCurrentUser } from './useCurrentUser';
import { useUpdateProfile } from './useUpdateProfile';

/**
 * Если в URL есть `role`, переключает default_layout и затем вызывает onProcessed,
 * чтобы параметр можно было убрать из адреса.
 *
 * Срабатывает и при первом заходе по ссылке (когда пользователь ещё грузится),
 * и при клиентской навигации — например, клик по уведомлению.
 */
export const useSyncRoleFromSearch = (urlRole: unknown, onProcessed: () => void) => {
  const { data: user } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();
  const inFlightRoleRef = useRef<string | null>(null);
  const onProcessedRef = useRef(onProcessed);
  onProcessedRef.current = onProcessed;

  const mutateProfile = updateProfile.mutate;
  const hasUser = Boolean(user);
  const currentLayout = user?.default_layout;

  useEffect(() => {
    const action = resolveRoleFromSearch({
      urlRole,
      currentLayout,
      hasUser,
    });

    if (action.type === 'noop') {
      if (urlRole == null || urlRole === '') {
        inFlightRoleRef.current = null;
      }
      return;
    }

    if (action.type === 'clear') {
      inFlightRoleRef.current = null;
      onProcessedRef.current();
      return;
    }

    if (inFlightRoleRef.current === action.role) return;
    inFlightRoleRef.current = action.role;

    mutateProfile(
      { default_layout: action.role },
      {
        onError: () => {
          inFlightRoleRef.current = null;
        },
      },
    );
  }, [hasUser, currentLayout, urlRole, mutateProfile]);
};
