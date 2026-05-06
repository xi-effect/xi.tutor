import { useTranslation } from 'react-i18next';

import { type RoleT } from 'common.types';
import { useCurrentUser, useUpdateProfile } from 'common.services';
import { useNavigate } from '@tanstack/react-router';

import { RoleSwitcher } from './RoleSwitcher';

type DrawerRoleSelectorProps = {
  /** Без подписи «Роль» — для нижнего листа профиля на мобилке */
  compact?: boolean;
};

export const DrawerRoleSelector = ({ compact = false }: DrawerRoleSelectorProps) => {
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
    <div className={compact ? 'w-full' : 'w-full p-2'}>
      {!compact && <div className="mb-2 text-base font-medium text-gray-50">{t('role')}</div>}
      <RoleSwitcher
        value={currentRole}
        onChange={handleRoleChange}
        className={
          compact
            ? 'bg-gray-5 mx-auto flex h-[48px] w-full shrink-0 flex-row rounded-lg p-1'
            : undefined
        }
        tabClassName={compact ? 'h-[42px] w-full' : undefined}
        indicatorClassName={compact ? 'h-[42px] w-full rounded-[10px]' : undefined}
      />
    </div>
  );
};
