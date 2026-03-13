import { useTranslation } from 'react-i18next';

import { type RoleT } from 'common.types';
import { useCurrentUser, useUpdateProfile } from 'common.services';
import { useNavigate } from '@tanstack/react-router';

import { RoleSwitcher } from './RoleSwitcher';

export const DrawerRoleSelector = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('navigation');

  const { data: user } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();

  const currentRole = (user?.default_layout || 'student') as RoleT;

  const handleRoleChange = (value: RoleT) => {
    // Отслеживаем смену роли через Umami
    const win = window as Window & {
      umami?: { track: (name: string, data?: Record<string, unknown>) => void };
    };
    if (typeof win !== 'undefined' && win.umami) {
      win.umami.track('role-change', {
        from: user?.default_layout || 'unknown',
        to: value,
        source: 'mobile-drawer',
      });
    }

    updateProfile.mutate(
      { default_layout: value },
      {
        onSuccess: () => {
          navigate({ to: '/' });
        },
      },
    );
  };

  return (
    <div className="w-full p-2">
      <div className="mb-2 text-base font-medium text-gray-50">{t('role')}</div>
      <RoleSwitcher value={currentRole} onChange={handleRoleChange} />
    </div>
  );
};
