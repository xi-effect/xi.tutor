import { type RoleT } from 'common.types';
import { useCurrentUser, useUpdateProfile } from 'common.services';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { RoleSwitcher } from './RoleSwitcher';

export const ProfileRoleSwitcher = () => {
  const { t } = useTranslation('profile');
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();

  const currentRole = (user?.default_layout ?? 'student') as RoleT;

  const handleChange = (value: RoleT) => {
    const win = window as Window & {
      umami?: { track: (name: string, data?: Record<string, unknown>) => void };
    };
    if (typeof win !== 'undefined' && win.umami) {
      win.umami.track('role-change', {
        from: user?.default_layout || 'unknown',
        to: value,
        source: 'profile-settings',
      });
    }

    updateProfile.mutate(
      { default_layout: value },
      {
        onSuccess: () => {
          navigate({ to: '/', search: {} });
        },
      },
    );
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-text-secondary px-1 text-xs leading-4 font-medium">{t('role.label')}</p>
      <RoleSwitcher value={currentRole} onChange={handleChange} />
    </div>
  );
};
