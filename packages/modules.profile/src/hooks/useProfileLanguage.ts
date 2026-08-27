import { useCallback } from 'react';
import { useCurrentUser, useUpdateProfile } from 'common.services';
import {
  getAppLanguage,
  isAppLanguage,
  setAppLanguage,
  type AppLanguage,
} from 'common.ui/language';

export const useProfileLanguage = () => {
  const { data: user } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();

  const language: AppLanguage = isAppLanguage(user?.language) ? user.language : getAppLanguage();

  const setLanguage = useCallback(
    async (next: AppLanguage) => {
      if (language === next) return;

      const previous = getAppLanguage();
      await setAppLanguage(next);

      try {
        await updateProfile.mutateAsync({ language: next });
      } catch (error) {
        await setAppLanguage(previous);
        console.error('Ошибка при обновлении языка', error);
      }
    },
    [language, updateProfile],
  );

  return {
    language,
    setLanguage,
    isPending: updateProfile.isPending,
  };
};
