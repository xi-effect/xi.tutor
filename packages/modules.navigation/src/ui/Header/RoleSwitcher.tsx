import { useTranslation } from 'react-i18next';
import { SwitcherAnimate } from '@xipkg/switcher-animate';

import { type RoleT } from 'common.types';
import { cn } from '@xipkg/utils';

interface RoleSwitcherProps {
  value: RoleT;
  onChange: (value: RoleT) => void;
  className?: string;
  tabClassName?: string;
  indicatorClassName?: string;
}

export const RoleSwitcher = ({
  value,
  onChange,
  className,
  tabClassName,
  indicatorClassName,
}: RoleSwitcherProps) => {
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
      className={cn('bg-gray-5 flex h-9 w-full flex-row rounded-lg p-1', className)}
      tabClassName={cn(
        'w-full text-m-base font-medium text-gray-100 data-[active=true]:text-gray-0',
        tabClassName,
      )}
      indicatorClassName={cn('w-full rounded-md bg-brand-100', indicatorClassName)}
    />
  );
};
