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
        className="text-gray-80 w-full border-none p-0 text-sm hover:border-none hover:bg-transparent focus:border-none"
        size="s"
      >
        <SelectValue placeholder={t('role')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="tutor" className="text-gray-80 text-sm">
            {t('tutor')}
          </SelectItem>

          <SelectItem value="student" className="text-gray-80 text-sm">
            {t('student')}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
