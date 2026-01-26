import { useTranslation } from 'react-i18next';
import { Radio, RadioItem } from '@xipkg/radio';

import { type RoleT } from 'common.types';
import { useCurrentUser, useUpdateProfile } from 'common.services';
import { useNavigate } from '@tanstack/react-router';

export const DrawerRoleSelector = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('navigation');

  const { data: user } = useCurrentUser();
  const { updateProfile } = useUpdateProfile();

  const handleRoleChange = (value: RoleT) => {
    // Отслеживаем смену роли через Umami
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track('role-change', {
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
      <div className="text-base font-medium text-gray-50">{t('role')}</div>
      <Radio
        value={user?.default_layout || 'student'}
        onValueChange={(value) => handleRoleChange(value as RoleT)}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-2">
          <RadioItem
            value="tutor"
            id="tutor-role"
            className="data-[state=checked]:bg-brand-100 data-[state=checked]:border-brand-100 text-gray-0 dark:bg-gray-10 border-gray-30 h-6 w-6 [&>span>svg]:h-3 [&>span>svg]:w-3"
            data-umami-event="role-select-tutor"
            data-umami-event-from={user?.default_layout || 'unknown'}
            data-umami-event-device="mobile"
          />
          <label
            htmlFor="tutor-role"
            className="cursor-pointer text-base text-gray-100"
            data-umami-event="role-select-tutor"
            data-umami-event-from={user?.default_layout || 'unknown'}
            data-umami-event-device="mobile"
          >
            {t('tutor')}
          </label>
        </div>
        <div className="flex items-center gap-2">
          <RadioItem
            value="student"
            id="student-role"
            className="data-[state=checked]:bg-brand-100 data-[state=checked]:border-brand-100 text-gray-0 dark:bg-gray-10 border-gray-30 h-6 w-6 [&>span>svg]:h-3 [&>span>svg]:w-3"
            data-umami-event="role-select-student"
            data-umami-event-from={user?.default_layout || 'unknown'}
            data-umami-event-device="mobile"
          />
          <label
            htmlFor="student-role"
            className="cursor-pointer text-base text-gray-100"
            data-umami-event="role-select-student"
            data-umami-event-from={user?.default_layout || 'unknown'}
            data-umami-event-device="mobile"
          >
            {t('student')}
          </label>
        </div>
      </Radio>
    </div>
  );
};
