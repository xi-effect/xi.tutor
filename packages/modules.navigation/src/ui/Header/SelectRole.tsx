import { useTranslation } from 'react-i18next';

import { type RoleT } from 'common.types';

import { useCurrentUser, useUpdateProfile } from 'common.services';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@xipkg/select';
import { useNavigate } from '@tanstack/react-router';

export const SelectRole = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('navigation');

  const { data: user } = useCurrentUser();

  const { updateProfile } = useUpdateProfile();

  const handleChange = (value: RoleT) => {
    // Отслеживаем смену роли через Umami
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track('role-change', {
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
    <Select
      value={
        user?.default_layout !== null && user?.default_layout !== undefined
          ? user?.default_layout
          : ''
      }
      onValueChange={handleChange}
    >
      <SelectTrigger
        className="text-gray-80 w-full border-none p-0 text-sm shadow-none ring-0 outline-none hover:border-none hover:bg-transparent hover:shadow-none focus:border-none focus:shadow-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none data-[state=open]:border-none data-[state=open]:shadow-none data-[state=open]:ring-0 data-[state=open]:outline-none"
        size="s"
        data-umami-event="header-role-selector-open"
      >
        <SelectValue placeholder={t('role')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem
            value="tutor"
            className="text-gray-80 text-sm"
            data-umami-event="role-select-tutor"
            data-umami-event-from={user?.default_layout || 'unknown'}
          >
            {t('tutor')}
          </SelectItem>

          <SelectItem
            value="student"
            className="text-gray-80 text-sm"
            data-umami-event="role-select-student"
            data-umami-event-from={user?.default_layout || 'unknown'}
          >
            {t('student')}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
