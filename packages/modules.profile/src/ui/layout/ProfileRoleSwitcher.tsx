import { type RoleT } from 'common.types';
import { useCurrentUser, useUpdateProfile } from 'common.services';
import { RoleSwitcher } from './RoleSwitcher';

export const ProfileRoleSwitcher = () => {
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

    updateProfile.mutate({ default_layout: value });
  };

  return <RoleSwitcher value={currentRole} onChange={handleChange} />;
};
