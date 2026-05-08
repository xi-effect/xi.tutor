import { type RoleT } from 'common.types';
import { useCurrentUser, useUpdateProfile } from 'common.services';
import { useNavigate } from '@tanstack/react-router';

import { RoleSwitcher } from './RoleSwitcher';

export const SelectRole = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();

  const currentRole = (user?.default_layout ?? 'student') as RoleT;

  const handleChange = (value: RoleT) => {
    // Отслеживаем смену роли через Umami
    const win = window as Window & {
      umami?: { track: (name: string, data?: Record<string, unknown>) => void };
    };
    if (typeof win !== 'undefined' && win.umami) {
      win.umami.track('role-change', {
        from: user?.default_layout || 'unknown',
        to: value,
        source: 'desktop-dropdown',
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
    <RoleSwitcher
      value={currentRole}
      onChange={handleChange}
      className="bg-gray-5 flex h-9 flex-row rounded-lg p-1"
    />
  );
};
