import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { switcherTabClass } from 'common.ui';
import { cn } from '@xipkg/utils';
import { MaterialsAdd } from 'features.materials.add';

const tabs = [
  { id: 'boards', label: 'Доски' },
  { id: 'notes', label: 'Заметки' },
];

interface HeaderProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  return (
    <div className="xs:flex-row xs:items-center flex flex-col items-start pb-4">
      <h1 className="text-2xl font-normal text-gray-100">Материалы</h1>

      <div className="xs:mt-0 xs:ml-4 xs:w-auto mt-2 flex h-[32px] w-full flex-row items-center gap-2">
        <SwitcherAnimate
          tabs={tabs}
          activeTab={activeTab}
          onChange={onTabChange}
          className="xs:w-auto flex h-[32px] w-full flex-row gap-4 rounded-lg"
          tabClassName={cn(
            switcherTabClass,
            'text-m-base h-[28px] flex-1 font-medium xs:flex-none xs:px-3',
          )}
          indicatorClassName="rounded-md"
        />
      </div>

      <div className="xs:flex ml-auto hidden items-center">
        <MaterialsAdd onlyDrafts />
      </div>
    </div>
  );
};
