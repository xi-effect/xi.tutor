import { useTranslation } from 'react-i18next';

import { useCurrentUser } from 'common.services';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@xipkg/select';

type roleT = 'tutor' | 'student' | null;

export const SelectRole = () => {
  const { t } = useTranslation('navigation');
  const { data: user } = useCurrentUser();

  console.log(user);

  return (
    <Select>
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
