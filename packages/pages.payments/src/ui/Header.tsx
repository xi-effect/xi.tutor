import { Button } from '@xipkg/button';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { useCurrentUser } from 'common.services';
import { Plus } from '@xipkg/icons';
import { useMemo } from 'react';

const baseTabs = [
  { id: 'invoices', label: 'Журнал оплат' },
  { id: 'templates', label: 'Типы оплат' },
];

interface HeaderProps {
  onCreateInvoice: () => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Header = ({ onCreateInvoice, activeTab, onTabChange }: HeaderProps) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const tabs = useMemo(
    () => (isTutor ? baseTabs : baseTabs.filter((t) => t.id !== 'templates')),
    [isTutor],
  );

  return (
    <div className="xs:flex-row xs:items-center flex flex-col items-start pb-4">
      <h1 className="text-2xl font-normal text-gray-100">Контроль оплат</h1>

      <div className="xs:mt-0 xs:ml-4 xs:w-auto mt-2 flex h-[32px] w-full flex-row items-center gap-2">
        <SwitcherAnimate
          tabs={tabs}
          activeTab={activeTab}
          onChange={onTabChange}
          className="xs:w-70 flex h-[32px] w-full flex-row gap-4 rounded-lg"
          tabClassName="text-m-base h-[28px] flex-1 font-medium text-gray-100 xs:flex-none"
          indicatorClassName="rounded-md"
        />
      </div>
      {user?.default_layout === 'tutor' && (
        <div className="xs:flex ml-auto hidden flex-row items-center gap-2">
          <Button
            size="s"
            className="text-s-base text-gray-0 xs:px-4 rounded-lg px-2 py-2 font-medium"
            onClick={onCreateInvoice}
          >
            <span className="xs:flex hidden">Создать счёт на оплату</span>
            <Plus size="sm" className="fill-brand-0 xs:hidden flex" />
          </Button>
        </div>
      )}
    </div>
  );
};
