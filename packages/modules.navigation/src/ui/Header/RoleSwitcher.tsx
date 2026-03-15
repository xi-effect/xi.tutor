import { useTranslation } from 'react-i18next';
import { SwitcherAnimate } from '@xipkg/switcher-animate';

import { type RoleT } from 'common.types';

interface RoleSwitcherProps {
  value: RoleT;
  onChange: (value: RoleT) => void;
  className?: string;
}

export const RoleSwitcher = ({ value, onChange, className }: RoleSwitcherProps) => {
  const { t } = useTranslation('navigation');

  const tabs = [
    { id: 'tutor', label: t('tutor') },
    { id: 'student', label: t('student') },
  ];

  return (
    <SwitcherAnimate
      tabs={tabs}
      activeTab={value}
      onChange={(v) => onChange(v as RoleT)}
      className={className ?? 'bg-gray-5 flex h-9 w-[228px] flex-row rounded-lg p-1'}
      tabClassName="w-[114px] text-m-base font-medium text-gray-100 data-[active=true]:text-gray-0"
      indicatorClassName="w-[114px] rounded-md bg-brand-100"
    />
  );
};
