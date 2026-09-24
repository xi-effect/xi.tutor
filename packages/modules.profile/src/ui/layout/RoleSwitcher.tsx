import { useTranslation } from 'react-i18next';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { type RoleT } from 'common.types';
import { cn } from '@xipkg/utils';
import { switcherTabClass } from 'common.ui';

type RoleSwitcherProps = {
  value: RoleT;
  onChange: (value: RoleT) => void;
  className?: string;
};

export const RoleSwitcher = ({ value, onChange, className }: RoleSwitcherProps) => {
  const { t } = useTranslation('profile');

  const tabs = [
    { id: 'tutor', label: t('role.tutor') },
    { id: 'student', label: t('role.student') },
  ];

  return (
    <SwitcherAnimate
      tabs={tabs}
      activeTab={value}
      onChange={(next) => onChange(next as RoleT)}
      className={cn('bg-background-page flex h-9 w-full flex-row rounded-lg p-1', className)}
      tabClassName={cn(switcherTabClass, 'text-m-base w-full font-medium')}
      indicatorClassName="w-full rounded-md bg-action-primary-background-pressed"
    />
  );
};
