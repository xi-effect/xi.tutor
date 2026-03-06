import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { MaterialsAdd } from 'features.materials.add';

const tabs = [
  { id: 'boards', label: 'Учебные доски' },
  { id: 'notes', label: 'Заметки' },
];

interface HeaderProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  return (
    <div className="flex flex-row items-center pt-6 pr-6 pb-4 pl-4">
      <h1 className="text-2xl font-semibold text-gray-100">Материалы</h1>

      <div className="ml-4 flex flex-row items-center gap-2">
        <SwitcherAnimate
          tabs={tabs}
          activeTab={activeTab}
          onChange={onTabChange}
          className="flex w-70 flex-row gap-4"
          tabClassName="text-m-base font-medium text-gray-100"
        />
      </div>

      <MaterialsAdd onlyDrafts />
    </div>
  );
};
