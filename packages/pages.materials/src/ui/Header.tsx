import { SwitcherAnimate } from '@xipkg/switcher-animate';
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
    <div className="flex flex-row items-center pb-4">
      <h1 className="text-2xl font-normal text-gray-100">Материалы</h1>

      <div className="ml-4 flex h-[32px] flex-row items-center gap-2">
        <SwitcherAnimate
          tabs={tabs}
          activeTab={activeTab}
          onChange={onTabChange}
          className="flex h-[32px] w-70 flex-row gap-4 rounded-lg"
          tabClassName="text-m-base font-medium text-gray-100 h-[28px]"
          indicatorClassName="rounded-md"
        />
      </div>

      <div className="ml-auto flex items-center">
        <MaterialsAdd onlyDrafts />
      </div>
    </div>
  );
};
